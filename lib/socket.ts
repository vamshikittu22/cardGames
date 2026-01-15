
import { Room, Player, GameCard, ChatMessage, LogEntry, WinCondition } from '../types';
import { generateId, generateRoomCode, createMasterDeck, createAssuraPool, createGenerals, shuffle, getRandomColor, validateAssuraRequirement } from '../utils';

class GameSocketBridge {
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private authoritativeRoom: Room | null = null;
  private channel: BroadcastChannel;
  public connected: boolean = true;
  private isProcessingAI: boolean = false;

  constructor() {
    this.channel = new BroadcastChannel('tales_of_dharma_auth_v23');
    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'BROADCAST_STATE') {
        this.handleStateUpdate(data);
      } else if (this.listeners[type]) {
        this.listeners[type].forEach(cb => cb(data));
      }
    };
    setInterval(() => { this.connected = navigator.onLine; }, 2000);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    // Artificial latency for realism
    setTimeout(() => { this.processAuthoritativeAction(event, data); }, 100);
  }

  private handleStateUpdate(data: { room: Room }) {
    this.authoritativeRoom = data.room;
    if (this.listeners['room_updated']) {
      this.listeners['room_updated'].forEach(cb => cb({ room: data.room }));
    }
  }

  private broadcast(room: Room) {
    const nextRoom = JSON.parse(JSON.stringify(room));
    this.authoritativeRoom = nextRoom;
    this.channel.postMessage({ type: 'BROADCAST_STATE', data: { room: nextRoom } });
    if (this.listeners['room_updated']) {
      this.listeners['room_updated'].forEach(cb => cb({ room: nextRoom }));
    }
    
    // Trigger Bot AI if it's their turn
    const activePlayer = room.players[room.activePlayerIndex];
    if (room.status === 'in-game' && activePlayer.id.startsWith('bot-')) {
      this.triggerBotTurn();
    }
  }

  private triggerBotTurn() {
    if (this.isProcessingAI) return;
    this.isProcessingAI = true;

    const executeBotStep = () => {
      const room = this.authoritativeRoom;
      if (!room || room.status !== 'in-game') {
        this.isProcessingAI = false;
        return;
      }

      const bot = room.players[room.activePlayerIndex];
      if (!bot || !bot.id.startsWith('bot-')) {
        this.isProcessingAI = false;
        return;
      }

      // --- BOT STRATEGY LOOP ---
      // 1. Can we capture an Assura?
      if (bot.karmaPoints >= 2) {
        for (const assura of room.assuras) {
          if (validateAssuraRequirement(bot.sena, assura.requirement || '')) {
            const roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
            const isCaptured = roll >= (assura.captureRange?.[0] || 7);
            this.handleGameLogic(room, 'CAPTURE_RESULT', { cardId: assura.id, isCaptured, cost: 2 }, bot.id);
            this.broadcast(room);
            setTimeout(executeBotStep, 1500);
            return;
          }
        }
      }

      // 2. Can we play a Major?
      const majorIdx = bot.hand.findIndex(c => c.type === 'Major');
      if (majorIdx !== -1 && bot.karmaPoints >= 1) {
        this.handleGameLogic(room, 'PLAY_CARD', { cardId: bot.hand[majorIdx].id, cost: 1 }, bot.id);
        this.broadcast(room);
        setTimeout(executeBotStep, 1000);
        return;
      }

      // 3. Can we play an Astra or Curse? (Simplified AI: target randomly)
      const astraIdx = bot.hand.findIndex(c => c.type === 'Astra');
      if (astraIdx !== -1 && bot.karmaPoints >= 1 && bot.sena.length > 0) {
        this.handleGameLogic(room, 'PLAY_CARD', { 
          cardId: bot.hand[astraIdx].id, 
          cost: 1, 
          targetInfo: { playerId: bot.id, cardId: bot.sena[0].id } 
        }, bot.id);
        this.broadcast(room);
        setTimeout(executeBotStep, 1000);
        return;
      }

      // 4. Draw if nothing else and have KP
      if (bot.karmaPoints >= 1 && bot.hand.length < 7 && room.drawDeck.length > 0) {
        this.handleGameLogic(room, 'DRAW_CARD', {}, bot.id);
        this.broadcast(room);
        setTimeout(executeBotStep, 1000);
        return;
      }

      // 5. Out of KP or logical moves -> END TURN
      this.handleGameLogic(room, 'END_TURN', {}, bot.id);
      this.isProcessingAI = false;
      this.broadcast(room);
    };

    setTimeout(executeBotStep, 1500);
  }

  private processAuthoritativeAction(event: string, data: any) {
    let room: Room = this.authoritativeRoom ? JSON.parse(JSON.stringify(this.authoritativeRoom)) : {} as Room;

    switch (event) {
      case 'create_room':
        const code = generateRoomCode();
        const pId = generateId();
        sessionStorage.setItem('dharma_player_id', pId);
        const newRoom: Room = {
          roomCode: code, roomName: data.roomName, maxPlayers: data.maxPlayers,
          players: [{
            id: pId, name: data.playerName, color: data.color, isReady: false, isCreator: true, isConnected: true,
            karmaPoints: 3, hand: [], sena: [], jail: []
          }],
          status: 'waiting', createdAt: Date.now(), messages: [], currentTurn: 1, turnStartTime: Date.now(),
          activePlayerIndex: 0, assuras: [], assuraReserve: [], gameLogs: [], actionsUsedThisTurn: [],
          drawDeck: [], submergePile: [], shaknyModifiers: []
        };
        if (data.isSinglePlayer) {
          const names = ['Agni Bot', 'Varuna Bot', 'Soma Bot'];
          for (let i = 0; i < data.maxPlayers - 1; i++) {
            newRoom.players.push({
              id: `bot-${generateId()}`, name: names[i % names.length], color: getRandomColor(), isReady: true,
              isCreator: false, isConnected: true, karmaPoints: 0, hand: [], sena: [], jail: []
            });
          }
          this.initializeGame(newRoom);
        }
        this.broadcast(newRoom);
        break;

      case 'join_room':
        if (room && room.roomCode === data.roomCode) {
          const joinId = generateId();
          sessionStorage.setItem('dharma_player_id', joinId);
          room.players.push({
            id: joinId, name: data.playerName, color: data.color, isReady: false, isCreator: false, isConnected: true,
            karmaPoints: 0, hand: [], sena: [], jail: []
          });
          this.broadcast(room);
        }
        break;

      case 'game_action':
        this.handleGameLogic(room, data.actionType, data.payload, data.playerId);
        this.broadcast(room);
        break;

      case 'chat_message':
        room.messages.push({ id: generateId(), playerId: data.playerId, playerName: data.playerName, text: data.text, timestamp: Date.now() });
        this.broadcast(room);
        break;

      case 'start_game':
        this.initializeGame(room);
        this.broadcast(room);
        break;

      case 'toggle_ready':
        room.players = room.players.map(p => p.id === data.playerId ? { ...p, isReady: !p.isReady } : p);
        this.broadcast(room);
        break;

      case 'reset_room':
        room.status = 'waiting';
        room.players = room.players.map(p => ({ ...p, isReady: false, hand: [], sena: [], jail: [] }));
        room.currentTurn = 1;
        this.broadcast(room);
        break;
    }
  }

  private initializeGame(room: Room) {
    const deck = createMasterDeck();
    const assuras = createAssuraPool();
    const generals = shuffle(createGenerals());
    room.players = room.players.map((p, i) => ({
      ...p, hand: [generals[i % generals.length], ...deck.splice(0, 5)],
      karmaPoints: i === 0 ? 3 : 0, isReady: true, sena: [], jail: []
    }));
    room.status = 'in-game';
    room.drawDeck = deck;
    room.assuras = assuras.splice(0, 3);
    room.assuraReserve = assuras;
    room.activePlayerIndex = 0;
    room.turnStartTime = Date.now();
  }

  private handleGameLogic(room: Room, type: string, payload: any, pId: string) {
    const pIdx = room.players.findIndex(p => p.id === pId);
    if (pIdx === -1) return;
    const player = room.players[pIdx];
    const isActive = room.activePlayerIndex === pIdx;

    switch (type) {
      case 'DRAW_CARD':
        if (!isActive || player.karmaPoints < 1) return;
        const c = room.drawDeck.shift();
        if (c) {
          player.hand = [...player.hand, c];
          player.karmaPoints -= 1;
          room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: 'invoked a new manifestation', kpSpent: 1, timestamp: Date.now() });
        }
        break;

      case 'CAPTURE_RESULT':
        const capCost = payload.cost ?? 2;
        if (!isActive || player.karmaPoints < capCost) return;
        player.karmaPoints -= capCost;
        
        const assura = room.assuras.find(a => a.id === payload.cardId);
        if (payload.isCaptured && assura) {
          player.jail = [...player.jail, assura];
          room.assuras = room.assuras.filter(a => a.id !== assura.id);
          if (room.assuraReserve.length > 0) {
            room.assuras.push(room.assuraReserve.shift()!);
          }
          room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: `captured the Assura ${assura.name}`, kpSpent: capCost, timestamp: Date.now() });
        } else if (assura) {
          room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: `failed to capture ${assura.name}`, kpSpent: capCost, timestamp: Date.now() });
        }
        this.checkWinConditions(room);
        break;

      case 'PLAY_CARD':
        const playCost = payload.cost ?? 1;
        if (!isActive || player.karmaPoints < playCost) return;
        const cardInHandIdx = player.hand.findIndex(i => i.id === payload.cardId);
        if (cardInHandIdx === -1) return;
        
        const cardToPlay = player.hand.splice(cardInHandIdx, 1)[0];
        player.karmaPoints -= playCost;

        if (cardToPlay.type === 'Major') {
          player.sena = [...player.sena, { ...cardToPlay, attachedAstras: [], curses: [] }];
          room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: `summoned ${cardToPlay.name} to the Sena`, kpSpent: playCost, timestamp: Date.now() });
        } else if (payload.targetInfo) {
          const targetPlayer = room.players.find(p => p.id === payload.targetInfo.playerId);
          const targetCard = targetPlayer?.sena.find(c => c.id === payload.targetInfo.cardId);
          if (targetCard) {
            if (cardToPlay.type === 'Curse') targetCard.curses = [...(targetCard.curses || []), cardToPlay];
            else if (cardToPlay.type === 'Astra') targetCard.attachedAstras = [...(targetCard.attachedAstras || []), cardToPlay];
            else if (cardToPlay.type === 'Maya') {
              room.submergePile.push(cardToPlay);
              // Maya effect logic can be expanded here
            }
            room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: `manifested ${cardToPlay.name} upon ${targetCard.name}`, kpSpent: playCost, timestamp: Date.now() });
          }
        } else {
          room.submergePile.push(cardToPlay);
          room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: `manifested ${cardToPlay.name}`, kpSpent: playCost, timestamp: Date.now() });
        }
        this.checkWinConditions(room);
        break;

      case 'END_TURN':
        if (!isActive) return;
        room.gameLogs.push({ id: generateId(), turn: room.currentTurn, playerName: player.name, action: 'concluded manifestations', kpSpent: 0, timestamp: Date.now() });
        
        // Advance Turn
        room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
        room.currentTurn += 1;
        room.turnStartTime = Date.now();
        
        // Reset KP for NEXT player
        room.players[room.activePlayerIndex].karmaPoints = 3;
        break;
    }
  }

  private checkWinConditions(room: Room) {
    for (const p of room.players) {
      if (p.jail.length >= 3) {
        room.status = 'finished';
        room.winner = { id: p.id, name: p.name, color: p.color, condition: 'assura-capture', timestamp: Date.now() };
        return;
      }
      const classes = new Set(p.sena.map(m => m.classSymbol).filter(Boolean));
      if (classes.size >= 6) {
        room.status = 'finished';
        room.winner = { id: p.id, name: p.name, color: p.color, condition: 'class-completion', timestamp: Date.now() };
        return;
      }
    }
  }
}
export const socket = new GameSocketBridge();

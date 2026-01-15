import { Room, Player, GameCard, ChatMessage, LogEntry, WinCondition } from '../types';
import { generateId, generateRoomCode, createMasterDeck, createAssuraPool, createGenerals, shuffle, getRandomColor, validateAssuraRequirement } from '../utils';
import { safeSessionStorage } from '../utils/safeStorage';

class GameSocketBridge {
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private authoritativeRoom: Room | null = null;
  private channel: BroadcastChannel | null = null;
  public connected: boolean = true;
  private isProcessingAI: boolean = false;

  constructor() {
    try {
      this.channel = new BroadcastChannel('tales_of_dharma_sync_v24');
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'BROADCAST_STATE') {
          this.handleStateUpdate(data);
        } else if (type === 'JOIN_REQUEST') {
          if (this.authoritativeRoom && this.authoritativeRoom.roomCode === data.roomCode) {
            this.processJoin(data);
          }
        } else if (this.listeners[type]) {
          this.listeners[type].forEach(cb => cb(data));
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel access denied. Multiplayer synchronization limited to local tab.', e);
      this.channel = null;
    }

    setInterval(() => { this.connected = navigator.onLine; }, 2000);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    if (event === 'join_room' && !this.authoritativeRoom) {
      try {
        if (this.channel) {
          this.channel.postMessage({ type: 'JOIN_REQUEST', data });
        }
      } catch (e) {
        console.error('Failed to post message to channel:', e);
      }
      return;
    }
    setTimeout(() => { this.processAuthoritativeAction(event, data); }, 50);
  }

  private handleStateUpdate(data: { room: Room; targetedPlayerId?: string }) {
    const localId = safeSessionStorage.getItem('dharma_player_id');
    this.authoritativeRoom = data.room;

    if (this.listeners['room_updated']) {
      this.listeners['room_updated'].forEach(cb => cb({ 
        room: data.room, 
        currentPlayerId: data.targetedPlayerId === localId ? localId : undefined 
      }));
    }
  }

  private broadcast(room: Room, targetedPlayerId?: string) {
    const nextRoom = JSON.parse(JSON.stringify(room));
    this.authoritativeRoom = nextRoom;
    
    try {
      if (this.channel) {
        this.channel.postMessage({ 
          type: 'BROADCAST_STATE', 
          data: { room: nextRoom, targetedPlayerId } 
        });
      }
    } catch (e) {
      console.warn('Broadcast failed:', e);
    }

    if (this.listeners['room_updated']) {
      this.listeners['room_updated'].forEach(cb => cb({ room: nextRoom }));
    }
    
    const activePlayer = room.players[room.activePlayerIndex];
    if (room.status === 'in-game' && activePlayer.id.startsWith('bot-')) {
      this.triggerBotTurn();
    }
  }

  private processJoin(data: any) {
    if (!this.authoritativeRoom) return;
    
    if (this.authoritativeRoom.players.length >= this.authoritativeRoom.maxPlayers) {
      try {
        if (this.channel) this.channel.postMessage({ type: 'error', data: 'The realm is at capacity.' });
      } catch (e) {}
      return;
    }

    const joinId = generateId();
    this.authoritativeRoom.players.push({
      id: joinId, 
      name: data.playerName, 
      color: data.color, 
      isReady: false, 
      isCreator: false, 
      isConnected: true,
      karmaPoints: 0, 
      hand: [], 
      sena: [], 
      jail: []
    });

    this.broadcast(this.authoritativeRoom, joinId);
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

      const majorIdx = bot.hand.findIndex(c => c.type === 'Major');
      if (majorIdx !== -1 && bot.karmaPoints >= 1) {
        this.handleGameLogic(room, 'PLAY_CARD', { cardId: bot.hand[majorIdx].id, cost: 1 }, bot.id);
        this.broadcast(room);
        setTimeout(executeBotStep, 1000);
        return;
      }

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
        safeSessionStorage.setItem('dharma_player_id', pId);
        
        const newRoom: Room = {
          roomCode: code, 
          roomName: data.roomName, 
          maxPlayers: data.maxPlayers,
          players: [{
            id: pId, name: data.playerName, color: data.color, isReady: false, isCreator: true, isConnected: true,
            karmaPoints: 3, hand: [], sena: [], jail: []
          }],
          status: 'waiting', 
          createdAt: Date.now(), 
          messages: [], 
          currentTurn: 1, 
          turnStartTime: Date.now(),
          activePlayerIndex: 0, 
          assuras: [], 
          assuraReserve: [], 
          gameLogs: [], 
          actionsUsedThisTurn: [],
          drawDeck: [], 
          submergePile: [], 
          shaknyModifiers: []
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
        
        this.broadcast(newRoom, pId);
        break;

      case 'game_action':
        this.handleGameLogic(room, data.actionType, data.payload, data.playerId);
        this.broadcast(room);
        break;

      case 'chat_message':
        room.messages.push({ 
          id: generateId(), 
          playerId: data.playerId, 
          playerName: data.playerName, 
          text: data.text, 
          timestamp: Date.now() 
        });
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
        room.winner = undefined;
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
      ...p, 
      hand: [generals[i % generals.length], ...deck.splice(0, 5)],
      karmaPoints: i === 0 ? 3 : 0, 
      isReady: true, 
      sena: [], 
      jail: []
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
        }
        this.checkWinConditions(room);
        break;

      case 'END_TURN':
        if (!isActive) return;
        room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
        room.currentTurn += 1;
        room.turnStartTime = Date.now();
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
    }
  }
}

export const socket = new GameSocketBridge();
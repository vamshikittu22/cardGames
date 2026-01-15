
import { Room, Player, GameCard, ChatMessage, LogEntry, WinCondition } from '../types';
import { generateId, generateRoomCode, createMasterDeck, createAssuraPool, createGenerals, shuffle, getRandomColor } from '../utils';

/**
 * GameSocketBridge: The authoritative game engine running via BroadcastChannel.
 * Populates single-player rooms with AI bots to ensure gameplay features (like Curses) work.
 */
class GameSocketBridge {
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private authoritativeRoom: Room | null = null;
  private channel: BroadcastChannel;
  public connected: boolean = true;

  constructor() {
    this.channel = new BroadcastChannel('tales_of_dharma_final_v9');
    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'BROADCAST_STATE') {
        this.handleStateUpdate(data);
      } else if (this.listeners[type]) {
        this.listeners[type].forEach(cb => cb(data));
      }
    };

    setInterval(() => {
      this.connected = navigator.onLine;
    }, 2000);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    setTimeout(() => {
      this.processAuthoritativeAction(event, data);
    }, 50);
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
  }

  private processAuthoritativeAction(event: string, data: any) {
    if (!this.authoritativeRoom && event !== 'create_room') return;
    
    let room: Room = this.authoritativeRoom ? JSON.parse(JSON.stringify(this.authoritativeRoom)) : {} as Room;

    switch (event) {
      case 'create_room':
        const code = generateRoomCode();
        const pId = generateId();
        sessionStorage.setItem('dharma_player_id', pId);
        
        const newRoom: Room = {
          roomCode: code,
          roomName: data.roomName,
          maxPlayers: data.maxPlayers,
          players: [{
            id: pId,
            name: data.playerName,
            color: data.color,
            isReady: false,
            isCreator: true,
            isConnected: true,
            karmaPoints: 3,
            hand: [],
            sena: [],
            jail: []
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
          // Add AI Bots (Guardians) to fill the room
          const botNames = ['Dharma Guardian', 'Ancient Seeker', 'Ethereal Monk', 'Celestial Scribe', 'Silent Warrior'];
          const botsNeeded = data.maxPlayers - 1;
          for (let i = 0; i < botsNeeded; i++) {
            newRoom.players.push({
              id: `bot-${generateId()}`,
              name: botNames[i % botNames.length],
              color: getRandomColor(),
              isReady: true,
              isCreator: false,
              isConnected: true,
              karmaPoints: 3,
              hand: [],
              sena: [],
              jail: []
            });
          }
          this.initializeGame(newRoom);
        }

        this.broadcast(newRoom);
        if (this.listeners['room_updated']) {
          this.listeners['room_updated'].forEach(cb => cb({ room: newRoom, currentPlayerId: pId }));
        }
        break;

      case 'join_room':
        if (room.roomCode === data.roomCode) {
          if (room.players.length >= room.maxPlayers) {
            this.emitToLocal('error', 'The realm is full.');
            return;
          }
          const joinId = generateId();
          sessionStorage.setItem('dharma_player_id', joinId);
          room.players.push({
            id: joinId,
            name: data.playerName,
            color: data.color,
            isReady: false,
            isCreator: false,
            isConnected: true,
            karmaPoints: 3,
            hand: [],
            sena: [],
            jail: []
          });
          this.broadcast(room);
          if (this.listeners['room_updated']) {
            this.listeners['room_updated'].forEach(cb => cb({ room, currentPlayerId: joinId }));
          }
        } else {
          this.emitToLocal('error', 'Room not found.');
        }
        break;

      case 'toggle_ready':
        room.players = room.players.map(p => p.id === data.playerId ? { ...p, isReady: !p.isReady } : p);
        this.broadcast(room);
        break;

      case 'start_game':
        this.initializeGame(room);
        this.broadcast(room);
        break;

      case 'game_action':
        this.handleGameLogic(room, data.actionType, data.payload, data.playerId);
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

      case 'reset_room':
        room.status = 'waiting';
        room.winner = undefined;
        room.players = room.players.map(p => ({ ...p, isReady: false, hand: [], sena: [], jail: [] }));
        room.currentTurn = 1;
        room.gameLogs = [];
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
      karmaPoints: 3,
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
    const playerIndex = room.players.findIndex(p => p.id === pId);
    if (playerIndex === -1) return;
    const player = room.players[playerIndex];
    const isActive = room.activePlayerIndex === playerIndex;

    switch (type) {
      case 'DRAW_CARD':
        if (!isActive || player.karmaPoints < 1) return;
        const card = room.drawDeck.shift();
        if (card) {
          player.hand.push(card);
          player.karmaPoints -= 1;
          room.gameLogs.push({ 
            id: generateId(), turn: room.currentTurn, playerName: player.name, 
            action: 'drew a card from the Cosmos', kpSpent: 1, timestamp: Date.now() 
          });
        }
        break;

      case 'PLAY_CARD':
        const cost = payload.cost || 0;
        if (!isActive || player.karmaPoints < cost) return;
        const cardIdx = player.hand.findIndex(c => c.id === payload.cardId);
        if (cardIdx === -1) return;
        const played = player.hand.splice(cardIdx, 1)[0];
        player.karmaPoints -= cost;

        if (played.type === 'Major') {
          player.sena = [...player.sena, played];
          room.gameLogs.push({ 
            id: generateId(), turn: room.currentTurn, playerName: player.name, 
            action: `deployed ${played.name} to the Sena Forces`, kpSpent: cost, timestamp: Date.now() 
          });
        } else if (payload.targetInfo) {
           const targetPlayer = room.players.find(p => p.id === payload.targetInfo.playerId);
           const targetCard = targetPlayer?.sena.find(c => c.id === payload.targetInfo.cardId);
           if (targetCard) {
             if (played.type === 'Astra') targetCard.attachedAstras = [...targetCard.attachedAstras, played];
             if (played.type === 'Curse') targetCard.curses = [...targetCard.curses, played];
             room.gameLogs.push({ 
               id: generateId(), turn: room.currentTurn, playerName: player.name, 
               action: `played ${played.name} on ${targetCard.name}`, kpSpent: cost, timestamp: Date.now() 
             });
           }
        } else {
          room.submergePile.push(played);
        }
        this.checkWinConditions(room);
        break;

      case 'END_TURN':
        if (!isActive) return;
        room.gameLogs.push({ 
          id: generateId(), turn: room.currentTurn, playerName: player.name, 
          action: 'concluded their turn', kpSpent: 0, timestamp: Date.now() 
        });

        room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
        room.currentTurn += 1;
        room.turnStartTime = Date.now();
        
        const nextPlayer = room.players[room.activePlayerIndex];
        nextPlayer.karmaPoints = Math.min(10, nextPlayer.karmaPoints + 3);
        
        room.players.forEach(p => p.sena.forEach(m => m.invokedThisTurn = false));
        break;

      case 'CAPTURE_RESULT':
        const assura = room.assuras.find(a => a.id === payload.cardId);
        if (payload.isCaptured && assura) {
           player.jail.push(assura);
           room.assuras = room.assuras.filter(a => a.id !== payload.cardId);
           if (room.assuraReserve.length > 0) room.assuras.push(room.assuraReserve.shift()!);
           player.karmaPoints -= 2;
           room.gameLogs.push({ 
             id: generateId(), turn: room.currentTurn, playerName: player.name, 
             action: `captured ${assura.name}!`, kpSpent: 2, timestamp: Date.now() 
           });
        } else {
           player.karmaPoints -= 2;
           room.gameLogs.push({ 
             id: generateId(), turn: room.currentTurn, playerName: player.name, 
             action: `failed to capture ${assura?.name || 'Assura'}`, kpSpent: 2, timestamp: Date.now() 
           });
        }
        this.checkWinConditions(room);
        break;
    }
    this.broadcast(room);
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

  private emitToLocal(event: string, data: any) {
    if (this.listeners[event]) this.listeners[event].forEach(cb => cb(data));
  }
}

export const socket = new GameSocketBridge();

import { Room, Player, GameCard, ChatMessage, LogEntry, WinCondition } from './types';
import { generateId, generateRoomCode, createMasterDeck, createAssuraPool, createGenerals, shuffle, validateAssuraRequirement } from './utils';
import { safeSessionStorage } from './utils/safeStorage';

class GameSocketBridge {
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private authoritativeRoom: Room | null = null;
  private channel: BroadcastChannel | null = null;
  public connected: boolean = true;

  constructor() {
    try {
      this.channel = new BroadcastChannel('tales_of_dharma_sync');
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'BROADCAST_STATE') {
          this.handleStateUpdate(data);
        } else if (this.listeners[type]) {
          this.listeners[type].forEach(cb => cb(data));
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel access denied.', e);
      this.channel = null;
    }

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
    }, 120);
  }

  private handleStateUpdate(data: { room: Room }) {
    this.authoritativeRoom = data.room;
    if (this.listeners['room_updated']) {
      this.listeners['room_updated'].forEach(cb => cb({ room: data.room }));
    }
  }

  private broadcast(room: Room) {
    this.authoritativeRoom = room;
    try {
      if (this.channel) {
        this.channel.postMessage({ type: 'BROADCAST_STATE', data: { room } });
      }
    } catch (e) { }
    if (this.listeners['room_updated']) {
      this.listeners['room_updated'].forEach(cb => cb({ room }));
    }
  }

  private processAuthoritativeAction(event: string, data: any) {
    let room = this.authoritativeRoom;

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
          this.initializeGame(newRoom);
        }
        if (this.listeners['room_updated']) {
          this.listeners['room_updated'].forEach(cb => cb({ room: newRoom, currentPlayerId: pId }));
        }
        this.broadcast(newRoom);
        break;

      case 'join_room':
        if (room && room.roomCode === data.roomCode) {
          if (room.players.length >= room.maxPlayers) {
            this.emitToLocal('error', 'The realm is full.');
            return;
          }
          const joinId = generateId();
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
          if (this.listeners['room_updated']) {
            this.listeners['room_updated'].forEach(cb => cb({ room, currentPlayerId: joinId }));
          }
          this.broadcast(room);
        } else {
          this.emitToLocal('error', 'Room not found.');
        }
        break;

      case 'toggle_ready':
        if (!room) return;
        room.players = room.players.map(p => p.id === data.playerId ? { ...p, isReady: !p.isReady } : p);
        this.broadcast(room);
        break;

      case 'chat_message':
        if (!room) return;
        const msg: ChatMessage = {
          id: generateId(),
          playerId: data.playerId,
          playerName: data.playerName,
          text: data.text,
          timestamp: Date.now()
        };
        room.messages = [...room.messages, msg];
        this.broadcast(room);
        break;

      case 'start_game':
        if (!room) return;
        this.initializeGame(room);
        this.broadcast(room);
        break;

      case 'game_action':
        this.handleGameLogic(data.actionType, data.payload, data.playerId);
        break;

      case 'reset_room':
        if (!room) return;
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
      isReady: true
    }));

    room.status = 'in-game';
    room.drawDeck = deck;
    room.assuras = assuras.splice(0, 3);
    room.assuraReserve = assuras;
    room.activePlayerIndex = 0;
    room.turnStartTime = Date.now();
  }

  private handleGameLogic(type: string, payload: any, pId: string) {
    let room = this.authoritativeRoom;
    if (!room) return;
    const player = room.players.find(p => p.id === pId);
    if (!player) return;

    const activePlayer = room.players[room.activePlayerIndex];
    const isTurn = activePlayer.id === pId;

    switch (type) {
      case 'DRAW_CARD':
        if (!isTurn || player.karmaPoints < 1) return;
        if (room.drawDeck.length === 0) {
          if (room.submergePile.length === 0) return;
          room.drawDeck = shuffle(room.submergePile);
          room.submergePile = [];
        }
        const card = room.drawDeck.shift()!;
        player.hand = [...player.hand, card];
        player.karmaPoints -= 1;
        room.gameLogs.push({
          id: generateId(), turn: room.currentTurn, playerName: player.name,
          action: 'drew a card from the Cosmos', kpSpent: 1, timestamp: Date.now()
        });
        break;

      case 'PLAY_CARD':
        const cardCost = payload.cost || 0;
        if (player.karmaPoints < cardCost) return;
        const cardIndex = player.hand.findIndex(c => c.id === payload.cardId);
        if (cardIndex === -1) return;
        const cardToPlay = player.hand.splice(cardIndex, 1)[0];
        player.karmaPoints -= cardCost;

        if (cardToPlay.type === 'Major') {
          player.sena = [...player.sena, cardToPlay];
        } else if (payload.targetInfo) {
          const { playerId: tPid, cardId: tCid } = payload.targetInfo;
          // Create a fresh copy of players to ensure state update
          room.players = room.players.map(p => {
            if (p.id !== tPid) return p;
            return {
              ...p,
              sena: p.sena.map(c => {
                if (c.id !== tCid) return c;
                // Add to the appropriate array based on type
                if (cardToPlay.type === 'Astra') {
                  return { ...c, attachedAstras: [...c.attachedAstras, cardToPlay] };
                } else if (cardToPlay.type === 'Curse') {
                  return { ...c, curses: [...c.curses, cardToPlay] };
                } else if (cardToPlay.type === 'Maya') {
                  return { ...c, mayas: [...c.mayas, cardToPlay] };
                }
                return c;
              })
            };
          });
        } else {
          room.submergePile = [...room.submergePile, cardToPlay];
        }

        room.gameLogs.push({
          id: generateId(), turn: room.currentTurn, playerName: player.name,
          action: `played ${cardToPlay.name}`, kpSpent: cardCost, timestamp: Date.now()
        });
        this.checkWinConditions(room);
        break;

      case 'END_TURN':
        if (!isTurn) return;
        room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
        room.currentTurn += 1;
        room.turnStartTime = Date.now();
        room.actionsUsedThisTurn = [];
        room.players.forEach((p, idx) => {
          if (idx === room.activePlayerIndex) p.karmaPoints = Math.min(10, p.karmaPoints + 3);
        });
        break;

      case 'CAPTURE_RESULT':
        const { isCaptured, cardId } = payload;
        const target = room.assuras.find(a => a.id === cardId);
        if (isCaptured && target) {
          player.jail = [...player.jail, target];
          room.assuras = room.assuras.filter(a => a.id !== cardId);
          if (room.assuraReserve.length > 0) room.assuras.push(room.assuraReserve.shift()!);
          room.gameLogs.push({
            id: generateId(), turn: room.currentTurn, playerName: player.name,
            action: `captured ${target.name}`, kpSpent: 0, timestamp: Date.now()
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
    }
  }

  private emitToLocal(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  public setLocalState(room: Room) {
    this.authoritativeRoom = room;
  }
}

export const socket = new GameSocketBridge();
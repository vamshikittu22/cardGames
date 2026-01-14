
export type RoomStatus = 'waiting' | 'in-game' | 'finished';

export type CardType = 'Major' | 'Astra' | 'Curse' | 'Maya' | 'Shakny' | 'Clash' | 'Assura' | 'General';

export type PowerEffectType = 'draw' | 'kp' | 'protection' | 'damage' | 'none';

export type WinCondition = 'assura-capture' | 'class-completion';

export interface WinnerInfo {
  id: string;
  name: string;
  color: string;
  condition: WinCondition;
  timestamp: number;
}

export interface GameCard {
  id: string;
  type: CardType;
  name: string;
  description: string;
  illustration?: string;
  // Specific for Assura
  requirement?: string;
  captureRange?: [number, number];
  retaliationRange?: [number, number];
  safeZone?: [number, number];
  // Specific for Major
  classSymbol?: string;
  attachedAstras: GameCard[];
  curses: GameCard[];
  // Phase 6 Power Fields
  powerName?: string;
  powerRange?: [number, number];
  powerEffectType?: PowerEffectType;
  invokedThisTurn?: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  isCreator: boolean;
  isConnected: boolean; // Tracks real-time connection status
  // Game State
  karmaPoints: number;
  hand: GameCard[];
  sena: GameCard[];
  jail: GameCard[];
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  turn: number;
  playerName: string;
  action: string;
  kpSpent: number;
  timestamp: number;
}

export interface Room {
  roomCode: string;
  roomName: string;
  maxPlayers: number;
  players: Player[];
  status: RoomStatus;
  createdAt: number;
  messages: ChatMessage[];
  // Game Board State
  currentTurn: number;
  turnStartTime: number;
  activePlayerIndex: number;
  assuras: GameCard[];
  assuraReserve: GameCard[];
  gameLogs: LogEntry[];
  actionsUsedThisTurn: string[];
  // Deck State
  drawDeck: GameCard[];
  submergePile: GameCard[];
  // Phase 8 Interrupt State
  pendingAction?: {
    actorId: string;
    card: GameCard;
    cost: number;
    targetInfo?: { playerId: string; cardId: string };
    type: 'intro' | 'astra' | 'maya' | 'curse';
  };
  interruptStatus?: {
    type: 'clash-window' | 'shakny-window';
    endTime: number;
    rollDetails?: {
      type: 'power' | 'capture';
      card: GameCard;
      playerId: string;
      attackers?: GameCard[];
      baseResult?: number;
    };
  };
  clashDuel?: {
    actorId: string;
    clasherId: string;
    actorRoll?: number;
    clasherRoll?: number;
  };
  shaknyModifiers: { playerId: string; value: number; cardName: string }[];
  // Phase 9 Victory State
  winner?: WinnerInfo;
}

export type ViewState = 'landing' | 'lobby' | 'in-game';
export type TargetingMode = 'none' | 'astra' | 'curse' | 'invoke' | 'capture-assura' | 'capture-majors' | 'clash-select' | 'shakny-select';

export type SocketEvent = 
  | 'create_room' 
  | 'join_room' 
  | 'leave_room' 
  | 'toggle_ready' 
  | 'start_game' 
  | 'chat_message'
  | 'game_action'
  | 'interrupt_action'
  | 'room_updated'
  | 'error';

export interface TutorialStep {
  title: string;
  content: string;
  target?: string;
}

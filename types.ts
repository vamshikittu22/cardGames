
export type RoomStatus = 'waiting' | 'in-game';

export type CardType = 'Major' | 'Astra' | 'Curse' | 'Maya' | 'Shakny' | 'Clash' | 'Assura' | 'General';

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
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  isCreator: boolean;
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
  gameLogs: LogEntry[];
  actionsUsedThisTurn: string[]; // Track restricted actions like 'Invoke Power'
  // Deck State
  drawDeck: GameCard[];
  submergePile: GameCard[];
}

export type ViewState = 'landing' | 'lobby' | 'in-game';
export type TargetingMode = 'none' | 'astra' | 'curse';

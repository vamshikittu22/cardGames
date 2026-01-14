
import { AVATAR_COLORS } from './constants';
import { GameCard, CardType } from './types';

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getRandomColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const MAJOR_CLASSES = ['Vanas', 'Vahas', 'Dvas', 'Davis', 'Rishies', 'Kurus'];

export const createMasterDeck = (): GameCard[] => {
  const deck: GameCard[] = [];
  
  // Phase 4 specific counts
  const counts = {
    Major: 30,  // 20-30 requested
    Astra: 20,  // 15-20 requested
    Curse: 15,  // 10-15 requested
    Maya: 15,   // 10-15 requested
    Shakny: 12, // 10-15 requested
    Clash: 12   // 10-15 requested
  };

  const pool: Record<string, { names: string[], desc: string }> = {
    Major: { 
      names: ['Arjuna', 'Bheema', 'Yudhisthira', 'Nakula', 'Sahadeva', 'Karna', 'Abhimanyu', 'Drona', 'Bhishma', 'Ashwatthama'],
      desc: 'A powerful warrior card. Can be introduced to your Sena.' 
    },
    Astra: { 
      names: ['Gandiva', 'Vajra', 'Brahmastra', 'Pasupata', 'Sudarsana', 'Agneyastra', 'Varunastra'],
      desc: 'Enhancement: Adds power or special traits to a Major.' 
    },
    Curse: { 
      names: ['Doubt', 'Weakness', 'Betrayal', 'Amnesia', 'Fatigue', 'Silence'],
      desc: 'Negative effect: Weakens an opponent\'s Major.' 
    },
    Maya: { 
      names: ['Illusion', 'Mirror Image', 'Mist', 'Shadow', 'Invisibility', 'Golden Deer'],
      desc: 'Special effect: Changes the flow of the game.' 
    },
    Shakny: { 
      names: ['Fate Flip', 'Rigged Dice', 'Chaos Roll', 'Lucky Star'],
      desc: 'Dice modifier: Changes the outcome of a roll.' 
    },
    Clash: { 
      names: ['Duel', 'Intercept', 'Parry', 'Counter-Strike'],
      desc: 'Interrupt: Cancels or reacts to an opponent\'s action.' 
    }
  };

  Object.entries(counts).forEach(([type, count]) => {
    const cardType = type as CardType;
    const info = pool[type];
    for (let i = 0; i < count; i++) {
      const name = info.names[i % info.names.length];
      deck.push({
        id: generateId(),
        type: cardType,
        name: i >= info.names.length ? `${name} II` : name,
        description: info.desc,
        classSymbol: cardType === 'Major' ? MAJOR_CLASSES[i % MAJOR_CLASSES.length] : undefined,
        attachedAstras: [],
        curses: []
      });
    }
  });

  return shuffle(deck);
};

export const createAssuraPool = (): GameCard[] => {
  const assuras: GameCard[] = [
    { id: generateId(), type: 'Assura', name: 'Ravana', description: 'Ten-headed King of Lanka.', captureRange: [10, 12], retaliationRange: [4, 6], safeZone: [1, 3], requirement: 'Vanas', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Narakasura', description: 'Demon of Pragjyotisha.', captureRange: [8, 10], retaliationRange: [3, 5], safeZone: [1, 2], requirement: 'Rishies', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Mahishasura', description: 'The Buffalo Demon.', captureRange: [9, 11], retaliationRange: [5, 7], safeZone: [1, 4], requirement: 'Kurus', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Bakashura', description: 'The Voracious Demon.', captureRange: [7, 9], retaliationRange: [2, 4], safeZone: [1, 1], requirement: 'Vahas', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Kamsa', description: 'The Tyrant of Mathura.', captureRange: [8, 11], retaliationRange: [4, 5], safeZone: [1, 2], requirement: 'Dvas', attachedAstras: [], curses: [] }
  ];
  return shuffle(assuras);
};

export const createGenerals = (): GameCard[] => {
  const names = ['Krishna', 'Shakuni', 'Vidura', 'Bhishma', 'Kunti', 'Vyasa'];
  const descs = [
    'Divine Guide. +1 KP every turn.',
    'Master of Dice. +2 to Shakny rolls.',
    'Voice of Wisdom. Draw +1 card at start.',
    'The Unbeatable. Immune to Curses.',
    'Mother of Heroes. Sena +1 defense.',
    'The Chronicler. Can replay Maya cards.'
  ];
  return names.map((name, i) => ({
    id: generateId(),
    type: 'General',
    name,
    description: descs[i],
    attachedAstras: [],
    curses: [],
    classSymbol: 'G'
  }));
};

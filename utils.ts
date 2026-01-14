
import { AVATAR_COLORS } from './constants';
import { GameCard, CardType, PowerEffectType } from './types';

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
  
  const counts = {
    Major: 30,
    Astra: 20,
    Curse: 15,
    Maya: 15,
    Shakny: 12,
    Clash: 12
  };

  const pool: Record<string, { names: string[], desc: string, powerPrefix?: string, effects?: PowerEffectType[] }> = {
    Major: { 
      names: ['Arjuna', 'Bheema', 'Yudhisthira', 'Nakula', 'Sahadeva', 'Karna', 'Abhimanyu', 'Drona', 'Bhishma', 'Ashwatthama'],
      desc: 'A powerful warrior card.',
      powerPrefix: 'Divine Strike',
      effects: ['draw', 'kp', 'damage', 'protection']
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
      desc: 'Interrupt: Challenge an opponent\'s action via 1v1 roll.' 
    }
  };

  Object.entries(counts).forEach(([type, count]) => {
    const cardType = type as CardType;
    const info = pool[type];
    for (let i = 0; i < count; i++) {
      const name = info.names[i % info.names.length];
      const card: GameCard = {
        id: generateId(),
        type: cardType,
        name: i >= info.names.length ? `${name} II` : name,
        description: info.desc,
        classSymbol: cardType === 'Major' ? MAJOR_CLASSES[i % MAJOR_CLASSES.length] : undefined,
        attachedAstras: [],
        curses: []
      };

      if (cardType === 'Major') {
        card.powerName = `${info.powerPrefix} of ${name}`;
        card.powerRange = [7, 11]; // standard range for 2d6
        card.powerEffectType = info.effects![i % info.effects!.length];
        card.invokedThisTurn = false;
        card.description = `Class: ${card.classSymbol}. Power: ${card.powerName} (${card.powerRange[0]}-${card.powerRange[1]}).`;
      }

      if (cardType === 'Shakny') {
        const mod = i % 2 === 0 ? 2 : -2;
        card.description = `Modify any dice roll result by ${mod > 0 ? '+' : ''}${mod}. No KP cost.`;
      }

      deck.push(card);
    }
  });

  return shuffle(deck);
};

export const createAssuraPool = (): GameCard[] => {
  const assuras: GameCard[] = [
    { id: generateId(), type: 'Assura', name: 'Ravana', description: 'Ten-headed King of Lanka.', captureRange: [10, 12], retaliationRange: [3, 7], safeZone: [1, 2], requirement: '2 Vanas', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Narakasura', description: 'Demon of Pragjyotisha.', captureRange: [9, 12], retaliationRange: [4, 8], safeZone: [1, 3], requirement: '2 Rishies', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Mahishasura', description: 'The Buffalo Demon.', captureRange: [8, 12], retaliationRange: [3, 7], safeZone: [1, 2], requirement: '2 Kurus', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Bakashura', description: 'The Voracious Demon.', captureRange: [7, 12], retaliationRange: [2, 6], safeZone: [1, 1], requirement: '2 Vahas', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Kamsa', description: 'The Tyrant of Mathura.', captureRange: [8, 11], retaliationRange: [4, 7], safeZone: [1, 3], requirement: '2 Dvas', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Tarakasura', description: 'Demon of the Golden City.', captureRange: [10, 12], retaliationRange: [3, 9], safeZone: [1, 2], requirement: '3 Any', attachedAstras: [], curses: [] },
    { id: generateId(), type: 'Assura', name: 'Raktabija', description: 'The Multiplying Demon.', captureRange: [11, 12], retaliationRange: [2, 10], safeZone: [1, 1], requirement: '1 Vanas', attachedAstras: [], curses: [] }
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

export const validateAssuraRequirement = (majors: GameCard[], requirement: string): boolean => {
  if (!requirement) return true;
  const parts = requirement.split(' ');
  const count = parseInt(parts[0]);
  const target = parts[1];

  if (target === 'Any') {
    return majors.length >= count;
  }

  const matching = majors.filter(m => m.classSymbol === target || m.name === target);
  return matching.length >= count;
};

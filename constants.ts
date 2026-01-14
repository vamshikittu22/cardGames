
export const COLORS = {
  deepTeal: '#0F766E',
  richOrange: '#EA580C',
  royalPurple: '#7C3AED',
  goldAccent: '#F59E0B',
  offWhite: '#FAFAFA',
  darkText: '#1F2937',
  boardBg: '#1F2937',
  assuraMaroon: '#7F1D1D',
};

export const CARD_THEMES: Record<string, { bg: string; text: string }> = {
  General: { bg: '#0F766E', text: 'white' }, // Teal
  Major: { bg: '#4C1D95', text: 'white' },   // Deep Purple
  Astra: { bg: '#D97706', text: 'white' },   // Golden
  Curse: { bg: '#7F1D1D', text: 'white' },   // Dark Red
  Maya: { bg: '#2563EB', text: 'white' },    // Vibrant Blue
  Shakny: { bg: '#EA580C', text: 'white' },  // Orange
  Clash: { bg: '#DC2626', text: 'white' },   // Bright Red
  Assura: { bg: '#450A0A', text: 'white' },  // Very Dark Maroon
};

export const AVATAR_COLORS = [
  '#0F766E', // Deep Teal
  '#7C3AED', // Royal Purple
  '#EA580C', // Rich Orange
  '#F59E0B', // Gold
  '#2563EB', // Blue
  '#DB2777', // Pink
];

export const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6];

export const UI_TRANSITIONS = 'transition-all duration-300 ease-in-out';

export const SUITS = [
  { symbol: '♠', color: 'black', label: 'Spades' },
  { symbol: '♥', color: 'red', label: 'Hearts' },
  { symbol: '♦', color: 'red', label: 'Diamonds' },
  { symbol: '♣', color: 'black', label: 'Clubs' }
];

export const RANKS = [
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
  { rank: 'A', value: 14 }
];

export const HAND_SCORES = {
  ROYAL_FLUSH: { id: 'ROYAL_FLUSH', score: 100 },
  STRAIGHT_FLUSH: { id: 'STRAIGHT_FLUSH', score: 75 },
  FOUR_KIND: { id: 'FOUR_KIND', score: 50 },
  FULL_HOUSE: { id: 'FULL_HOUSE', score: 25 },
  FLUSH: { id: 'FLUSH', score: 20 },
  STRAIGHT: { id: 'STRAIGHT', score: 15 },
  THREE_KIND: { id: 'THREE_KIND', score: 10 },
  TWO_PAIR: { id: 'TWO_PAIR', score: 5 },
  ONE_PAIR: { id: 'ONE_PAIR', score: 2 },
  HIGH_CARD: { id: 'HIGH_CARD', score: 0 }
};

export const BOARD_SIZE = 5;
export const TARGET_SEARCH_RESTARTS = 5;
export const TARGET_SEARCH_SWAPS = 2000;

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
  ROYAL_FLUSH: {
    id: 'ROYAL_FLUSH',
    name: 'Royal Flush',
    short: 'Royal',
    score: 100,
    description: 'A, K, Q, J, 10 in one suit.'
  },
  STRAIGHT_FLUSH: {
    id: 'STRAIGHT_FLUSH',
    name: 'Straight Flush',
    short: 'S Flush',
    score: 75,
    description: 'Five sequential cards in one suit.'
  },
  FOUR_KIND: {
    id: 'FOUR_KIND',
    name: 'Four of a Kind',
    short: 'Quads',
    score: 50,
    description: 'Four cards of the same rank.'
  },
  FULL_HOUSE: {
    id: 'FULL_HOUSE',
    name: 'Full House',
    short: 'House',
    score: 25,
    description: 'Three of one rank plus a pair.'
  },
  FLUSH: {
    id: 'FLUSH',
    name: 'Flush',
    short: 'Flush',
    score: 20,
    description: 'Five cards in one suit.'
  },
  STRAIGHT: {
    id: 'STRAIGHT',
    name: 'Straight',
    short: 'Run',
    score: 15,
    description: 'Five sequential ranks.'
  },
  THREE_KIND: {
    id: 'THREE_KIND',
    name: 'Three of a Kind',
    short: 'Trips',
    score: 10,
    description: 'Three cards of the same rank.'
  },
  TWO_PAIR: {
    id: 'TWO_PAIR',
    name: 'Two Pair',
    short: '2 Pair',
    score: 5,
    description: 'Two different pairs.'
  },
  ONE_PAIR: {
    id: 'ONE_PAIR',
    name: 'One Pair',
    short: 'Pair',
    score: 2,
    description: 'Two cards of the same rank.'
  },
  HIGH_CARD: {
    id: 'HIGH_CARD',
    name: 'High Card',
    short: 'High',
    score: 0,
    description: 'No scoring poker pattern.'
  }
};

export const BOARD_SIZE = 5;
export const TARGET_SEARCH_RESTARTS = 5;
export const TARGET_SEARCH_SWAPS = 2000;

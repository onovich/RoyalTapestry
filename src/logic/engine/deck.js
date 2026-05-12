import { RANKS, SUITS } from '../../data/cards.js';

export function createDeck() {
  return SUITS.flatMap((suit) =>
    RANKS.map(({ rank, value }) => ({
      id: `${rank}${suit.symbol}`,
      rank,
      value,
      suit: suit.symbol,
      color: suit.color
    }))
  );
}

export function shuffleArray(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

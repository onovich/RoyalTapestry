import { BOARD_SIZE, HAND_SCORES, TARGET_SEARCH_RESTARTS, TARGET_SEARCH_SWAPS } from '../../data/cards.js';
import { shuffleArray } from './deck.js';

export function evaluateHand(cards) {
  if (cards.length !== BOARD_SIZE || cards.some((card) => !card)) {
    return HAND_SCORES.HIGH_CARD;
  }

  const values = cards.map((card) => card.value).sort((a, b) => b - a);
  const isFlush = cards.every((card) => card.suit === cards[0].suit);
  const isWheel = values.join(',') === '14,5,4,3,2';
  const isStraight = isWheel || values.every((value, index) => index === 0 || values[index - 1] === value + 1);
  const rankCounts = values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
  const frequencies = Object.values(rankCounts).sort((a, b) => b - a);

  if (isStraight && isFlush && values[0] === 14 && values[1] === 13) return HAND_SCORES.ROYAL_FLUSH;
  if (isStraight && isFlush) return HAND_SCORES.STRAIGHT_FLUSH;
  if (frequencies[0] === 4) return HAND_SCORES.FOUR_KIND;
  if (frequencies[0] === 3 && frequencies[1] === 2) return HAND_SCORES.FULL_HOUSE;
  if (isFlush) return HAND_SCORES.FLUSH;
  if (isStraight) return HAND_SCORES.STRAIGHT;
  if (frequencies[0] === 3) return HAND_SCORES.THREE_KIND;
  if (frequencies[0] === 2 && frequencies[1] === 2) return HAND_SCORES.TWO_PAIR;
  if (frequencies[0] === 2) return HAND_SCORES.ONE_PAIR;

  return HAND_SCORES.HIGH_CARD;
}

export function getLines(grid) {
  const rows = grid.map((row, index) => ({
    id: `row-${index}`,
    type: 'row',
    index,
    cards: row,
    cells: Array.from({ length: BOARD_SIZE }, (_, column) => ({ row: index, column }))
  }));

  const columns = Array.from({ length: BOARD_SIZE }, (_, column) => ({
    id: `column-${column}`,
    type: 'column',
    index: column,
    cards: grid.map((row) => row[column]),
    cells: Array.from({ length: BOARD_SIZE }, (_, row) => ({ row, column }))
  }));

  const diagonals = [
    {
      id: 'diagonal-main',
      type: 'diagonal',
      index: 0,
      cards: Array.from({ length: BOARD_SIZE }, (_, index) => grid[index][index]),
      cells: Array.from({ length: BOARD_SIZE }, (_, index) => ({ row: index, column: index }))
    },
    {
      id: 'diagonal-anti',
      type: 'diagonal',
      index: 1,
      cards: Array.from({ length: BOARD_SIZE }, (_, index) => grid[index][BOARD_SIZE - 1 - index]),
      cells: Array.from({ length: BOARD_SIZE }, (_, index) => ({ row: index, column: BOARD_SIZE - 1 - index }))
    }
  ];

  return [...rows, ...columns, ...diagonals];
}

export function scoreGrid(grid) {
  const lines = getLines(grid).map((line) => ({
    ...line,
    result: evaluateHand(line.cards)
  }));

  return {
    lines,
    totalScore: lines.reduce((sum, line) => sum + line.result.score, 0)
  };
}

export function makeEmptyGrid() {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
}

export function gridFromCards(cards) {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, column) => cards[row * BOARD_SIZE + column] || null)
  );
}

export function flattenGrid(grid) {
  return grid.flat();
}

export function estimateMaxScore(cards) {
  let bestScore = scoreGrid(gridFromCards(cards)).totalScore;

  for (let restart = 0; restart < TARGET_SEARCH_RESTARTS; restart += 1) {
    const candidate = shuffleArray(cards);
    let candidateScore = scoreGrid(gridFromCards(candidate)).totalScore;

    for (let swap = 0; swap < TARGET_SEARCH_SWAPS; swap += 1) {
      const first = Math.floor(Math.random() * candidate.length);
      const second = Math.floor(Math.random() * candidate.length);
      [candidate[first], candidate[second]] = [candidate[second], candidate[first]];

      const nextScore = scoreGrid(gridFromCards(candidate)).totalScore;
      if (nextScore >= candidateScore) {
        candidateScore = nextScore;
      } else {
        [candidate[first], candidate[second]] = [candidate[second], candidate[first]];
      }
    }

    bestScore = Math.max(bestScore, candidateScore);
  }

  return bestScore;
}

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HAND_SCORES } from '../src/data/cards.js';
import { evaluateHand, gridFromCards, scoreGrid } from '../src/logic/engine/scoring.js';

function card(rank, value, suit = 'S') {
  return {
    id: `${rank}${suit}`,
    rank,
    value,
    suit,
    color: suit === 'H' || suit === 'D' ? 'red' : 'black'
  };
}

describe('evaluateHand', () => {
  it('scores a royal flush', () => {
    const result = evaluateHand([
      card('A', 14),
      card('K', 13),
      card('Q', 12),
      card('J', 11),
      card('10', 10)
    ]);

    assert.equal(result.id, HAND_SCORES.ROYAL_FLUSH.id);
    assert.equal(result.score, 100);
  });

  it('scores an ace-low wheel straight', () => {
    const result = evaluateHand([
      card('A', 14, 'S'),
      card('5', 5, 'H'),
      card('4', 4, 'D'),
      card('3', 3, 'C'),
      card('2', 2, 'S')
    ]);

    assert.equal(result.id, HAND_SCORES.STRAIGHT.id);
  });

  it('scores a full house before three of a kind', () => {
    const result = evaluateHand([
      card('9', 9, 'S'),
      card('9', 9, 'H'),
      card('9', 9, 'D'),
      card('K', 13, 'S'),
      card('K', 13, 'H')
    ]);

    assert.equal(result.id, HAND_SCORES.FULL_HOUSE.id);
  });

  it('returns high card for incomplete lines', () => {
    const result = evaluateHand([
      card('A', 14),
      card('K', 13),
      null,
      card('4', 4),
      card('2', 2)
    ]);

    assert.equal(result.id, HAND_SCORES.HIGH_CARD.id);
  });
});

describe('scoreGrid', () => {
  it('scores rows, columns, and diagonals together', () => {
    const cards = [
      card('A', 14), card('K', 13), card('Q', 12), card('J', 11), card('10', 10),
      card('2', 2, 'H'), card('3', 3, 'D'), card('4', 4, 'C'), card('5', 5, 'H'), card('6', 6, 'D'),
      card('7', 7, 'H'), card('8', 8, 'D'), card('9', 9, 'C'), card('10', 10, 'H'), card('J', 11, 'D'),
      card('Q', 12, 'H'), card('K', 13, 'D'), card('A', 14, 'C'), card('2', 2, 'D'), card('3', 3, 'C'),
      card('4', 4, 'H'), card('5', 5, 'D'), card('6', 6, 'C'), card('7', 7, 'D'), card('8', 8, 'C')
    ];

    const scoring = scoreGrid(gridFromCards(cards));

    assert.equal(scoring.lines.length, 12);
    assert.equal(scoring.lines[0].result.id, HAND_SCORES.ROYAL_FLUSH.id);
    assert.ok(scoring.totalScore >= HAND_SCORES.ROYAL_FLUSH.score);
  });
});

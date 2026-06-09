import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getLockedCardIds,
  getLockedCells,
  isGridSourceLocked,
  moveCard,
  sameRoundPosition
} from '../src/logic/engine/movement.js';
import { makeEmptyGrid } from '../src/logic/engine/scoring.js';

function card(id) {
  return {
    id,
    rank: id.slice(0, -1),
    value: Number.parseInt(id, 10) || 14,
    suit: id.slice(-1),
    color: id.endsWith('H') || id.endsWith('D') ? 'red' : 'black'
  };
}

function gridWith(entries) {
  const grid = makeEmptyGrid();
  entries.forEach(([row, column, value]) => {
    grid[row][column] = value;
  });
  return grid;
}

describe('moveCard', () => {
  it('moves a hand card into an empty grid cell', () => {
    const ace = card('AS');
    const king = card('KH');
    const moved = moveCard({
      source: { type: 'hand', index: 0 },
      target: { type: 'grid', row: 0, column: 0 },
      hand: [ace, king],
      grid: makeEmptyGrid()
    });

    assert.equal(moved.grid[0][0], ace);
    assert.deepEqual(moved.hand, [king]);
  });

  it('swaps a hand card with an occupied grid cell', () => {
    const ace = card('AS');
    const king = card('KH');
    const queen = card('QD');
    const moved = moveCard({
      source: { type: 'hand', index: 0 },
      target: { type: 'grid', row: 0, column: 0 },
      hand: [ace, queen],
      grid: gridWith([[0, 0, king]])
    });

    assert.equal(moved.grid[0][0], ace);
    assert.deepEqual(moved.hand, [king, queen]);
  });

  it('swaps two grid cards', () => {
    const ace = card('AS');
    const king = card('KH');
    const moved = moveCard({
      source: { type: 'grid', row: 0, column: 0 },
      target: { type: 'grid', row: 1, column: 1 },
      hand: [],
      grid: gridWith([[0, 0, ace], [1, 1, king]])
    });

    assert.equal(moved.grid[0][0], king);
    assert.equal(moved.grid[1][1], ace);
  });

  it('returns a grid card to the end of the hand', () => {
    const ace = card('AS');
    const moved = moveCard({
      source: { type: 'grid', row: 0, column: 0 },
      target: { type: 'hand' },
      hand: [card('KH')],
      grid: gridWith([[0, 0, ace]])
    });

    assert.equal(moved.grid[0][0], null);
    assert.equal(moved.hand.at(-1), ace);
  });

  it('swaps a grid card with a specific hand card', () => {
    const ace = card('AS');
    const king = card('KH');
    const queen = card('QD');
    const moved = moveCard({
      source: { type: 'grid', row: 0, column: 0 },
      target: { type: 'hand', index: 1 },
      hand: [king, queen],
      grid: gridWith([[0, 0, ace]])
    });

    assert.equal(moved.grid[0][0], queen);
    assert.deepEqual(moved.hand, [king, ace]);
  });

  it('keeps the same position when the source has no card', () => {
    const hand = [card('AS')];
    const grid = makeEmptyGrid();
    const moved = moveCard({
      source: { type: 'grid', row: 0, column: 0 },
      target: { type: 'hand' },
      hand,
      grid
    });

    assert.equal(moved.hand, hand);
    assert.equal(moved.grid, grid);
  });
});

describe('locked movement helpers', () => {
  it('finds locked card ids and current locked cells', () => {
    const ace = card('AS');
    const king = card('KH');
    const lockedCardIds = getLockedCardIds([{ id: 'row-0', cardIds: [ace.id] }]);
    const lockedCells = getLockedCells(gridWith([[0, 0, ace], [0, 1, king]]), lockedCardIds);

    assert.deepEqual([...lockedCardIds], [ace.id]);
    assert.deepEqual([...lockedCells], ['0-0']);
  });

  it('treats only locked grid cards as locked sources', () => {
    const ace = card('AS');
    const lockedCardIds = getLockedCardIds([{ id: 'row-0', cardIds: [ace.id] }]);
    const grid = gridWith([[0, 0, ace]]);

    assert.equal(isGridSourceLocked(grid, lockedCardIds, { type: 'grid', row: 0, column: 0 }), true);
    assert.equal(isGridSourceLocked(grid, lockedCardIds, { type: 'grid', row: 0, column: 1 }), false);
    assert.equal(isGridSourceLocked(grid, lockedCardIds, { type: 'hand', index: 0 }), false);
  });

  it('compares round positions by hand order and grid card ids', () => {
    const ace = card('AS');
    const first = { hand: [ace], grid: makeEmptyGrid() };
    const second = { hand: [{ ...ace }], grid: makeEmptyGrid() };
    const third = { hand: [card('KH')], grid: makeEmptyGrid() };

    assert.equal(sameRoundPosition(first, second), true);
    assert.equal(sameRoundPosition(first, third), false);
  });
});

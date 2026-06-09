export function moveCard({ source, target, hand, grid }) {
  const nextHand = [...hand];
  const nextGrid = grid.map((row) => [...row]);
  const sourceCard = source.type === 'hand' ? nextHand[source.index] : nextGrid[source.row][source.column];
  const targetCard = target.type === 'hand' && target.index !== undefined
    ? nextHand[target.index]
    : target.type === 'grid'
      ? nextGrid[target.row][target.column]
      : null;

  if (!sourceCard) return { hand, grid };

  if (source.type === 'hand' && target.type === 'grid') {
    nextGrid[target.row][target.column] = sourceCard;
    if (targetCard) {
      nextHand[source.index] = targetCard;
    } else {
      nextHand.splice(source.index, 1);
    }
  }

  if (source.type === 'grid' && target.type === 'grid') {
    nextGrid[target.row][target.column] = sourceCard;
    nextGrid[source.row][source.column] = targetCard;
  }

  if (source.type === 'grid' && target.type === 'hand') {
    if (target.index !== undefined && targetCard) {
      nextGrid[source.row][source.column] = targetCard;
      nextHand[target.index] = sourceCard;
    } else {
      nextGrid[source.row][source.column] = null;
      nextHand.push(sourceCard);
    }
  }

  if (source.type === 'hand' && target.type === 'hand' && target.index !== undefined) {
    nextHand[source.index] = targetCard;
    nextHand[target.index] = sourceCard;
  }

  return {
    hand: nextHand.filter(Boolean),
    grid: nextGrid
  };
}

export function sameCards(first, second) {
  return first?.id === second?.id;
}

export function sameGrid(first, second) {
  return first.every((row, rowIndex) =>
    row.every((card, columnIndex) => sameCards(card, second[rowIndex][columnIndex]))
  );
}

export function sameRoundPosition(first, second) {
  return first.hand.length === second.hand.length
    && first.hand.every((card, index) => sameCards(card, second.hand[index]))
    && sameGrid(first.grid, second.grid);
}

export function sameSource(first, second) {
  if (!first || !second || first.type !== second.type) return false;
  if (first.type === 'hand') return first.index === second.index;
  if (first.type === 'grid') return first.row === second.row && first.column === second.column;
  return false;
}

export function getLockedCardIds(lockedLines) {
  const cardIds = new Set();
  lockedLines.forEach((line) => {
    line.cardIds.forEach((id) => cardIds.add(id));
  });
  return cardIds;
}

export function getLockedCells(grid, lockedCardIds) {
  const cells = new Set();
  grid.forEach((row, rowIndex) => {
    row.forEach((card, columnIndex) => {
      if (card && lockedCardIds.has(card.id)) cells.add(`${rowIndex}-${columnIndex}`);
    });
  });
  return cells;
}

export function isGridSourceLocked(grid, lockedCardIds, source) {
  if (source?.type !== 'grid') return false;
  const card = grid[source.row]?.[source.column];
  return Boolean(card && lockedCardIds.has(card.id));
}

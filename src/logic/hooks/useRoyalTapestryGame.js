import { useMemo, useState } from 'react';
import { BOARD_SIZE } from '../../data/cards.js';
import { createDeck, shuffleArray } from '../engine/deck.js';
import { estimateMaxScore, makeEmptyGrid, scoreGrid } from '../engine/scoring.js';

function drawLevel() {
  const cards = shuffleArray(createDeck()).slice(0, BOARD_SIZE * BOARD_SIZE);
  return {
    hand: cards,
    grid: makeEmptyGrid(),
    targetScore: estimateMaxScore(cards)
  };
}

function moveCard({ source, target, hand, grid }) {
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
    nextGrid[source.row][source.column] = null;
    if (target.index !== undefined && targetCard) {
      nextHand[target.index] = sourceCard;
    } else {
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

export function useRoyalTapestryGame() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => drawLevel());
  const [selectedCard, setSelectedCard] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const scoring = useMemo(() => scoreGrid(round.grid), [round.grid]);
  const isComplete = round.hand.length === 0 && scoring.totalScore >= round.targetScore;

  function startLevel(nextLevel = 1) {
    setLevel(nextLevel);
    setRound(drawLevel());
    setSelectedCard(null);
    setHighlight(null);
  }

  function restart() {
    startLevel(1);
  }

  function nextLevel() {
    startLevel(level + 1);
  }

  function selectCard(source) {
    setSelectedCard(source);
  }

  function clearSelection() {
    setSelectedCard(null);
  }

  function placeCard(target) {
    if (!selectedCard) return;
    const moved = moveCard({ source: selectedCard, target, hand: round.hand, grid: round.grid });
    setRound((current) => ({ ...current, hand: moved.hand, grid: moved.grid }));
    setSelectedCard(null);
  }

  function showLine(line) {
    setHighlight(line);
  }

  return {
    level,
    hand: round.hand,
    grid: round.grid,
    targetScore: round.targetScore,
    selectedCard,
    scoring,
    highlight,
    isComplete,
    restart,
    nextLevel,
    selectCard,
    clearSelection,
    placeCard,
    showLine
  };
}

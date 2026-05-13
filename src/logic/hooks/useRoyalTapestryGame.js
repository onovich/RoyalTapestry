import { useEffect, useMemo, useRef, useState } from 'react';
import { BOARD_SIZE } from '../../data/cards.js';
import { createDeck, shuffleArray } from '../engine/deck.js';
import { estimateMaxScore, getScoringLinesForCell, makeEmptyGrid, scoreGrid } from '../engine/scoring.js';

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

function sameCell(first, second) {
  return first?.type === second?.type
    && first?.row === second?.row
    && first?.column === second?.column
    && first?.index === second?.index;
}

function getCardFromSource(source, hand, grid) {
  if (source.type === 'hand') return hand[source.index];
  return grid[source.row]?.[source.column];
}

function scoreMovePotential({ move, moved, currentScore }) {
  const nextScoring = scoreGrid(moved.grid);
  const delta = nextScoring.totalScore - currentScore;
  const affectedLines = nextScoring.lines.filter((line) =>
    line.cells.some((cell) => cell.row === move.target.row && cell.column === move.target.column)
  );
  const potential = affectedLines.reduce((sum, line) => {
    const filledCards = line.cards.filter(Boolean);
    const rankMatches = Math.max(
      0,
      ...filledCards.map((card) => filledCards.filter((other) => other.rank === card.rank).length)
    );
    const suitMatches = Math.max(
      0,
      ...filledCards.map((card) => filledCards.filter((other) => other.suit === card.suit).length)
    );
    return sum + (line.result.score * 10) + (filledCards.length * 4) + (rankMatches * 3) + suitMatches;
  }, 0);

  return { delta, nextScore: nextScoring.totalScore, potential };
}

function findHint({ hand, grid, scoring }) {
  const sources = [
    ...hand.map((card, index) => ({ type: 'hand', index })),
    ...grid.flatMap((row, rowIndex) =>
      row.map((card, columnIndex) => (card ? { type: 'grid', row: rowIndex, column: columnIndex } : null))
    ).filter(Boolean)
  ];
  const targets = grid.flatMap((row, rowIndex) =>
    row.map((card, columnIndex) => ({ type: 'grid', row: rowIndex, column: columnIndex }))
  );
  const candidates = [];

  for (const source of sources) {
    for (const target of targets) {
      if (sameCell(source, target)) continue;
      const moved = moveCard({ source, target, hand, grid });
      const sourceCard = getCardFromSource(source, hand, grid);
      const targetCard = getCardFromSource(target, hand, grid);
      const unchanged = moved.hand === hand && moved.grid === grid;
      if (!sourceCard || unchanged) continue;

      candidates.push({
        source,
        target,
        sourceCard,
        targetCard,
        ...scoreMovePotential({ move: { source, target }, moved, currentScore: scoring.totalScore })
      });
    }
  }

  const usefulCandidates = candidates.filter((candidate) => candidate.delta >= 0);
  if (usefulCandidates.length === 0) return null;
  return usefulCandidates.sort((first, second) =>
    (second.delta - first.delta)
    || (second.potential - first.potential)
    || (first.source.type === 'hand' ? -1 : 1)
  )[0];
}

export function useRoyalTapestryGame() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => drawLevel());
  const [selectedCard, setSelectedCard] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [comboNotice, setComboNotice] = useState(null);
  const [hintNotice, setHintNotice] = useState(null);
  const [comboCycle, setComboCycle] = useState({ key: '', index: 0 });
  const previousLineScoresRef = useRef({});
  const noticeTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const scoring = useMemo(() => scoreGrid(round.grid), [round.grid]);
  const isComplete = round.hand.length === 0 && scoring.totalScore >= round.targetScore;

  function triggerComboFeedback(line, { resetCycle = false } = {}) {
    setHighlight(line);
    setComboNotice(line);
    if (resetCycle) setComboCycle({ key: '', index: 0 });

    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlight(null);
    }, 900);
    noticeTimerRef.current = window.setTimeout(() => {
      setComboNotice(null);
    }, 1800);
  }

  useEffect(() => {
    const previousScores = previousLineScoresRef.current;
    const newLine = scoring.lines.find((line) => {
      const previousScore = previousScores[line.id] || 0;
      return line.result.score > 0 && line.result.score !== previousScore;
    });

    previousLineScoresRef.current = Object.fromEntries(
      scoring.lines.map((line) => [line.id, line.result.score])
    );

    if (!newLine) return undefined;

    triggerComboFeedback(newLine, { resetCycle: true });

    return undefined;
  }, [scoring]);

  function startLevel(nextLevel = 1) {
    setLevel(nextLevel);
    setRound(drawLevel());
    setSelectedCard(null);
    setHighlight(null);
    setComboNotice(null);
    setHintNotice(null);
    setComboCycle({ key: '', index: 0 });
    previousLineScoresRef.current = {};
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
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
    setHintNotice(null);
  }

  function moveDirectly(source, target) {
    const moved = moveCard({ source, target, hand: round.hand, grid: round.grid });
    setRound((current) => ({ ...current, hand: moved.hand, grid: moved.grid }));
    setSelectedCard(null);
    setHintNotice(null);
  }

  function showLine(line) {
    triggerComboFeedback(line);
  }

  function confirmCellCombos(row, column) {
    const combos = getScoringLinesForCell(scoring.lines, row, column);
    if (combos.length === 0) return false;

    const key = `${row}-${column}`;
    const nextIndex = comboCycle.key === key ? (comboCycle.index + 1) % combos.length : 0;
    const combo = combos[nextIndex];
    setComboCycle({ key, index: nextIndex });
    triggerComboFeedback(combo);
    return true;
  }

  function requestHint() {
    setSelectedCard(null);
    setHintNotice(findHint({ hand: round.hand, grid: round.grid, scoring }));
  }

  return {
    level,
    hand: round.hand,
    grid: round.grid,
    targetScore: round.targetScore,
    selectedCard,
    scoring,
    highlight,
    comboNotice,
    hintNotice,
    isComplete,
    restart,
    nextLevel,
    selectCard,
    clearSelection,
    placeCard,
    moveDirectly,
    showLine,
    confirmCellCombos,
    requestHint
  };
}

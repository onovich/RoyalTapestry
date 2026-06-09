import { useEffect, useMemo, useRef, useState } from 'react';
import { BOARD_SIZE } from '../../data/cards.js';
import { createDeck, shuffleArray } from '../engine/deck.js';
import {
  getLockedCardIds,
  getLockedCells,
  isGridSourceLocked,
  moveCard,
  sameRoundPosition
} from '../engine/movement.js';
import { findBestScoredGrid, getScoringLinesForCell, makeEmptyGrid, scoreGrid } from '../engine/scoring.js';

function drawLevel() {
  const cards = shuffleArray(createDeck()).slice(0, BOARD_SIZE * BOARD_SIZE);
  const solution = findBestScoredGrid(cards);
  return {
    hand: cards,
    grid: makeEmptyGrid(),
    targetScore: solution.score,
    solutionGrid: solution.grid,
    surrendered: false,
    lockedLines: []
  };
}

export function useRoyalTapestryGame() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => drawLevel());
  const [history, setHistory] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [comboNotice, setComboNotice] = useState(null);
  const [comboCycle, setComboCycle] = useState({ key: '', index: 0 });
  const previousLineScoresRef = useRef({});
  const noticeTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const skipScoreFeedbackRef = useRef(false);
  const scoring = useMemo(() => scoreGrid(round.grid), [round.grid]);
  const lockedLineIds = useMemo(() => new Set(round.lockedLines.map((line) => line.id)), [round.lockedLines]);
  const lockedCardIds = useMemo(() => getLockedCardIds(round.lockedLines), [round.lockedLines]);
  const lockedCells = useMemo(() => getLockedCells(round.grid, lockedCardIds), [round.grid, lockedCardIds]);
  const isComplete = !round.surrendered && round.hand.length === 0 && scoring.totalScore >= round.targetScore;

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
    if (round.surrendered) return undefined;

    const previousScores = previousLineScoresRef.current;
    const newLine = scoring.lines.find((line) => {
      const previousScore = previousScores[line.id] || 0;
      return line.result.score > 0 && line.result.score !== previousScore;
    });

    previousLineScoresRef.current = Object.fromEntries(
      scoring.lines.map((line) => [line.id, line.result.score])
    );

    if (skipScoreFeedbackRef.current) {
      skipScoreFeedbackRef.current = false;
      return undefined;
    }

    if (!newLine) return undefined;

    triggerComboFeedback(newLine, { resetCycle: true });

    return undefined;
  }, [scoring, round.surrendered]);

  function startLevel(nextLevel = 1) {
    setLevel(nextLevel);
    setRound(drawLevel());
    setHistory([]);
    setSelectedCard(null);
    setHighlight(null);
    setComboNotice(null);
    setComboCycle({ key: '', index: 0 });
    previousLineScoresRef.current = {};
    skipScoreFeedbackRef.current = false;
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

  function isSourceLocked(source) {
    return isGridSourceLocked(round.grid, lockedCardIds, source);
  }

  function placeCard(target) {
    if (round.surrendered) return;
    if (!selectedCard) return;
    moveDirectly(selectedCard, target);
  }

  function moveDirectly(source, target) {
    if (round.surrendered) return;
    if (isSourceLocked(source) || isSourceLocked(target)) {
      setSelectedCard(null);
      return;
    }
    const moved = moveCard({ source, target, hand: round.hand, grid: round.grid });
    const nextRound = { ...round, hand: moved.hand, grid: moved.grid };
    if (sameRoundPosition(round, nextRound)) {
      setSelectedCard(null);
      return;
    }
    setHistory((current) => [...current, round]);
    setRound((current) => ({ ...current, hand: moved.hand, grid: moved.grid }));
    setSelectedCard(null);
  }

  function undo() {
    if (round.surrendered || history.length === 0) return;
    const previousRound = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setRound(previousRound);
    setSelectedCard(null);
    setHighlight(null);
    setComboNotice(null);
    skipScoreFeedbackRef.current = true;
  }

  function surrender() {
    setRound((current) => ({
      ...current,
      hand: [],
      grid: current.solutionGrid,
      surrendered: true,
      lockedLines: []
    }));
    setSelectedCard(null);
    setHighlight(null);
    setComboNotice(null);
    previousLineScoresRef.current = {};
    skipScoreFeedbackRef.current = false;
  }

  function showLine(line) {
    if (round.surrendered) return;
    triggerComboFeedback(line);
  }

  function confirmCellCombos(row, column) {
    if (round.surrendered) return false;
    if (lockedCells.has(`${row}-${column}`)) return false;
    const combos = getScoringLinesForCell(scoring.lines, row, column);
    if (combos.length === 0) return false;

    const key = `${row}-${column}`;
    const nextIndex = comboCycle.key === key ? (comboCycle.index + 1) % combos.length : 0;
    const combo = combos[nextIndex];
    setComboCycle({ key, index: nextIndex });
    triggerComboFeedback(combo);
    return true;
  }

  function toggleLineLock(line) {
    if (round.surrendered) return;
    if (line.result.score <= 0 || line.cards.some((card) => !card)) return;

    setHistory((current) => [...current, round]);
    setRound((current) => {
      const isLocked = current.lockedLines.some((lockedLine) => lockedLine.id === line.id);
      return {
        ...current,
        lockedLines: isLocked
          ? current.lockedLines.filter((lockedLine) => lockedLine.id !== line.id)
          : [...current.lockedLines, { id: line.id, cardIds: line.cards.map((card) => card.id) }]
      };
    });
    setSelectedCard(null);
    setHighlight(null);
    setComboNotice(null);
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
    isComplete,
    surrendered: round.surrendered,
    lockedLineIds,
    lockedCells,
    canUndo: history.length > 0 && !round.surrendered,
    restart,
    nextLevel,
    selectCard,
    clearSelection,
    placeCard,
    moveDirectly,
    undo,
    surrender,
    showLine,
    confirmCellCombos,
    toggleLineLock,
    isSourceLocked
  };
}

import { useEffect, useRef, useState } from 'react';

export function useInteractionFeedback() {
  const [settledCardId, setSettledCardId] = useState(null);
  const [lockedNudge, setLockedNudge] = useState(null);
  const settleTimerRef = useRef(null);
  const lockedNudgeTimerRef = useRef(null);

  function showSettle(card) {
    if (!card) return;

    setSettledCardId(card.id);
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);

    settleTimerRef.current = window.setTimeout(() => {
      setSettledCardId(null);
      settleTimerRef.current = null;
    }, 420);
  }

  function showLockedNudge(source) {
    if (source?.type !== 'grid') return;

    if (lockedNudgeTimerRef.current) window.clearTimeout(lockedNudgeTimerRef.current);
    setLockedNudge(null);

    window.requestAnimationFrame(() => {
      setLockedNudge({ row: source.row, column: source.column, key: Date.now() });
      lockedNudgeTimerRef.current = window.setTimeout(() => {
        setLockedNudge(null);
        lockedNudgeTimerRef.current = null;
      }, 360);
    });
  }

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    if (lockedNudgeTimerRef.current) window.clearTimeout(lockedNudgeTimerRef.current);
  }, []);

  return {
    settledCardId,
    lockedNudge,
    showSettle,
    showLockedNudge
  };
}

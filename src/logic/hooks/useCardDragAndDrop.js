import { useEffect, useRef, useState } from 'react';
import { sameSource } from '../engine/movement.js';

export function getDragTransform(x, y) {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(2deg)`;
}

function resolveDropTarget(event) {
  const dropElement = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest('[data-drop-target]');

  if (!dropElement) return null;
  if (dropElement.dataset.dropTarget === 'hand') return { type: 'hand' };
  if (dropElement.dataset.dropTarget === 'grid') {
    return {
      type: 'grid',
      row: Number(dropElement.dataset.row),
      column: Number(dropElement.dataset.column)
    };
  }

  return null;
}

export function useCardDragAndDrop({
  isSurrendered,
  isSourceLocked,
  getCardAtSource,
  moveDirectly,
  onSettle,
  onLockedNudge
}) {
  const [dragInfo, setDragInfo] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const dragRef = useRef(null);
  const dragGhostRef = useRef(null);
  const dropTargetRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef(null);

  function applyDragPosition(drag) {
    if (!dragGhostRef.current) return;
    dragGhostRef.current.style.transform = getDragTransform(drag.x, drag.y);
  }

  function setActiveDropTarget(target) {
    if (sameSource(dropTargetRef.current, target)) return;
    dropTargetRef.current = target;
    setDropTarget(target);
  }

  function isValidDropTarget(target) {
    if (!target) return false;
    return !isSourceLocked(target);
  }

  function resolveValidDropTarget(event) {
    const target = resolveDropTarget(event);
    return isValidDropTarget(target) ? target : null;
  }

  function consumeSuppressedClick() {
    if (!suppressClickRef.current) return false;
    suppressClickRef.current = false;
    return true;
  }

  function handleCardPointerDown(event, source) {
    if (isSurrendered) return;
    if (isSourceLocked(source)) {
      onLockedNudge(source);
      return;
    }
    if (event.button !== undefined && event.button !== 0) return;

    const card = getCardAtSource(source);
    if (!card) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);

    const nextDrag = {
      source,
      card,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      isDragging: false
    };

    dragRef.current = nextDrag;
    setDragInfo(nextDrag);
  }

  function handlePointerMove(event) {
    const current = dragRef.current;
    if (!current) return;

    const distanceX = event.clientX - current.startX;
    const distanceY = event.clientY - current.startY;
    const shouldDrag = current.isDragging || Math.hypot(distanceX, distanceY) > 6;
    const nextDrag = {
      ...current,
      x: event.clientX,
      y: event.clientY,
      isDragging: shouldDrag
    };

    if (shouldDrag) event.preventDefault();
    dragRef.current = nextDrag;

    if (!shouldDrag) return;
    setActiveDropTarget(resolveValidDropTarget(event));

    if (current.isDragging) {
      applyDragPosition(nextDrag);
      return;
    }

    setDragInfo(nextDrag);
  }

  function handlePointerUp(event) {
    const current = dragRef.current;
    if (!current) return;

    if (current.isDragging) {
      const target = resolveDropTarget(event);
      if (target && isValidDropTarget(target)) {
        moveDirectly(current.source, target);
        onSettle(current.card);
      } else if (target) {
        onLockedNudge(target);
      } else if (current.source.type === 'grid') {
        moveDirectly(current.source, { type: 'hand' });
        onSettle(current.card);
      } else {
        onSettle(current.card);
      }

      suppressClickRef.current = true;
      if (suppressClickTimerRef.current) window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimerRef.current = null;
      }, 0);
    }

    dragRef.current = null;
    setActiveDropTarget(null);
    setDragInfo(null);
  }

  function handlePointerCancel() {
    dragRef.current = null;
    setActiveDropTarget(null);
    setDragInfo(null);
  }

  useEffect(() => {
    if (!dragInfo) return undefined;

    const preventTouchMove = (event) => event.preventDefault();
    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [Boolean(dragInfo)]);

  useEffect(() => {
    if (!dragInfo?.isDragging || !dragRef.current) return;
    applyDragPosition(dragRef.current);
  }, [dragInfo?.isDragging]);

  useEffect(() => () => {
    if (suppressClickTimerRef.current) window.clearTimeout(suppressClickTimerRef.current);
  }, []);

  return {
    dragInfo,
    dragSource: dragInfo?.source,
    dropTarget,
    dragGhostRef,
    consumeSuppressedClick,
    getDragTransform,
    handleCardPointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel
  };
}

import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, TEXT, formatText, getSystemLanguage } from '../../data/i18n.js';
import { useRoyalTapestryGame } from '../../logic/hooks/useRoyalTapestryGame.js';
import { GameBoard } from '../components/GameBoard.jsx';
import { HandTray } from '../components/HandTray.jsx';
import { RulesModal } from '../components/RulesModal.jsx';

export function RoyalTapestryScreen() {
  const game = useRoyalTapestryGame();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [language, setLanguage] = useState(getSystemLanguage);
  const [dragInfo, setDragInfo] = useState(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef(null);
  const text = TEXT[language];

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  useEffect(() => {
    if (!dragInfo) return undefined;

    const preventTouchMove = (event) => event.preventDefault();
    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [Boolean(dragInfo)]);

  function toggleLanguage() {
    setLanguage((current) => (current === 'zh' ? 'en' : 'zh'));
  }

  function handleCardClick(source) {
    if (game.surrendered) return;
    if (game.isSourceLocked(source)) return;

    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (source.type === 'grid' && game.confirmCellCombos(source.row, source.column)) {
      return;
    }

    game.clearSelection();
  }

  function handleHandDoubleClick() {
    if (game.surrendered) return;
    game.clearSelection();
  }

  function getCardAtSource(source) {
    if (source.type === 'hand') return game.hand[source.index];
    if (source.type === 'grid') return game.grid[source.row]?.[source.column];
    return null;
  }

  function handleCardPointerDown(event, source) {
    if (game.surrendered) return;
    if (game.isSourceLocked(source)) return;
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const card = getCardAtSource(source);
    if (!card) return;

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

  function updateDragInfo(nextDrag) {
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
    updateDragInfo(nextDrag);
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

  function handlePointerUp(event) {
    const current = dragRef.current;
    if (!current) return;

    if (current.isDragging) {
      const target = resolveDropTarget(event);
      if (target) {
        game.moveDirectly(current.source, target);
      } else if (current.source.type === 'grid') {
        game.moveDirectly(current.source, { type: 'hand' });
      }
      suppressClickRef.current = true;
      if (suppressClickTimerRef.current) window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimerRef.current = null;
      }, 0);
    }

    dragRef.current = null;
    setDragInfo(null);
  }

  function handlePointerCancel() {
    dragRef.current = null;
    setDragInfo(null);
  }

  return (
    <main
      className={`app-shell ${dragInfo?.isDragging ? 'is-dragging' : ''} ${game.surrendered ? 'is-surrendered' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      <header className="topbar">
        <div>
          <h1>{text.appName}</h1>
          <div className="toolbar">
            <button type="button" onClick={game.restart}>{text.newGame}</button>
            <button type="button" onClick={game.undo} disabled={!game.canUndo}>{text.undo}</button>
            <button type="button" onClick={() => setRulesOpen(true)}>{text.rules}</button>
            <button type="button" onClick={game.surrender} disabled={game.surrendered}>{text.surrender}</button>
            <button type="button" className="language-toggle" onClick={toggleLanguage}>
              {LANGUAGES[language === 'zh' ? 'en' : 'zh']}
            </button>
          </div>
        </div>
        <div className="score-strip">
          <div>
            <span>{text.level}</span>
            <strong>{game.level}</strong>
          </div>
          <div>
            <span>{text.target}</span>
            <strong>{game.targetScore}</strong>
          </div>
          <div>
            <span>{text.score}</span>
            <strong>{game.scoring.totalScore}</strong>
          </div>
        </div>
      </header>

      <section className="play-area">
        <div className="board-column">
          <div className="status-line">
            {game.surrendered ? (
              <span className="surrender-message">{text.statusSurrendered}</span>
            ) : game.comboNotice ? (
              <button className="combo-notice" type="button" onClick={game.clearSelection}>
                <span>✨ {text.hands[game.comboNotice.result.id].name}</span>
                <strong className="combo-score-badge">+{game.comboNotice.result.score}</strong>
              </button>
            ) : game.selectedCard ? (
              <button type="button" onClick={game.clearSelection}>{text.selectDestination}</button>
            ) : game.hand.length === 0 && game.scoring.totalScore < game.targetScore ? (
              <span className="need-adjust">{text.statusNeedAdjust}</span>
            ) : (
              <span>{text.statusDefault}</span>
            )}
          </div>

          <GameBoard
            grid={game.grid}
            scoring={game.scoring}
            selectedCard={game.selectedCard}
            highlight={game.highlight}
            lockedLineIds={game.lockedLineIds}
            lockedCells={game.lockedCells}
            dragSource={dragInfo?.source}
            text={text}
            onCellClick={game.clearSelection}
            onCardClick={handleCardClick}
            onCardPointerDown={handleCardPointerDown}
            onLineClick={game.surrendered ? () => {} : game.toggleLineLock}
          />
        </div>

        <aside className="side-panel">
          <div className="panel-score">
            <span>{text.remaining}</span>
            <strong>{game.hand.length}</strong>
          </div>
          <HandTray
            hand={game.hand}
            selectedCard={game.selectedCard}
            dragSource={dragInfo?.source}
            text={text}
            onCardClick={handleCardClick}
            onCardDoubleClick={handleHandDoubleClick}
            onCardPointerDown={handleCardPointerDown}
            onTrayClick={game.clearSelection}
          />
        </aside>
      </section>

      {dragInfo?.isDragging && (
        <div className="drag-ghost" style={{ left: dragInfo.x, top: dragInfo.y }}>
          <div className="drag-ghost-card">
            <span className="card-rank">{dragInfo.card.rank}</span>
            <span className="card-suit">{dragInfo.card.suit}</span>
          </div>
        </div>
      )}

      {game.isComplete && (
        <div className="modal-backdrop">
          <section className="modal-panel win-panel">
            <div className="win-trophy">🏆</div>
            <h2>{text.levelComplete}</h2>
            <p>{formatText(text.levelCompleteBody, { level: game.level })}</p>
            <div className="win-score-box">
              <div>
                <span>{text.target}</span>
                <strong>{game.targetScore}</strong>
              </div>
              <div className="win-score-divider" />
              <div>
                <span>{text.finalScore}</span>
                <strong>{game.scoring.totalScore}</strong>
              </div>
            </div>
            <button type="button" onClick={game.nextLevel}>{text.nextLevel}</button>
          </section>
        </div>
      )}

      <RulesModal open={rulesOpen} text={text} onClose={() => setRulesOpen(false)} />
    </main>
  );
}

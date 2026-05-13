import { useRef, useState } from 'react';
import { useRoyalTapestryGame } from '../../logic/hooks/useRoyalTapestryGame.js';
import { GameBoard } from '../components/GameBoard.jsx';
import { HandTray } from '../components/HandTray.jsx';
import { RulesModal } from '../components/RulesModal.jsx';

export function RoyalTapestryScreen() {
  const game = useRoyalTapestryGame();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [dragInfo, setDragInfo] = useState(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  function findFirstEmptyCell() {
    for (let row = 0; row < game.grid.length; row += 1) {
      for (let column = 0; column < game.grid[row].length; column += 1) {
        if (!game.grid[row][column]) return { type: 'grid', row, column };
      }
    }

    return null;
  }

  function handleCardClick(source) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (game.selectedCard) {
      game.placeCard(source);
    } else {
      game.selectCard(source);
    }
  }

  function handleHandDoubleClick(source) {
    const target = findFirstEmptyCell();
    if (!target) return;
    game.moveDirectly(source, target);
  }

  function getCardAtSource(source) {
    if (source.type === 'hand') return game.hand[source.index];
    if (source.type === 'grid') return game.grid[source.row]?.[source.column];
    return null;
  }

  function handleCardPointerDown(event, source) {
    if (event.button !== undefined && event.button !== 0) return;

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
      if (target) game.moveDirectly(current.source, target);
      suppressClickRef.current = true;
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
      className={`app-shell ${dragInfo?.isDragging ? 'is-dragging' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      <header className="topbar">
        <div>
          <h1>Royal Tapestry</h1>
          <div className="toolbar">
            <button type="button" onClick={game.restart}>New</button>
            <button type="button" onClick={() => setRulesOpen(true)}>Rules</button>
          </div>
        </div>
        <div className="score-strip">
          <div>
            <span>Level</span>
            <strong>{game.level}</strong>
          </div>
          <div>
            <span>Target</span>
            <strong>{game.targetScore}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{game.scoring.totalScore}</strong>
          </div>
        </div>
      </header>

      <section className="play-area">
        <div className="board-column">
          <div className="status-line">
            {game.highlight ? (
              <button type="button" onClick={game.clearSelection}>
                {game.highlight.result.name} +{game.highlight.result.score}
              </button>
            ) : game.selectedCard ? (
              <button type="button" onClick={game.clearSelection}>Select a destination</button>
            ) : (
              <span>Build scoring poker lines across rows, columns, and diagonals.</span>
            )}
          </div>

          <GameBoard
            grid={game.grid}
            scoring={game.scoring}
            selectedCard={game.selectedCard}
            highlight={game.highlight}
            dragSource={dragInfo?.source}
            onCellClick={game.placeCard}
            onCardClick={handleCardClick}
            onCardPointerDown={handleCardPointerDown}
            onLineClick={game.showLine}
          />
        </div>

        <aside className="side-panel">
          <div className="panel-score">
            <span>Remaining</span>
            <strong>{game.hand.length}</strong>
          </div>
          <HandTray
            hand={game.hand}
            selectedCard={game.selectedCard}
            dragSource={dragInfo?.source}
            onCardClick={handleCardClick}
            onCardDoubleClick={handleHandDoubleClick}
            onCardPointerDown={handleCardPointerDown}
            onTrayClick={() => game.selectedCard?.type === 'grid' && game.placeCard({ type: 'hand' })}
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
            <h2>Level Complete</h2>
            <p>Your final score reached the target for level {game.level}.</p>
            <button type="button" onClick={game.nextLevel}>Next Level</button>
          </section>
        </div>
      )}

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </main>
  );
}

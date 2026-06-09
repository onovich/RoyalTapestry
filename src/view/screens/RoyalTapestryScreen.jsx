import { useEffect, useState } from 'react';
import { LANGUAGES, TEXT, formatText, getSystemLanguage } from '../../data/i18n.js';
import { sameSource, useCardDragAndDrop } from '../../logic/hooks/useCardDragAndDrop.js';
import { useInteractionFeedback } from '../../logic/hooks/useInteractionFeedback.js';
import { useRoyalTapestryGame } from '../../logic/hooks/useRoyalTapestryGame.js';
import { GameBoard } from '../components/GameBoard.jsx';
import { HandTray } from '../components/HandTray.jsx';
import { RulesModal } from '../components/RulesModal.jsx';
import { StoryModal } from '../components/StoryModal.jsx';

export function RoyalTapestryScreen() {
  const game = useRoyalTapestryGame();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [language, setLanguage] = useState(getSystemLanguage);
  const text = TEXT[language];
  const { settledCardId, lockedNudge, showSettle, showLockedNudge } = useInteractionFeedback();
  const {
    dragInfo,
    dragSource,
    dropTarget,
    dragGhostRef,
    consumeSuppressedClick,
    getDragTransform,
    handleCardPointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel
  } = useCardDragAndDrop({
    isSurrendered: game.surrendered,
    isSourceLocked: game.isSourceLocked,
    getCardAtSource,
    moveDirectly: game.moveDirectly,
    onSettle: showSettle,
    onLockedNudge: showLockedNudge
  });

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  function toggleLanguage() {
    setLanguage((current) => (current === 'zh' ? 'en' : 'zh'));
  }

  function handleCardClick(source) {
    if (game.surrendered) return;
    if (game.isSourceLocked(source)) {
      showLockedNudge(source);
      return;
    }

    if (consumeSuppressedClick()) {
      return;
    }

    if (game.selectedCard) {
      if (sameSource(game.selectedCard, source)) {
        game.clearSelection();
        return;
      }

      const movedCard = getCardAtSource(game.selectedCard);
      game.moveDirectly(game.selectedCard, source);
      showSettle(movedCard);
      return;
    }

    if (source.type === 'grid') {
      game.confirmCellCombos(source.row, source.column);
    }

    game.selectCard(source);
  }

  function handleCellClick(target) {
    if (game.surrendered) return;

    if (game.selectedCard) {
      const movedCard = getCardAtSource(game.selectedCard);
      game.placeCard(target);
      showSettle(movedCard);
      return;
    }

    game.clearSelection();
  }

  function handleTrayClick() {
    if (game.surrendered) return;

    if (game.selectedCard?.type === 'grid') {
      const movedCard = getCardAtSource(game.selectedCard);
      game.placeCard({ type: 'hand' });
      showSettle(movedCard);
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
            <button type="button" onClick={() => setStoryOpen(true)}>{text.story}</button>
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
            dragSource={dragSource}
            dropTarget={dropTarget}
            settledCardId={settledCardId}
            lockedNudge={lockedNudge}
            text={text}
            onCellClick={handleCellClick}
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
            dragSource={dragSource}
            dropTarget={dropTarget}
            settledCardId={settledCardId}
            text={text}
            onCardClick={handleCardClick}
            onCardDoubleClick={handleHandDoubleClick}
            onCardPointerDown={handleCardPointerDown}
            onTrayClick={handleTrayClick}
          />
        </aside>
      </section>

      {dragInfo?.isDragging && (
        <div
          className="drag-ghost"
          ref={dragGhostRef}
          style={{ transform: getDragTransform(dragInfo.x, dragInfo.y) }}
        >
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
      <StoryModal open={storyOpen} text={text} onClose={() => setStoryOpen(false)} />
    </main>
  );
}

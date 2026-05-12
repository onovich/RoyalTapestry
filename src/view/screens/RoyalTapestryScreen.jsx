import { useState } from 'react';
import { useRoyalTapestryGame } from '../../logic/hooks/useRoyalTapestryGame.js';
import { GameBoard } from '../components/GameBoard.jsx';
import { HandTray } from '../components/HandTray.jsx';
import { RulesModal } from '../components/RulesModal.jsx';

export function RoyalTapestryScreen() {
  const game = useRoyalTapestryGame();
  const [rulesOpen, setRulesOpen] = useState(false);

  function handleCardClick(source) {
    if (game.selectedCard) {
      game.placeCard(source);
    } else {
      game.selectCard(source);
    }
  }

  return (
    <main className="app-shell" onContextMenu={(event) => event.preventDefault()}>
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
        onCellClick={game.placeCard}
        onCardClick={handleCardClick}
        onLineClick={game.showLine}
      />

      <HandTray
        hand={game.hand}
        selectedCard={game.selectedCard}
        onCardClick={handleCardClick}
        onTrayClick={() => game.selectedCard?.type === 'grid' && game.placeCard({ type: 'hand' })}
      />

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

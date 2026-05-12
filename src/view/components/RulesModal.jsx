import { HAND_SCORES } from '../../data/cards.js';

export function RulesModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal-panel" onClick={(event) => event.stopPropagation()} aria-label="Rules">
        <header className="modal-header">
          <h2>Scoring</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close rules">
            X
          </button>
        </header>
        <div className="rules-list">
          {Object.values(HAND_SCORES).map((rule) => (
            <article className="rule-row" key={rule.id}>
              <strong>{rule.score}</strong>
              <div>
                <h3>{rule.name}</h3>
                <p>{rule.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

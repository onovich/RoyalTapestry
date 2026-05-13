import { HAND_SCORES } from '../../data/cards.js';

export function RulesModal({ open, text, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal-panel" onClick={(event) => event.stopPropagation()} aria-label={text.rules}>
        <header className="modal-header">
          <h2>
            <span className="rule-suit rule-suit-diamond">♦</span>
            {text.scoring}
            <span className="rule-suit rule-suit-heart">♥</span>
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label={text.closeRules}>
            ✕
          </button>
        </header>
        <div className="rules-list">
          {Object.values(HAND_SCORES).map((rule) => (
            <article className="rule-row" key={rule.id}>
              <strong>
                <span>{rule.score}</span>
                <small>{text.scoreUnit}</small>
              </strong>
              <div>
                <h3>{text.hands[rule.id].name}</h3>
                <p>{text.hands[rule.id].description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

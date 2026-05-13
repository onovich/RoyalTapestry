import { Card } from './Card.jsx';

export function HandTray({ hand, selectedCard, onCardClick, onCardDoubleClick, onTrayClick }) {
  return (
    <section className="hand-tray" onClick={onTrayClick} aria-label="Hand">
      {hand.length === 0 ? (
        <div className="empty-hand">Hand is empty. Refine the board if the target is not met.</div>
      ) : (
        <div className="hand-scroll">
          {hand.map((card, index) => (
            <div className="hand-card" key={card.id}>
              <Card
                card={card}
                selected={selectedCard?.type === 'hand' && selectedCard.index === index}
                onClick={(event) => {
                  event.stopPropagation();
                  onCardClick({ type: 'hand', index });
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  onCardDoubleClick?.({ type: 'hand', index });
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

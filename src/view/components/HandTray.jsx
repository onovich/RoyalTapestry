import { Card } from './Card.jsx';

export function HandTray({
  hand,
  selectedCard,
  dragSource,
  text,
  onCardClick,
  onCardDoubleClick,
  onCardPointerDown,
  onTrayClick
}) {
  return (
    <section className="hand-tray" data-drop-target="hand" onClick={onTrayClick} aria-label={text.handLabel}>
      {hand.length === 0 ? (
        <div className="empty-hand">{text.emptyHand}</div>
      ) : (
        <div className="hand-scroll">
          {hand.map((card, index) => (
            <div className="hand-card" key={card.id}>
              <Card
                card={card}
                selected={selectedCard?.type === 'hand' && selectedCard.index === index}
                muted={dragSource?.type === 'hand' && dragSource.index === index}
                label={text.cardLabel.replace('{rank}', card.rank).replace('{suit}', card.suit)}
                onClick={(event) => {
                  event.stopPropagation();
                  onCardClick({ type: 'hand', index });
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  onCardDoubleClick?.({ type: 'hand', index });
                }}
                onPointerDown={(event) => onCardPointerDown?.(event, { type: 'hand', index })}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

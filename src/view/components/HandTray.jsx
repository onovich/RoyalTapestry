import { useEffect, useRef, useState } from 'react';
import { Card } from './Card.jsx';

export function HandTray({
  hand,
  selectedCard,
  dragSource,
  dropTarget,
  settledCardId,
  text,
  onCardClick,
  onCardDoubleClick,
  onCardPointerDown,
  onTrayClick
}) {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(hand.length / 5);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    const handleScroll = () => {
      setCurrentPage(Math.round(container.scrollLeft / container.clientWidth));
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hand.length]);

  function scrollToPage(page) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: page * scrollRef.current.clientWidth,
      behavior: 'smooth'
    });
  }

  return (
    <section
      className={['hand-tray', dropTarget?.type === 'hand' ? 'tray-drop-target' : ''].join(' ')}
      data-drop-target="hand"
      onClick={onTrayClick}
      aria-label={text.handLabel}
    >
      {hand.length === 0 ? (
        <div className="empty-hand">{text.emptyHand}</div>
      ) : (
        <>
          <div className="hand-scroll" ref={scrollRef}>
            {hand.map((card, index) => (
              <div className={['hand-card', card.id === settledCardId ? 'card-settled' : ''].join(' ')} key={card.id}>
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
          {totalPages > 1 && (
            <div className="hand-pages">
              {Array.from({ length: totalPages }, (_, page) => (
                <button
                  key={page}
                  className={currentPage === page ? 'hand-page-active' : ''}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    scrollToPage(page);
                  }}
                >
                  {page + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

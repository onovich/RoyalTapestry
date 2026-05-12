export function Card({ card, selected = false, muted = false, onClick }) {
  if (!card) return null;

  function handleClick(event) {
    event.stopPropagation();
    onClick?.(event);
  }

  return (
    <button
      className={[
        'card',
        card.color === 'red' ? 'card-red' : 'card-black',
        selected ? 'card-selected' : '',
        muted ? 'card-muted' : ''
      ].join(' ')}
      onClick={handleClick}
      type="button"
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{card.suit}</span>
    </button>
  );
}

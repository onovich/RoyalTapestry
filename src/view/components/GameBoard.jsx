import { BOARD_SIZE } from '../../data/cards.js';
import { Card } from './Card.jsx';

export function GameBoard({ grid, scoring, selectedCard, highlight, onCellClick, onCardClick, onLineClick }) {
  const highlightedCells = new Set((highlight?.cells || []).map((cell) => `${cell.row}-${cell.column}`));
  const rowLines = scoring.lines.filter((line) => line.type === 'row');
  const columnLines = scoring.lines.filter((line) => line.type === 'column');
  const diagonalLines = scoring.lines.filter((line) => line.type === 'diagonal');

  function handleCellKeyDown(event, card, row, column) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();

    if (card) {
      onCardClick({ type: 'grid', row, column });
    } else {
      onCellClick({ type: 'grid', row, column });
    }
  }

  return (
    <section className="board-wrap" aria-label="Royal Tapestry board">
      <div className="diagonal-score-row">
        {diagonalLines.map((line) => (
          <button key={line.id} className="score-pill diagonal-pill" type="button" onClick={() => onLineClick(line)}>
            {line.result.score}
          </button>
        ))}
      </div>
      <div className="board-and-scores">
        <div className="board-grid">
          {grid.map((row, rowIndex) =>
            row.map((card, columnIndex) => {
              const isSelected = selectedCard?.type === 'grid'
                && selectedCard.row === rowIndex
                && selectedCard.column === columnIndex;
              const isHighlighted = highlightedCells.has(`${rowIndex}-${columnIndex}`);

              return (
                <div
                  className={`board-cell ${isHighlighted ? 'cell-highlighted' : ''}`}
                  key={`${rowIndex}-${columnIndex}`}
                  onClick={() => (card ? onCardClick({ type: 'grid', row: rowIndex, column: columnIndex }) : onCellClick({ type: 'grid', row: rowIndex, column: columnIndex }))}
                  onKeyDown={(event) => handleCellKeyDown(event, card, rowIndex, columnIndex)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Board cell ${rowIndex + 1}, ${columnIndex + 1}`}
                >
                  <Card card={card} selected={isSelected} onClick={() => onCardClick({ type: 'grid', row: rowIndex, column: columnIndex })} />
                </div>
              );
            })
          )}
        </div>
        <div className="row-scores">
          {rowLines.map((line) => (
            <button key={line.id} className="line-score" type="button" onClick={() => onLineClick(line)}>
              <strong>{line.result.score}</strong>
              <span>{line.result.score > 0 ? line.result.short : '-'}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="column-scores">
        {columnLines.map((line) => (
          <button key={line.id} className="line-score" type="button" onClick={() => onLineClick(line)}>
            <strong>{line.result.score}</strong>
            <span>{line.result.score > 0 ? line.result.short : '-'}</span>
          </button>
        ))}
        <div style={{ width: '2.25rem' }} />
      </div>
      <div className="board-index-row" aria-hidden="true">
        {Array.from({ length: BOARD_SIZE }, (_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>
    </section>
  );
}

import { BOARD_SIZE } from '../../data/cards.js';
import { Card } from './Card.jsx';

export function GameBoard({
  grid,
  scoring,
  selectedCard,
  highlight,
  hint,
  dragSource,
  text,
  onCellClick,
  onCardClick,
  onCardPointerDown,
  onLineClick
}) {
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
    <section className="board-wrap" aria-label={text.boardLabel}>
      <div className="diagonal-score-row">
        {diagonalLines.map((line) => (
          <button
            key={line.id}
            className={`score-pill diagonal-pill ${highlight?.id === line.id ? 'line-highlighted' : ''}`}
            type="button"
            onClick={() => onLineClick(line)}
          >
            <strong>{line.index === 0 ? '↘' : '↙'} {line.result.score}</strong>
            <span>{line.result.score > 0 ? text.hands[line.result.id].short : '-'}</span>
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
              const isHintSource = hint?.source?.type === 'grid'
                && hint.source.row === rowIndex
                && hint.source.column === columnIndex;
              const isHintTarget = hint?.target?.type === 'grid'
                && hint.target.row === rowIndex
                && hint.target.column === columnIndex;

              return (
                <div
                  className={[
                    'board-cell',
                    isHighlighted ? 'cell-highlighted' : '',
                    isHintSource ? 'hint-source' : '',
                    isHintTarget ? 'hint-target' : ''
                  ].join(' ')}
                  data-drop-target="grid"
                  data-row={rowIndex}
                  data-column={columnIndex}
                  key={`${rowIndex}-${columnIndex}`}
                  onClick={() => (card ? onCardClick({ type: 'grid', row: rowIndex, column: columnIndex }) : onCellClick({ type: 'grid', row: rowIndex, column: columnIndex }))}
                  onKeyDown={(event) => handleCellKeyDown(event, card, rowIndex, columnIndex)}
                  role="button"
                  tabIndex={0}
                  aria-label={text.boardCellLabel.replace('{row}', rowIndex + 1).replace('{column}', columnIndex + 1)}
                >
                  <Card
                    card={card}
                    selected={isSelected}
                    muted={dragSource?.type === 'grid' && dragSource.row === rowIndex && dragSource.column === columnIndex}
                    label={card ? text.cardLabel.replace('{rank}', card.rank).replace('{suit}', card.suit) : undefined}
                    onClick={() => onCardClick({ type: 'grid', row: rowIndex, column: columnIndex })}
                    onPointerDown={(event) => onCardPointerDown?.(event, { type: 'grid', row: rowIndex, column: columnIndex })}
                  />
                </div>
              );
            })
          )}
        </div>
        <div className="row-scores">
          {rowLines.map((line) => (
            <button
              key={line.id}
              className={`line-score ${highlight?.id === line.id ? 'line-highlighted' : ''}`}
              type="button"
              onClick={() => onLineClick(line)}
            >
              <strong>{line.result.score}</strong>
              <span>{line.result.score > 0 ? text.hands[line.result.id].short : '-'}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="column-scores">
        {columnLines.map((line) => (
          <button
            key={line.id}
            className={`line-score ${highlight?.id === line.id ? 'line-highlighted' : ''}`}
            type="button"
            onClick={() => onLineClick(line)}
          >
            <strong>{line.result.score}</strong>
            <span>{line.result.score > 0 ? text.hands[line.result.id].short : '-'}</span>
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

import { sameSource } from '../engine/movement.js';

export function useCardPlacement({
  game,
  getCardAtSource,
  consumeSuppressedClick,
  showSettle,
  showLockedNudge
}) {
  function handleCardClick(source) {
    if (game.surrendered) return;
    if (game.isSourceLocked(source)) {
      showLockedNudge(source);
      return;
    }

    if (consumeSuppressedClick()) return;

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

  return {
    handleCardClick,
    handleCellClick,
    handleTrayClick,
    handleHandDoubleClick
  };
}

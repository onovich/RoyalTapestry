# TODO

## Locked Combo In-Line Reorder

Future design for locked combo cards. Do not implement yet.

- Locked cards should remain protected from leaving their locked combo.
- If a locked card belongs to exactly one locked combo, it may be reordered by drag-and-drop within that same locked combo line.
- The same card must not be moved to any other board position. Dropping it outside the locked combo line should be treated as invalid and return the card to its original position, not to the hand.
- Dropping another card onto a locked card is only allowed when both cards belong to the same single locked combo and the operation is an in-line reorder.
- If a locked card belongs to multiple locked combos, such as the intersection of a locked row and a locked column, it must be fully frozen: no click interaction, no drag source behavior, no reorder, and no replacement by another card.
- Empty cells are never locked. Locking is based on the cards that formed a scoring combo at the moment the row, column, or diagonal score box was locked.

## Juicier Interaction Feedback

Future design notes only. Do not implement yet.

- Add a quick target-cell pulse or bright edge when a dragged card is hovering over a valid drop target.
- Add a short card settle animation on successful placement, such as a tiny press-down and rebound.
- Add invalid-drop return animation so cards visibly snap back to their original position instead of disappearing instantly.
- For scoring combos, animate the five involved cards in a short scan sequence rather than flashing all cells at the same time.
- Animate score boxes from the previous value to the new value, then settle on the combo short name.
- Show combo feedback closer to the board as a temporary floating badge, such as `Three of a Kind +10` / `三条 +10`.
- If multiple combos are created by one move, reveal them sequentially instead of only surfacing the first combo.
- For locked combos, add a short "click/lock-in" border animation when locking and a fade-out when unlocking.
- When the player tries to drag a locked card, add a tiny shake to communicate that it is protected.
- Consider optional sound effects for place, invalid drop, combo, lock, and undo.
- On mobile, consider short vibration feedback for combo and lock events.
- Add a mute/sensory toggle before adding sound or vibration.

Suggested priority:

1. Placement settle animation and invalid-drop return animation.
2. Combo scan animation and score number pop.
3. Sequential multi-combo feedback.
4. Lock/unlock animation and locked-card shake.
5. Optional sound and vibration settings.

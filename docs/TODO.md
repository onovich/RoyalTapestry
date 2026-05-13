# TODO

## Locked Combo In-Line Reorder

Future design for locked combo cards. Do not implement yet.

- Locked cards should remain protected from leaving their locked combo.
- If a locked card belongs to exactly one locked combo, it may be reordered by drag-and-drop within that same locked combo line.
- The same card must not be moved to any other board position. Dropping it outside the locked combo line should be treated as invalid and return the card to its original position, not to the hand.
- Dropping another card onto a locked card is only allowed when both cards belong to the same single locked combo and the operation is an in-line reorder.
- If a locked card belongs to multiple locked combos, such as the intersection of a locked row and a locked column, it must be fully frozen: no click interaction, no drag source behavior, no reorder, and no replacement by another card.
- Empty cells are never locked. Locking is based on the cards that formed a scoring combo at the moment the row, column, or diagonal score box was locked.

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

## Chill And Zen Atmosphere

Future design notes only. Do not implement yet.

- Treat the game as a slow tabletop space rather than a high-pressure puzzle.
- Atmosphere should support the card table, not compete with it.
- Add a side vinyl record object as a low-key music controller.
- The record may slowly spin while music is playing and ease to a stop when paused.
- Consider channels such as rain night, dusk, lo-fi, jazz, tea room, or quiet ambient.
- Keep music optional, with clear mute and volume controls.
- Prefer copyright-safe short loops, ambient layers, or synthesized textures.
- Consider shipping the vinyl UI first even if music content comes later.
- Add progressive atmosphere based on play state or score thresholds:
  - 0 score: quiet table, almost no background motion.
  - 25% target score: subtle table-edge glow or slow light drift.
  - 50% target score: low-density particles or soft background shimmer.
  - 75% target score: richer vinyl detail, subtle spectrum movement, or an added ambient layer.
  - Target reached: gently brighter room, not an arcade celebration.
  - Surrendered: cooler tone and reduced ambience to reinforce failure state.
- Avoid repetitive ambience by using parameterized animation:
  - random particle density, color, speed, and direction;
  - several light-flow path presets with random phase;
  - seed-based background variation per level;
  - layered audio stems that fade in as score improves.
- Map combo types to subtle ambience accents:
  - flush: soft color wash;
  - straight: linear sweep;
  - full house or stronger: slow warm pulse.
- Add an idle state: after a period without input, let the room become slightly more alive while keeping cards readable.
- Add a "Zen Mode" with no target, failure, or pressure: just arrange cards and enjoy combo feedback.
- Add lightweight unlockables such as records, table cloths, card backs, or room themes.
- Themes should feel like spaces rather than skins, such as rain window, late-night desk, old cafe, or quiet wood table.
- Add ambient sounds such as rain, wind, vinyl noise, or cup clinks before adding busy melodies.
- Auto-save the current table, locks, music state, and ambience state so the player can leave and return later.

Suggested priority:

1. Auto-save current table state.
2. Vinyl UI with mute and volume controls.
3. Score-progressive ambience layer.
4. Idle ambience behavior.
5. Zen Mode and theme or record collection.

# Royal Tapestry Refactor Standard

This project should stay small, readable, and easy to test. Refactors are welcome when they preserve the game feel while making ownership boundaries clearer.

## Architecture Boundaries

- `src/data/` owns static game data and UI copy. It should not mutate runtime state.
- `src/logic/engine/` owns framework-independent game rules. It must stay pure JavaScript with no React, DOM, timers, or browser globals.
- `src/logic/hooks/` owns React state, lifecycle, drag/drop wiring, timers, refs, and interaction feedback.
- `src/view/screens/` owns page composition and connects hooks to components. It should not contain raw DOM drop resolution, pointer math, scoring rules, or card movement rules.
- `src/view/components/` owns reusable presentation. Components receive data and callbacks through props; they should not mutate game rules directly.
- `src/styles.css` remains an import-only entry. New styles belong in focused files under `src/styles/`.

## Commit Checklist

- Keep game rules in `src/logic/engine/` and cover rule changes with `npm test`.
- Keep gesture, timer, and feedback behavior in `src/logic/hooks/`.
- Keep screens thin: composition, labels, and prop wiring only.
- Keep components presentational and reusable.
- Keep CSS split by concern; do not grow `src/styles.css` beyond imports.
- Run `npm run validate` before pushing meaningful code changes.
- Run `npm run smoke` after UI interaction or layout changes when a browser is available.

## Automated Guard

`npm run arch-check` is the fast architecture self-check. It verifies the core boundaries above and is included in `npm run validate`.

The project Codex hook in `.codex/hooks.json` runs this fast check before `git commit` commands and blocks the commit when the architecture guard fails.

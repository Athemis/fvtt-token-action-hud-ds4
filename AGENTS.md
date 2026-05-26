# AGENTS.md

## Project Shape
- Foundry VTT module for the DS4 system; it depends on `token-action-hud-core` and is packaged through `module.json`.
- Runtime entrypoint is the generated `scripts/token-action-hud-ds4.min.js`; source lives in `scripts/*.js` and is bundled by Rollup.
- The minified bundle and sourcemap are **not** tracked in git; they are built by CI when a release tag is pushed.
- `module.json` has release-time placeholders for `url`, `version`, `manifest`, and `download`; GitHub release workflow replaces them from the release tag.

## Commands
- Install with `npm ci` when the lockfile works; CI falls back to `npm install`.
- `npm run build` bundles and minifies source into `scripts/token-action-hud-ds4.min.js` plus sourcemap (for local development only; CI handles release builds).
- `npm run dev` runs Rollup in watch mode.
- `npm run lint` uses StandardJS with Foundry globals; `npm run lint:fix` applies fixes.
- There is no test or typecheck script in this repo; use `npm run build` and `npm run lint` for local verification.

## Source And Build Gotchas
- Do not hand-edit `scripts/token-action-hud-ds4.min.js`; Rollup excludes it from input and rewrites it.
- Generated artifacts are built exclusively by CI; contributors should not commit them.
- CI uses Node 22 and runs build on pushes/PRs; lint is currently `continue-on-error` in CI but should still be treated as required locally.

## Architecture Notes
- `scripts/init.js` waits for `tokenActionHudCoreApiReady`, sets `game.modules.get(MODULE.ID).api`, then calls `tokenActionHudSystemReady` for core discovery.
- `SystemManager` extends Token Action HUD Core’s `SystemManager` inside the core-ready hook; avoid using exported classes before that hook assigns them.
- `ActionHandler` builds HUD groups/actions from DS4 actor data; `RollHandler` consumes the encoded action values. Keep new `encodedValue` formats aligned with `RollHandler.handleActionClick` parsing.
- Default groups/layout are in `constants.js` and `defaults.js`; settings are registered through core via `system-manager.js` and localized in `languages/en.json` and `languages/de.json`.

## Style
- This is ESM JavaScript with StandardJS style: no semicolons, space before function parens, and existing Foundry globals are declared in `.eslintrc.json` and the npm lint command.
- Generated `*.min.js` files and `node_modules/` are ignored by StandardJS via `.standardignore`.

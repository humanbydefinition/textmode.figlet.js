# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript add-on library for `textmode.js` that provides FIGlet / FIGfont parsing, layout, rendering, and plugin integration.

- `src/index.ts` is the public entry point.
- `src/figfont/` contains parser, font model, layout engine, smush rules, and shared types.
- `src/plugin/`, `src/extensions/`, `src/augmentations/`, and `src/state/` integrate FIGlet behavior into `textmode.js`.
- `src/error/` and `src/utils/` hold shared support code.
- `tests/unit/` and `tests/integration/` contain Vitest suites; fixtures and builders live in `tests/fixtures/` and `tests/helpers/`.
- `examples/` contains browser sketches, and `typedoc-plugins/` plus `typedoc.json` drive documentation generation.

## Build, Test, and Development Commands

- `npm run dev`: start Vite locally on port `5175`.
- `npm run build`: build both bundles and declaration files.
- `npm run build:bundle`: run the Vite library build.
- `npm run build:types`: emit TypeScript declarations with `tsc`.
- `npm run test`: run all Vitest projects.
- `npm run test:unit` / `npm run test:integration`: run scoped test suites.
- `npm run test:coverage`: generate coverage output.
- `npm run check`: run format, lint, markdownlint, type checks, tests, and build.
- `npm run build:docs`: generate TypeDoc documentation.

## Coding Style & Naming Conventions

Use TypeScript ESM and keep public exports flowing through `src/index.ts` or the relevant folder `index.ts`. Follow the existing tab indentation and Prettier formatting; run `npm run format` before large changes. ESLint applies to `src/**/*.{ts,js}` and warns on unused variables unless prefixed with `_`, plus `any` usage. Prefer descriptive PascalCase for classes and types, camelCase for functions and variables, and filenames that match their main export, such as `FigFontParser.ts`.

## Testing Guidelines

Tests use Vitest with the `jsdom` environment and global setup from `tests/setup/global.setup.ts`. Name test files `*.test.ts` under either `tests/unit/` or `tests/integration/`. Add focused fixtures under `tests/fixtures/` when layout or parser behavior depends on specific FIGfont input. Run `npm run test` for normal validation, and `npm run check` before publishing or opening a release-bound PR.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits enforced by commitlint: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `build:`, `ci:`, `chore:`, `perf:`, `style:`, or `revert:`. Keep headers under 100 characters, for example `fix: handle truncated figfont input`.

PRs should describe the behavioral change, list validation commands run, link related issues, and include screenshots or sketch references when examples or rendering behavior changes.

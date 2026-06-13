# textmode.figlet.js (✿◠‿◠)

<div align="center">

<table>
	<tr>
		<td align="center">
			<a href="https://www.typescriptlang.org/"><img alt="TypeScript badge" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" /></a>&nbsp;<a href="https://vitejs.dev/"><img alt="Vite badge" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" /></a>&nbsp;<a href="http://www.figlet.org/"><img alt="FIGlet badge" src="https://img.shields.io/badge/FIGlet-111111" /></a>
		</td>
		<td align="center">
			<a href="https://code.textmode.art/"><img alt="docs badge" src="https://img.shields.io/badge/docs-vitepress-646cff?logo=vitepress&logoColor=white" /></a>&nbsp;<a href="https://discord.gg/sjrw8QXNks"><img alt="Discord badge" src="https://img.shields.io/discord/1357070706181017691?color=5865F2&label=Discord&logo=discord&logoColor=white" /></a>
		</td>
		<td align="center">
			<a href="https://ko-fi.com/V7V8JG2FY"><img alt="Ko-fi badge" src="https://shields.io/badge/ko--fi-donate-ff5f5f?logo=ko-fi" /></a>&nbsp;<a href="https://github.com/sponsors/humanbydefinition"><img alt="GitHub Sponsors badge" src="https://img.shields.io/badge/sponsor-30363D?logo=GitHub-Sponsors&logoColor=%23EA4AAA" /></a>
		</td>
	</tr>
</table>

</div>

`textmode.figlet.js` is an add-on library for `textmode.js` that provides FIGlet / FIGfont support. It includes a FIGfont parser, layout engine, and rendering API that integrates with the `Textmodifier` system in `textmode.js`, allowing you to draw FIGlet text with configurable layout behavior and measurement helpers.

## Features

- Parse raw `.flf` sources into reusable `TextmodeFigFont` instances
- Load FIGfonts at runtime with `loadFigFont()`
- Draw FIGlet text with configurable horizontal and vertical layout behavior
- Measure rendered output with width, height, and bounds helpers before drawing
- Store alignment and baseline preferences per `Textmodifier` instance

## Installation

### Prerequisites

To get started with `textmode.figlet.js`, you'll need:

- `textmode.js` `0.16.0` or newer
- A modern browser with the same runtime requirements as `textmode.js`
- Node.js `20.8.1+` and `npm` (optional, for ESM installation)

### UMD

To use `textmode.figlet.js` in a browser without a bundler, load the UMD builds for both `textmode.js` and this add-on. `textmode.js` must be loaded first so the FIGlet add-on can attach to the expected global runtime.

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>textmode.figlet.js sketch</title>

		<script src="https://cdn.jsdelivr.net/npm/textmode.js@latest/dist/textmode.umd.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/textmode.figlet.js@latest/dist/textmode.figlet.umd.js"></script>
	</head>
	<body>
		<script src="./sketch.js"></script>
	</body>
</html>
```

```js
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [FigletPlugin],
});

t.setup(async () => {
	const bulbhead = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');

	t.figFont(bulbhead);
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

t.draw(() => {
	t.background(8, 12, 24);
	t.charColor(255, 220, 120);
	t.figText('FIGLET', 0, 0, {
		horizontalLayout: 'fitted',
	});
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

The UMD bundle exposes `FigletPlugin` globally, along with the other runtime exports such as `TextmodeFigFont` and `FigFontParser`.

### ESM

Install the core library and the FIGlet add-on together:

```bash
npm install textmode.js textmode.figlet.js
```

Then import both packages in your sketch or application code:

```ts
import { textmode } from 'textmode.js';
import { FigletPlugin } from 'textmode.figlet.js';
```

Importing `textmode.figlet.js` provides the TypeScript augmentation. Installing `FigletPlugin` enables the runtime FIGlet methods on that `Textmodifier` instance.

## Plugin setup

```ts
import { textmode } from 'textmode.js';
import { FigletPlugin } from 'textmode.figlet.js';

const t = textmode.create({
	width: 800,
	height: 600,
	plugins: [FigletPlugin],
});
```

The plugin installs the FIGlet drawing and measurement API during setup and removes it again if the plugin is uninstalled.

## Loading `.flf` fonts

```ts
const bulbhead = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');

t.figFont(bulbhead);

const custom = t.parseFigFont('Custom', figFontSource);
```

Any CORS-enabled `.flf` URL works for runtime loading.

## Drawing and measuring text

```ts
t.figTextAlign('center');
t.figTextBaseline('center');

t.figText('HELLO', 0, 0, {
	horizontalLayout: 'fitted',
});

const width = t.figTextWidth('HELLO');
const height = t.figTextHeight('HELLO');
const bounds = t.figTextBounds('HELLO');
```

Use the measurement helpers when you need to position FIGlet text precisely before rendering it.

## Alignment and baseline

- `figTextAlign('left' | 'center' | 'right')`
- `figTextBaseline('top' | 'center' | 'baseline' | 'bottom')`

These settings are stored in plugin-owned state per `Textmodifier` instance and apply to subsequent `figText()` calls until changed.

## Next steps

Visit the `textmode.js` documentation at [code.textmode.art](https://code.textmode.art/) for broader library guides and API reference, then use the local examples in this package to validate your FIGlet setup and rendering behavior.

## License

`textmode.figlet.js` is licensed under the MIT License.

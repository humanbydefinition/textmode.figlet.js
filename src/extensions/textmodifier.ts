import type { Textmodifier } from 'textmode.js';
import { TextmodeColor } from 'textmode.js';

import { TextmodeFigFont } from '../figfont';
import { FigletError } from '../error/FigletError';
import { clearFigletState, getFigletState } from '../state/figletState';

import type {
	FigRenderCell,
	FigTextAlign,
	FigTextBaseline,
	FigTextColorResolver,
	FigTextColorValue,
	FigTextOptions,
} from '../figfont';

const TEXTMODIFIER_EXTENSION_NAMES = [
	'loadFigFont',
	'parseFigFont',
	'figFont',
	'figText',
	'figTextWidth',
	'figTextHeight',
	'figTextBounds',
	'figTextAlign',
	'figTextBaseline',
] as const;

type DisposableTracker = Textmodifier & {
	_trackDisposable?: (disposable: TextmodeFigFont) => void;
};

function resolveColor(value: FigTextColorResolver | undefined, cell: FigRenderCell): FigTextColorValue | undefined {
	if (value === undefined) {
		return undefined;
	}

	return typeof value === 'function' ? value(cell) : value;
}

function applyResolvedColor(
	textmodifier: Textmodifier,
	methodName: 'charColor' | 'cellColor',
	value: FigTextColorValue
): void {
	if (value instanceof TextmodeColor || typeof value === 'string') {
		if (methodName === 'charColor') {
			textmodifier.charColor(value);
			return;
		}

		textmodifier.cellColor(value);
		return;
	}

	if (typeof value === 'number') {
		if (methodName === 'charColor') {
			textmodifier.charColor(value);
			return;
		}

		textmodifier.cellColor(value);
		return;
	}

	if (value.length === 4) {
		if (methodName === 'charColor') {
			textmodifier.charColor(value[0], value[1], value[2], value[3]);
			return;
		}

		textmodifier.cellColor(value[0], value[1], value[2], value[3]);
		return;
	}

	if (methodName === 'charColor') {
		textmodifier.charColor(value[0], value[1], value[2]);
		return;
	}

	textmodifier.cellColor(value[0], value[1], value[2]);
}

function getActiveFigFont(textmodifier: Textmodifier): TextmodeFigFont {
	const font = getFigletState(textmodifier).activeFont;
	if (!font) {
		throw new FigletError('No FIGlet font is active. Call figFont() first.');
	}

	return font;
}

function getHorizontalOffset(cols: number, align: FigTextAlign): number {
	if (align === 'center') {
		return -Math.floor(cols / 2);
	}

	if (align === 'right') {
		return -(cols - 1);
	}

	return 0;
}

function getVerticalOffset(rows: number, baseline: number, mode: FigTextBaseline): number {
	if (mode === 'top') {
		return 0;
	}

	if (mode === 'center') {
		return -Math.floor(rows / 2);
	}

	if (mode === 'bottom') {
		return -(rows - 1);
	}

	return -(baseline - 1);
}

function trackDisposable(textmodifier: Textmodifier, figFont: TextmodeFigFont): void {
	(textmodifier as DisposableTracker)._trackDisposable?.(figFont);
}

function defineInstanceMethod(textmodifier: Textmodifier, methodName: string, implementation: unknown): void {
	Object.defineProperty(textmodifier, methodName, {
		value: implementation,
		writable: true,
		configurable: true,
		enumerable: false,
	});
}

/**
 * Install FIGlet Textmodifier extensions on a specific `Textmodifier` instance.
 *
 * @param textmodifier Target instance.
 */
export function installTextmodifierFigletExtensions(textmodifier: Textmodifier): void {
	defineInstanceMethod(textmodifier, 'loadFigFont', async function (this: Textmodifier, source: string | URL) {
		const figFont = await TextmodeFigFont._fromURL(source);
		trackDisposable(this, figFont);
		return figFont;
	});

	defineInstanceMethod(textmodifier, 'parseFigFont', function (this: Textmodifier, name: string, data: string) {
		const figFont = TextmodeFigFont._fromString(name, data);
		trackDisposable(this, figFont);
		return figFont;
	});

	defineInstanceMethod(textmodifier, 'figFont', function (this: Textmodifier, font?: TextmodeFigFont) {
		const state = getFigletState(this);

		if (font === undefined) {
			return state.activeFont;
		}

		state.activeFont = font;
	});

	defineInstanceMethod(
		textmodifier,
		'figText',
		function (this: Textmodifier, text: string, col: number, row: number, options: FigTextOptions = {}) {
			const figFont = getActiveFigFont(this);
			const plan = figFont.planText(text, options);
			const state = getFigletState(this);
			const startCol = col + getHorizontalOffset(plan.cols, state.align);
			const startRow = row + getVerticalOffset(plan.rows, figFont.baseline, state.baseline);

			this.push();
			this.translate(startCol, startRow, 0);

			for (const cell of plan.cells) {
				this.push();
				this.translate(cell.col, cell.row, 0);
				const charColor = resolveColor(options.charColor, cell);
				const cellColor = resolveColor(options.cellColor, cell);

				this.char(cell.char);

				// textmode.js resets the active character color inside char(),
				// so any per-cell override must be applied after selecting the glyph.
				if (charColor !== undefined) {
					applyResolvedColor(this, 'charColor', charColor);
				}

				if (cellColor !== undefined) {
					applyResolvedColor(this, 'cellColor', cellColor);
				}

				this.point();
				this.pop();
			}

			this.pop();
		}
	);

	defineInstanceMethod(
		textmodifier,
		'figTextWidth',
		function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(this).measureText(text, options).cols;
		}
	);

	defineInstanceMethod(
		textmodifier,
		'figTextHeight',
		function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(this).measureText(text, options).rows;
		}
	);

	defineInstanceMethod(
		textmodifier,
		'figTextBounds',
		function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(this).measureText(text, options);
		}
	);

	defineInstanceMethod(textmodifier, 'figTextAlign', function (this: Textmodifier, align?: FigTextAlign) {
		const state = getFigletState(this);

		if (align === undefined) {
			return state.align;
		}

		state.align = align;
	});

	defineInstanceMethod(textmodifier, 'figTextBaseline', function (this: Textmodifier, baseline?: FigTextBaseline) {
		const state = getFigletState(this);

		if (baseline === undefined) {
			return state.baseline;
		}

		state.baseline = baseline;
	});
}

/**
 * Remove FIGlet Textmodifier extensions from a specific `Textmodifier` instance.
 *
 * @param textmodifier Target instance.
 */
export function uninstallTextmodifierFigletExtensions(textmodifier: Textmodifier): void {
	for (const methodName of TEXTMODIFIER_EXTENSION_NAMES) {
		delete (textmodifier as unknown as Record<string, unknown>)[methodName];
	}

	clearFigletState(textmodifier);
}

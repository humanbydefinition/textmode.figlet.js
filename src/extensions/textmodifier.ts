import type { Textmodifier } from 'textmode.js';
import { color } from 'textmode.js';

import { TextmodeFigFont } from '../figfont';
import { FigletError } from '../error/FigletError';
import { clearFigletState, getFigletState } from '../state/figletState';

import type {
	FigRenderCell,
	FigRenderPlan,
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

type TextmodifierPrintAlignment = Textmodifier & {
	_printAlignHorizontal?: 'left' | 'center' | 'right';
	_printAlignVertical?: 'top' | 'middle' | 'bottom';
};

interface FigTextOrigin {
	col: number;
	row: number;
}

interface FigTextRun {
	text: string;
	col: number;
	row: number;
	charColor?: FigTextColorValue;
	cellColor?: FigTextColorValue;
	styleKey: string;
}

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
	if (value instanceof color.TextmodeColor || typeof value === 'string') {
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

function getFigTextOrigin(
	plan: FigRenderPlan,
	figFont: TextmodeFigFont,
	state: { align: FigTextAlign; baseline: FigTextBaseline },
	col: number,
	row: number
): FigTextOrigin {
	return {
		col: col + getHorizontalOffset(plan.cols, state.align),
		row: row + getVerticalOffset(plan.rows, figFont.baseline, state.baseline),
	};
}

function withLeftTopPrintAlignment(textmodifier: Textmodifier, render: () => void): void {
	const alignedTextmodifier = textmodifier as TextmodifierPrintAlignment;
	const previousHorizontal = alignedTextmodifier._printAlignHorizontal;
	const previousVertical = alignedTextmodifier._printAlignVertical;

	textmodifier.printAlign('left', 'top');

	try {
		render();
	} finally {
		if (previousHorizontal === undefined) {
			delete alignedTextmodifier._printAlignHorizontal;
		} else {
			alignedTextmodifier._printAlignHorizontal = previousHorizontal;
		}

		if (previousVertical === undefined) {
			delete alignedTextmodifier._printAlignVertical;
		} else {
			alignedTextmodifier._printAlignVertical = previousVertical;
		}
	}
}

function createVisibleFigTextRuns(plan: FigRenderPlan, options: FigTextOptions): FigTextRun[] {
	const runs: FigTextRun[] = [];
	const hasColorCallback = typeof options.charColor === 'function' || typeof options.cellColor === 'function';
	let activeRun: FigTextRun | undefined;

	for (const cell of plan.cells) {
		const charColor = hasColorCallback ? resolveColor(options.charColor, cell) : undefined;
		const cellColor = hasColorCallback ? resolveColor(options.cellColor, cell) : undefined;
		const styleKey = hasColorCallback ? `${getColorStyleKey(charColor)}|${getColorStyleKey(cellColor)}` : 'static';
		const shouldStartRun =
			!activeRun ||
			activeRun.row !== cell.row ||
			activeRun.col + activeRun.text.length !== cell.col ||
			activeRun.styleKey !== styleKey;

		if (shouldStartRun) {
			activeRun = {
				text: cell.char,
				col: cell.col,
				row: cell.row,
				charColor,
				cellColor,
				styleKey,
			};
			runs.push(activeRun);
			continue;
		}

		activeRun!.text += cell.char;
	}

	return runs;
}

function getColorStyleKey(value: FigTextColorValue | undefined): string {
	if (value === undefined) {
		return 'current';
	}

	if (typeof value === 'number') {
		return `number:${value}`;
	}

	if (typeof value === 'string') {
		return `string:${value}`;
	}

	if (Array.isArray(value)) {
		return `array:${value.length}:${value.join(',')}`;
	}

	return `color:${value.r},${value.g},${value.b},${value.a}`;
}

function renderFigTextRuns(
	textmodifier: Textmodifier,
	runs: FigTextRun[],
	origin: FigTextOrigin,
	options: FigTextOptions
): void {
	const hasColorCallback = typeof options.charColor === 'function' || typeof options.cellColor === 'function';

	withLeftTopPrintAlignment(textmodifier, () => {
		if (!hasColorCallback) {
			const charColor = typeof options.charColor === 'function' ? undefined : options.charColor;
			const cellColor = typeof options.cellColor === 'function' ? undefined : options.cellColor;

			textmodifier.push();
			try {
				if (charColor !== undefined) {
					applyResolvedColor(textmodifier, 'charColor', charColor);
				}

				if (cellColor !== undefined) {
					applyResolvedColor(textmodifier, 'cellColor', cellColor);
				}

				for (const run of runs) {
					textmodifier.print(run.text, origin.col + run.col, origin.row + run.row, { markup: false });
				}
			} finally {
				textmodifier.pop();
			}
			return;
		}

		for (const run of runs) {
			textmodifier.push();
			try {
				if (run.charColor !== undefined) {
					applyResolvedColor(textmodifier, 'charColor', run.charColor);
				}

				if (run.cellColor !== undefined) {
					applyResolvedColor(textmodifier, 'cellColor', run.cellColor);
				}

				textmodifier.print(run.text, origin.col + run.col, origin.row + run.row, { markup: false });
			} finally {
				textmodifier.pop();
			}
		}
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
			const origin = getFigTextOrigin(plan, figFont, state, col, row);
			const runs = createVisibleFigTextRuns(plan, options);

			renderFigTextRuns(this, runs, origin, options);
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

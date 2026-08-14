import type { TextmodePluginContext, Textmodifier } from 'textmode.js';
import { color } from 'textmode.js';

import { TextmodeFigFont } from '../figfont';
import { FigletError } from '../error/FigletError';
import { getFigletState } from '../state/figletState';

import type {
	FigRenderCell,
	FigTextAlign,
	FigTextBaseline,
	FigTextColorResolver,
	FigTextColorValue,
	FigTextOptions,
} from '../figfont';

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

/**
 * Install FIGlet Textmodifier extensions on a specific `Textmodifier` instance.
 *
 * Methods are registered through {@link TextmodePluginContext.defineExtension} so the
 * plugin runtime handles conflict detection and uninstall cleanup uniformly. The
 * extension properties are defined as instance own-properties and are removed by the
 * host when the plugin is uninstalled.
 *
 * @param api The textmode.js plugin context.
 */
export function installTextmodifierFigletExtensions(api: TextmodePluginContext): void {
	api.defineExtension('textmodifier', 'loadFigFont', {
		value: async function (this: Textmodifier, source: string | URL) {
			const figFont = await TextmodeFigFont._fromURL(source);
			trackDisposable(this, figFont);
			return figFont;
		},
	});

	api.defineExtension('textmodifier', 'parseFigFont', {
		value: function (this: Textmodifier, name: string, data: string) {
			const figFont = TextmodeFigFont._fromString(name, data);
			trackDisposable(this, figFont);
			return figFont;
		},
	});

	api.defineExtension('textmodifier', 'figFont', {
		value: function (this: Textmodifier, font?: TextmodeFigFont) {
			const state = getFigletState(this);

			if (font === undefined) {
				return state.activeFont;
			}

			state.activeFont = font;
		},
	});

	api.defineExtension('textmodifier', 'figText', {
		value: function (this: Textmodifier, text: string, col: number, row: number, options: FigTextOptions = {}) {
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

				// Apply per-cell overrides after selecting the glyph so the emitted draw
				// uses the requested colors regardless of the runtime's internal ordering.
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
		},
	});

	api.defineExtension('textmodifier', 'figTextWidth', {
		value: function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(this).measureText(text, options).cols;
		},
	});

	api.defineExtension('textmodifier', 'figTextHeight', {
		value: function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(this).measureText(text, options).rows;
		},
	});

	api.defineExtension('textmodifier', 'figTextBounds', {
		value: function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(this).measureText(text, options);
		},
	});

	api.defineExtension('textmodifier', 'figTextAlign', {
		value: function (this: Textmodifier, align?: FigTextAlign) {
			const state = getFigletState(this);

			if (align === undefined) {
				return state.align;
			}

			state.align = align;
		},
	});

	api.defineExtension('textmodifier', 'figTextBaseline', {
		value: function (this: Textmodifier, baseline?: FigTextBaseline) {
			const state = getFigletState(this);

			if (baseline === undefined) {
				return state.baseline;
			}

			state.baseline = baseline;
		},
	});
}

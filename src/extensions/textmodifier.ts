import type { TextmodePluginContext, Textmodifier } from 'textmode.js';

import { TextmodeFigFont } from '../figfont';
import { FigletError } from '../error/FigletError';
import { assertFigletStateLive, trackFont, type FigletPluginState } from '../state/figletState';

import type {
	FigTextAlign,
	FigTextBaseline,
	FigTextCellContext,
	FigTextColorResolver,
	FigTextColorValue,
	FigTextOptions,
} from '../figfont';

function resolveColor(
	value: FigTextColorResolver | undefined,
	cell: FigTextCellContext
): FigTextColorValue | undefined {
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
	if (Array.isArray(value)) {
		if (value.length === 4) {
			textmodifier[methodName](value[0], value[1], value[2], value[3]);
			return;
		}

		textmodifier[methodName](value[0], value[1], value[2]);
		return;
	}

	if (typeof value === 'number') {
		textmodifier[methodName](value);
		return;
	}

	textmodifier[methodName](value);
}

function getActiveFigFont(state: FigletPluginState): TextmodeFigFont {
	assertFigletStateLive(state);
	const font = state.activeFont;
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
export function installTextmodifierFigletExtensions(api: TextmodePluginContext, state: FigletPluginState): void {
	api.defineExtension('textmodifier', 'loadFigFont', {
		value: async function (this: Textmodifier, source: string | URL) {
			assertFigletStateLive(state);
			const figFont = await TextmodeFigFont._fromURL(source);
			try {
				return trackFont(state, figFont);
			} catch (error) {
				figFont.dispose();
				throw error;
			}
		},
	});

	api.defineExtension('textmodifier', 'parseFigFont', {
		value: function (this: Textmodifier, name: string, data: string) {
			const figFont = TextmodeFigFont._fromString(name, data);
			try {
				return trackFont(state, figFont);
			} catch (error) {
				figFont.dispose();
				throw error;
			}
		},
	});

	api.defineExtension('textmodifier', 'figFont', {
		value: function (this: Textmodifier, font?: TextmodeFigFont) {
			assertFigletStateLive(state);
			if (font === undefined) {
				return state.activeFont;
			}

			state.activeFont = font;
		},
	});

	api.defineExtension('textmodifier', 'figText', {
		value: function (this: Textmodifier, text: string, col: number, row: number, options: FigTextOptions = {}) {
			const figFont = getActiveFigFont(state);
			const plan = figFont.planText(text, options);
			const startCol = col + getHorizontalOffset(plan.cols, state.align);
			const startRow = row + getVerticalOffset(plan.rows, figFont.baseline, state.baseline);

			this.push();
			try {
				this.translate(startCol, startRow, 0);

				for (const cell of plan.cells) {
					this.push();
					try {
						this.translate(cell.col, cell.row, 0);
						const charColor = resolveColor(options.charColor, cell);
						const cellColor = resolveColor(options.cellColor, cell);

						this.char(cell.char);

						// Apply per-cell overrides after selecting the glyph so the emitted draw
						// uses the requested colors regardless of the runtime's internal ordering.
						if (charColor !== undefined) applyResolvedColor(this, 'charColor', charColor);
						if (cellColor !== undefined) applyResolvedColor(this, 'cellColor', cellColor);

						this.point();
					} finally {
						this.pop();
					}
				}
			} finally {
				this.pop();
			}
		},
	});

	api.defineExtension('textmodifier', 'figTextWidth', {
		value: function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(state).measureText(text, options).cols;
		},
	});

	api.defineExtension('textmodifier', 'figTextHeight', {
		value: function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(state).measureText(text, options).rows;
		},
	});

	api.defineExtension('textmodifier', 'figTextBounds', {
		value: function (this: Textmodifier, text: string, options: FigTextOptions = {}) {
			return getActiveFigFont(state).measureText(text, options);
		},
	});

	api.defineExtension('textmodifier', 'figTextAlign', {
		value: function (this: Textmodifier, align?: FigTextAlign) {
			assertFigletStateLive(state);
			if (align === undefined) {
				return state.align;
			}

			state.align = align;
		},
	});

	api.defineExtension('textmodifier', 'figTextBaseline', {
		value: function (this: Textmodifier, baseline?: FigTextBaseline) {
			assertFigletStateLive(state);
			if (baseline === undefined) {
				return state.baseline;
			}

			state.baseline = baseline;
		},
	});
}

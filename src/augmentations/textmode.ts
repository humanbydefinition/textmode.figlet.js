/**
 * TypeScript augmentation for `textmode.figlet.js`.
 */
import type { TextmodeFigFont } from '../figfont';
import type { FigTextAlign, FigTextBaseline, FigTextOptions } from '../figfont';

/**
 * FIGlet methods added to the `textmode.js` `Textmodifier` API when
 * {@link FigletPlugin} is installed.
 */
export interface TextmodifierFigletExtensions {
	/**
	 * Load a FIGlet font from a `.flf` file URL or path.
	 *
	 * @param source The `.flf` file source.
	 * @returns A parsed FIGlet font instance.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/loadFigFont/sketch.js}
	 */
	loadFigFont(source: string | URL): Promise<TextmodeFigFont>;

	/**
	 * Parse a FIGlet font from raw `.flf` contents.
	 *
	 * @param name Human-readable font name.
	 * @param data Raw `.flf` file contents.
	 * @returns A parsed FIGlet font instance.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/parseFigFont/sketch.js}
	 */
	parseFigFont(name: string, data: string): TextmodeFigFont;

	/**
	 * Get the active FIGlet font used by `figText()`.
	 *
	 * @returns The currently active FIGlet font, if any.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figFont/sketch.js}
	 */
	figFont(): TextmodeFigFont | undefined;

	/**
	 * Set the active FIGlet font used by `figText()`.
	 *
	 * @param font The FIGlet font to use for subsequent text rendering.
	 */
	figFont(font: TextmodeFigFont): void;

	/**
	 * Render a FIGlet string onto the current textmode grid using the active FIGlet font.
	 *
	 * @param text The text to render.
	 * @param col Target column in grid space.
	 * @param row Target row in grid space.
	 * @param options Optional layout overrides.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figText/sketch.js}
	 */
	figText(text: string, col: number, row: number, options?: FigTextOptions): void;

	/**
	 * Measure the rendered width of a FIGlet string in grid cells.
	 *
	 * @param text The text to measure.
	 * @param options Optional layout overrides.
	 * @returns Width in grid cells.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figTextWidth/sketch.js}
	 */
	figTextWidth(text: string, options?: FigTextOptions): number;

	/**
	 * Measure the rendered height of a FIGlet string in grid cells.
	 *
	 * @param text The text to measure.
	 * @param options Optional layout overrides.
	 * @returns Height in grid cells.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figTextHeight/sketch.js}
	 */
	figTextHeight(text: string, options?: FigTextOptions): number;

	/**
	 * Measure the rendered bounds of a FIGlet string in grid cells.
	 *
	 * @param text The text to measure.
	 * @param options Optional layout overrides.
	 * @returns Width and height in grid cells.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figTextBounds/sketch.js}
	 */
	figTextBounds(text: string, options?: FigTextOptions): { cols: number; rows: number };

	/**
	 * Get the current horizontal FIGlet text alignment.
	 *
	 * @returns The current alignment mode.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figTextAlign/sketch.js}
	 */
	figTextAlign(): FigTextAlign;

	/**
	 * Set the horizontal FIGlet text alignment.
	 *
	 * @param align Alignment mode for subsequent `figText()` calls.
	 */
	figTextAlign(align: FigTextAlign): void;

	/**
	 * Get the current vertical FIGlet text baseline mode.
	 *
	 * @returns The current baseline mode.
	 *
	 * @example
	 * {@includeCode ../../examples/Textmodifier/figTextBaseline/sketch.js}
	 */
	figTextBaseline(): FigTextBaseline;

	/**
	 * Set the vertical FIGlet text baseline mode.
	 *
	 * @param baseline Baseline mode for subsequent `figText()` calls.
	 */
	figTextBaseline(baseline: FigTextBaseline): void;
}

declare module 'textmode.js' {
	interface Textmodifier extends TextmodifierFigletExtensions {}
}

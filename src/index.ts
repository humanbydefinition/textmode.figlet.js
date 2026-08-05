/**
 * @packageDocumentation
 *
 * Add FIGlet display typography to a textmode.js sketch.
 *
 * Install {@link FigletPlugin} to add FIGfont loading, selection, drawing, and
 * measurement helpers to the sketch's `Textmodifier`. Use
 * {@link TextmodeFigFont} when you need to inspect a parsed font, plan its
 * layout, or render it without drawing to the canvas.
 *
 * ## Sketch workflow
 *
 * 1. Add {@link FigletPlugin} to the sketch's plugins.
 * 2. Load a `.flf` file with {@link TextmodifierFigletExtensions.loadFigFont}
 *    or parse raw font data with {@link TextmodifierFigletExtensions.parseFigFont}.
 * 3. Select the returned font with {@link TextmodifierFigletExtensions.figFont}.
 * 4. Draw with {@link TextmodifierFigletExtensions.figText}, or measure first
 *    with its width, height, and bounds helpers.
 *
 * {@link FigTextOptions} controls layout, wrapping, direction, and per-cell
 * colors. Use {@link TextmodeFigFont} for reusable FIGfont resources and
 * lower-level planning.
 *
 * @categoryDescription FIGfont resources
 * Parsed FIGfont resources and metadata for inspecting characters and
 * font-defined defaults.
 *
 * @categoryDescription Layout and rendering
 * Options and value types that control FIGlet composition, wrapping,
 * direction, and placement.
 *
 * @categoryDescription Styling
 * Per-cell color values and callback context for styling rendered FIGlet text.
 *
 * @categoryDescription Textmodifier extensions
 * Methods that {@link FigletPlugin} adds to a textmode.js sketch.
 *
 * @categoryDescription Workflow
 * The plugin entrypoint that enables the FIGlet sketch workflow.
 *
 * @showCategories
 */

import './augmentations';

import { FIGFONT_REQUIRED_CODEPOINTS, FigFontParser, FigLayoutEngine, FigSmushRules, TextmodeFigFont } from './figfont';
import { FigletPlugin } from './plugin';

export { FigletPlugin } from './plugin';
export type { TextmodifierFigletExtensions } from './augmentations';
export * from './figfont';

if (typeof window !== 'undefined') {
	const umdGlobals = window as typeof window & Record<string, unknown>;

	umdGlobals.FigletPlugin = FigletPlugin;
	umdGlobals.TextmodeFigFont = TextmodeFigFont;
	umdGlobals.FigFontParser = FigFontParser;
	umdGlobals.FigLayoutEngine = FigLayoutEngine;
	umdGlobals.FigSmushRules = FigSmushRules;
	umdGlobals.FIGFONT_REQUIRED_CODEPOINTS = FIGFONT_REQUIRED_CODEPOINTS;
}

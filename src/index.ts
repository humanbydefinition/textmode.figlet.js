/**
 * `textmode.figlet.js` package entrypoint.
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

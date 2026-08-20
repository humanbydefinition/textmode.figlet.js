import { FigletError } from '../error/FigletError';
import type { FigTextAlign, FigTextBaseline } from '../figfont';
import type { TextmodeFigFont } from '../figfont';

/**
 * Per-textmodifier FIGlet plugin state.
 */
export interface FigletPluginState {
	activeFont?: TextmodeFigFont;
	align: FigTextAlign;
	baseline: FigTextBaseline;
	readonly ownedFonts: Set<TextmodeFigFont>;
	disposed: boolean;
}

/**
 * Create state owned by one FIGlet plugin installation.
 *
 * @returns Mutable state captured by that installation's extensions.
 */
export function createFigletState(): FigletPluginState {
	return {
		activeFont: undefined,
		align: 'left',
		baseline: 'baseline',
		ownedFonts: new Set(),
		disposed: false,
	};
}

/** Register a font created by this plugin installation for teardown. */
export function trackFont(state: FigletPluginState, font: TextmodeFigFont): TextmodeFigFont {
	assertFigletStateLive(state);
	state.ownedFonts.add(font);
	return font;
}

/** Throw when a retained extension or asynchronous callback outlives its installation. */
export function assertFigletStateLive(state: FigletPluginState): void {
	if (state.disposed) throw new FigletError('FIGlet plugin has been disposed.');
}

/**
 * Dispose resources owned by one FIGlet plugin installation.
 */
export function disposeFigletState(state: FigletPluginState): void {
	if (state.disposed) return;
	state.disposed = true;
	state.activeFont = undefined;
	for (const font of state.ownedFonts) font.dispose();
	state.ownedFonts.clear();
}

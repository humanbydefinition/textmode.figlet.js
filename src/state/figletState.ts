import type { Textmodifier } from 'textmode.js';

import type { FigTextAlign, FigTextBaseline } from '../figfont';
import type { TextmodeFigFont } from '../figfont';

/**
 * Symbol used to store per-instance FIGlet plugin state.
 */
export const FIGLET_STATE_KEY = Symbol.for('textmode.figlet.state');

/**
 * Per-textmodifier FIGlet plugin state.
 */
export interface FigletPluginState {
	activeFont?: TextmodeFigFont;
	align: FigTextAlign;
	baseline: FigTextBaseline;
}

/**
 * Get the FIGlet plugin state for a Textmodifier instance, creating it when missing.
 *
 * @param textmodifier Target instance.
 * @returns Mutable FIGlet plugin state for that instance.
 */
export function getFigletState(textmodifier: Textmodifier): FigletPluginState {
	const textmodifierWithState = textmodifier as Textmodifier & {
		[FIGLET_STATE_KEY]?: FigletPluginState;
	};

	if (!textmodifierWithState[FIGLET_STATE_KEY]) {
		textmodifierWithState[FIGLET_STATE_KEY] = {
			activeFont: undefined,
			align: 'left',
			baseline: 'baseline',
		};
	}

	return textmodifierWithState[FIGLET_STATE_KEY];
}

/**
 * Remove the FIGlet plugin state from a Textmodifier instance.
 *
 * @param textmodifier Target instance.
 */
export function clearFigletState(textmodifier: Textmodifier): void {
	delete (textmodifier as Textmodifier & { [FIGLET_STATE_KEY]?: FigletPluginState })[FIGLET_STATE_KEY];
}

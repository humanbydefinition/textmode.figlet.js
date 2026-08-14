import type { Textmodifier } from 'textmode.js';

import type { FigTextAlign, FigTextBaseline } from '../figfont';
import type { TextmodeFigFont } from '../figfont';

/**
 * Per-textmodifier FIGlet plugin state.
 */
export interface FigletPluginState {
	activeFont?: TextmodeFigFont;
	align: FigTextAlign;
	baseline: FigTextBaseline;
}

const states = new WeakMap<Textmodifier, FigletPluginState>();

/**
 * Get the FIGlet plugin state for a Textmodifier instance, creating it when missing.
 *
 * @param textmodifier Target instance.
 * @returns Mutable FIGlet plugin state for that instance.
 */
export function getFigletState(textmodifier: Textmodifier): FigletPluginState {
	let state = states.get(textmodifier);
	if (!state) {
		state = {
			activeFont: undefined,
			align: 'left',
			baseline: 'baseline',
		};
		states.set(textmodifier, state);
	}
	return state;
}

/**
 * Remove the FIGlet plugin state from a Textmodifier instance.
 *
 * @param textmodifier Target instance.
 */
export function clearFigletState(textmodifier: Textmodifier): void {
	states.delete(textmodifier);
}

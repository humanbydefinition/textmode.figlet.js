import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginContext } from 'textmode.js';
import packageJson from '../../package.json';

import { installTextmodifierFigletExtensions } from '../extensions';
import { createFigletState, disposeFigletState } from '../state/figletState';

/**
 * Plugin entrypoint for the FIGlet add-on.
 *
 * Installs FIGlet methods on the `Textmodifier` through
 * {@link TextmodePluginContext.defineExtension}, so the plugin runtime owns conflict
 * detection and cleanup for the extension properties. Per-instance plugin state is
 * cleared by the returned cleanup function.
 *
 * @category Workflow
 *
 * @example
 * {@includeCode ../../examples/FigletPlugin/init/sketch.js}
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/variables/FigletPlugin | FigletPlugin API reference}
 */
export const FigletPlugin: TextmodePlugin = {
	name: packageJson.name,

	install(_textmodifier: Textmodifier, api: TextmodePluginContext): () => void {
		const state = createFigletState();
		try {
			installTextmodifierFigletExtensions(api, state);
		} catch (error) {
			disposeFigletState(state);
			throw error;
		}

		return () => disposeFigletState(state);
	},
};

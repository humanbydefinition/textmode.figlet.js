import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginContext } from 'textmode.js/plugins';
import packageJson from '../../package.json';

import { installTextmodifierFigletExtensions, uninstallTextmodifierFigletExtensions } from '../extensions';

/**
 * Plugin entrypoint for the FIGlet add-on.
 *
 * @example
 * {@includeCode ../../examples/FigletPlugin/init/sketch.js}
 */
export const FigletPlugin: TextmodePlugin = {
	name: packageJson.name,
	version: packageJson.version,

	install(textmodifier: Textmodifier, _context: TextmodePluginContext): void {
		installTextmodifierFigletExtensions(textmodifier);
	},

	uninstall(textmodifier: Textmodifier, _context: TextmodePluginContext): void {
		uninstallTextmodifierFigletExtensions(textmodifier);
	},
};

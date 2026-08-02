import { describe, expect, it } from 'vitest';
import packageJson from '../../../package.json';

import {
	FIGFONT_REQUIRED_CODEPOINTS,
	FigFontParser,
	FigLayoutEngine,
	FigSmushRules,
	FigletPlugin,
	TextmodeFigFont,
} from '../../../src';

describe('textmode.figlet.js public API unit', () => {
	it('exports the plugin with the expected name', () => {
		expect(FigletPlugin.name).toBe(packageJson.name);
		expect(FigletPlugin.version).toBe(packageJson.version);
	});

	it('exports the pure FIGfont engine modules from the package root', () => {
		expect(FigFontParser).toBeDefined();
		expect(FigLayoutEngine).toBeDefined();
		expect(FigSmushRules).toBeDefined();
		expect(TextmodeFigFont).toBeDefined();
		expect(FIGFONT_REQUIRED_CODEPOINTS).toBeDefined();
	});

	it('exposes stable public rendering and layout seams', () => {
		expect(typeof TextmodeFigFont.prototype.planText).toBe('function');
		expect(typeof TextmodeFigFont.prototype.renderText).toBe('function');
		expect(typeof TextmodeFigFont.prototype.measureText).toBe('function');
	});

	it('exposes install and uninstall hooks on the plugin export', () => {
		expect(() => FigletPlugin.install({} as never, {} as never)).not.toThrow();
		expect(() => FigletPlugin.uninstall?.({} as never, {} as never)).not.toThrow();
	});

	it('registers the runtime package exports on window for UMD consumers', () => {
		const umdGlobals = window as typeof window & Record<string, unknown>;

		expect(umdGlobals.FigletPlugin).toBe(FigletPlugin);
		expect(umdGlobals.TextmodeFigFont).toBe(TextmodeFigFont);
		expect(umdGlobals.FigFontParser).toBe(FigFontParser);
		expect(umdGlobals.FigLayoutEngine).toBe(FigLayoutEngine);
		expect(umdGlobals.FigSmushRules).toBe(FigSmushRules);
		expect(umdGlobals.FIGFONT_REQUIRED_CODEPOINTS).toBe(FIGFONT_REQUIRED_CODEPOINTS);
	});
});

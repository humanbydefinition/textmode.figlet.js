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
		const context = { defineExtension: () => () => {} } as never;

		expect(() => FigletPlugin.install({} as never, context)).not.toThrow();
		expect(() => FigletPlugin.uninstall?.({} as never, context)).not.toThrow();
	});

	it('registers the runtime package exports on window for UMD consumers', () => {
		expect(window.FigletPlugin).toBe(FigletPlugin);
		expect(window.TextmodeFigFont).toBe(TextmodeFigFont);
		expect(window.FigFontParser).toBe(FigFontParser);
		expect(window.FigLayoutEngine).toBe(FigLayoutEngine);
		expect(window.FigSmushRules).toBe(FigSmushRules);
		expect(window.FIGFONT_REQUIRED_CODEPOINTS).toBe(FIGFONT_REQUIRED_CODEPOINTS);
	});
});

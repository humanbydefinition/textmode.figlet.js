import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TextmodePluginContext } from 'textmode.js';

import { RenderState } from '../../helpers/RenderState';
import { createTextmodifierHarness, type TextmodifierHarness } from '../../helpers/textmodifierHarness';
import { readFigFontFixture } from '../../fixtures/builders/figFontBuilder';

import { FigletPlugin, TextmodeFigFont } from '../../../src';

const fontData = readFigFontFixture('layout-edge-cases.flf');

function createFigletPluginContext(stub: TextmodifierHarness) {
	const unregisterFns: Array<() => void> = [];

	const context = {
		defineExtension: vi.fn((_target: string, name: string, descriptor: PropertyDescriptor) => {
			Object.defineProperty(stub, name, { ...descriptor, configurable: true });

			const unregister = () => {
				delete (stub as unknown as Record<string, unknown>)[name];
			};
			unregisterFns.push(unregister);
			return unregister;
		}),
	} as unknown as TextmodePluginContext;

	return {
		context,
		uninstallExtensions: () => {
			for (const unregister of unregisterFns) unregister();
		},
	};
}

describe('FigletPlugin integration', () => {
	let stub: TextmodifierHarness;
	let context: TextmodePluginContext;
	let uninstallExtensions: () => void;
	let pluginCleanup: (() => void) | undefined;
	let figFont: TextmodeFigFont;

	beforeEach(() => {
		stub = createTextmodifierHarness();
		const pluginContext = createFigletPluginContext(stub);
		context = pluginContext.context;
		uninstallExtensions = pluginContext.uninstallExtensions;
		figFont = TextmodeFigFont._fromString('fixture', fontData);
		pluginCleanup = FigletPlugin.install(stub, context) ?? undefined;
	});

	afterEach(() => {
		pluginCleanup?.();
		uninstallExtensions();
		vi.restoreAllMocks();
	});

	it('loads and parses FIGlet fonts through the installed methods', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => fontData,
		}) as typeof fetch;

		const loadedFont = await stub.loadFigFont('fonts/test.flf');
		const parsedFont = stub.parseFigFont('parsed', fontData);

		expect(global.fetch).toHaveBeenCalledWith('fonts/test.flf');
		expect(loadedFont).toBeInstanceOf(TextmodeFigFont);
		expect(parsedFont).toBeInstanceOf(TextmodeFigFont);
	});

	it('disposes fonts created by the installation', () => {
		const ownedFont = stub.parseFigFont('owned', fontData);
		const dispose = vi.spyOn(ownedFont, 'dispose');

		pluginCleanup?.();

		expect(dispose).toHaveBeenCalledOnce();
	});

	it('untracks fonts when disposed before plugin cleanup', () => {
		const ownedFont = stub.parseFigFont('owned', fontData);
		stub.figFont(ownedFont);
		expect(stub.figFont()).toBe(ownedFont);

		ownedFont.dispose();

		expect(stub.figFont()).toBeUndefined();
		const disposeSpy = vi.spyOn(ownedFont, 'dispose');
		pluginCleanup?.();
		expect(disposeSpy).not.toHaveBeenCalled();
	});

	it('throws disposed error when calling extension methods after plugin disposal', () => {
		pluginCleanup?.();

		expect(() => stub.figFont()).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figFont(figFont)).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figText('AB', 0, 0)).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextWidth('AB')).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextHeight('AB')).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextBounds('AB')).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextAlign('center')).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextAlign()).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextBaseline('top')).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.figTextBaseline()).toThrow('FIGlet plugin has been disposed');
		expect(() => stub.parseFigFont('p', fontData)).toThrow('FIGlet plugin has been disposed');
	});

	it('disposes a late font load instead of resurrecting disposed state', async () => {
		let resolveResponse!: (response: Response) => void;
		global.fetch = vi.fn(() => new Promise<Response>((resolve) => (resolveResponse = resolve))) as typeof fetch;
		const pending = stub.loadFigFont('fonts/late.flf');

		pluginCleanup?.();
		resolveResponse({ ok: true, text: async () => fontData } as Response);

		await expect(pending).rejects.toThrow('FIGlet plugin has been disposed');
	});

	it('stores and returns the active FIGlet font', () => {
		expect(stub.figFont()).toBeUndefined();

		stub.figFont(figFont);

		expect(stub.figFont()).toBe(figFont);
	});

	it('measures text through the active FIGlet font', () => {
		stub.figFont(figFont);

		expect(stub.figTextWidth('AB', { horizontalLayout: 'fitted' })).toBe(2);
		expect(stub.figTextHeight('AB')).toBe(2);
		expect(stub.figTextBounds('AB', { horizontalLayout: 'fitted' })).toEqual({
			cols: 2,
			rows: 2,
		});
		expect(stub.figTextBounds('A\nB')).toEqual({
			cols: 2,
			rows: 4,
		});
		expect(
			stub.figTextBounds('A B', {
				wrap: 'word',
				maxCols: 2,
				horizontalLayout: 'full',
			})
		).toEqual({
			cols: 2,
			rows: 4,
		});
	});

	it('renders non-blank FIGlet cells through char() and point()', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, { horizontalLayout: 'fitted' });

		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('A');
		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('B');
		expect(stub._renderer._rect).toHaveBeenCalledTimes(4);

		const state = RenderState._createStateObject();
		stub._renderer.state._copyTo(state);
		expect(state._translationX).toBe(0);
		expect(state._translationY).toBe(0);
	});

	it('renders explicit newline input as stacked FIGlet lines', () => {
		stub.figFont(figFont);
		stub.figText('A\nB', 0, 0);

		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('A');
		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('B');
		expect(stub._renderer._rect).toHaveBeenCalledTimes(4);
	});

	it('renders wrapped FIGlet text as multiple logical lines', () => {
		stub.figFont(figFont);
		stub.figText('A B', 0, 0, {
			wrap: 'word',
			maxCols: 2,
			horizontalLayout: 'full',
		});

		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('A');
		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('B');
		expect(stub._renderer._rect).toHaveBeenCalledTimes(4);
	});

	it('restores the outer and cell render state when a color resolver throws', () => {
		stub.figFont(figFont);
		const initial = RenderState._createStateObject();
		stub._renderer.state._copyTo(initial);

		expect(() =>
			stub.figText('AB', 0, 0, {
				horizontalLayout: 'fitted',
				charColor: () => {
					throw new Error('color failed');
				},
			})
		).toThrow('color failed');

		const restored = RenderState._createStateObject();
		stub._renderer.state._copyTo(restored);
		expect(restored._translationX).toBe(initial._translationX);
		expect(restored._translationY).toBe(initial._translationY);
	});

	it('renders right-to-left FIGlet text in reversed visual order when requested', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'full',
			direction: 'rtl',
		});

		expect(stub._renderer.draws.map((draw) => draw.char)).toEqual(['B', 'A', 'B', 'A']);
	});

	it('applies static per-cell FIGlet color overrides', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor: [255, 0, 0, 128],
			cellColor: '#112233',
		});

		expect(stub._renderer.draws).toHaveLength(4);
		expect(stub._renderer.draws.every((draw) => draw.charColor[0] === 1 && draw.charColor[3] === 128 / 255)).toBe(
			true
		);
		expect(stub._renderer.draws.every((draw) => draw.cellColor[0] === 0x11 / 255 && draw.cellColor[3] === 1)).toBe(
			true
		);
	});

	it('applies zero-valued numeric FIGlet color overrides', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor: 0,
			cellColor: 0,
		});

		expect(stub._renderer.draws).toHaveLength(4);
		expect(stub._renderer.draws.every((draw) => draw.charColor[0] === 0 && draw.charColor[3] === 1)).toBe(true);
		expect(stub._renderer.draws.every((draw) => draw.cellColor[0] === 0 && draw.cellColor[3] === 1)).toBe(true);
	});

	it('applies callback-based per-cell FIGlet color overrides using cell metadata', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor: (cell) => (cell.inputChar === 'A' ? [255, 200, 0] : [0, 180, 255]),
			cellColor: (cell) => (cell.col === 0 ? [12, 24, 36, 255] : undefined),
		});

		const aDraws = stub._renderer.draws.filter((draw) => draw.char === 'A');
		const bDraws = stub._renderer.draws.filter((draw) => draw.char === 'B');

		expect(aDraws).not.toHaveLength(0);
		expect(bDraws).not.toHaveLength(0);
		expect(aDraws.every((draw) => draw.charColor[0] === 1 && draw.charColor[1] === 200 / 255)).toBe(true);
		expect(bDraws.every((draw) => draw.charColor[0] === 0 && draw.charColor[2] === 1)).toBe(true);
		expect(stub._renderer.draws.some((draw) => draw.cellColor[0] === 12 / 255)).toBe(true);
		expect(stub._renderer.draws.some((draw) => draw.cellColor[0] === 0)).toBe(true);
	});

	it('applies zero-valued callback FIGlet color overrides', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor: (cell) => (cell.inputChar === 'A' ? 0 : [0, 180, 255]),
			cellColor: (cell) => (cell.col === 0 ? 0 : undefined),
		});

		const aDraws = stub._renderer.draws.filter((draw) => draw.char === 'A');

		expect(aDraws).not.toHaveLength(0);
		expect(aDraws.every((draw) => draw.charColor[0] === 0 && draw.charColor[3] === 1)).toBe(true);
		expect(stub._renderer.draws.some((draw) => draw.cellColor[0] === 0 && draw.cellColor[3] === 1)).toBe(true);
	});

	it('applies alignment and baseline settings to placement', () => {
		stub.figFont(figFont);
		stub.figTextAlign('center');
		stub.figTextBaseline('bottom');

		expect(stub.figTextAlign()).toBe('center');
		expect(stub.figTextBaseline()).toBe('bottom');

		stub.figText('AB', 5, 6, { horizontalLayout: 'fitted' });

		const state = RenderState._createStateObject();
		stub._renderer.state._copyTo(state);
		expect(state._translationX).toBe(0);
		expect(state._translationY).toBe(0);
		expect(stub._renderer._rect).toHaveBeenCalledTimes(4);
	});

	it('throws when rendering or measuring without an active FIGlet font', () => {
		expect(() => stub.figText('AB', 0, 0)).toThrow('No FIGlet font is active');
		expect(() => stub.figTextWidth('AB')).toThrow('No FIGlet font is active');
	});

	it('registers all FIGlet methods through defineExtension', () => {
		for (const name of [
			'loadFigFont',
			'parseFigFont',
			'figFont',
			'figText',
			'figTextWidth',
			'figTextHeight',
			'figTextBounds',
			'figTextAlign',
			'figTextBaseline',
		]) {
			expect(vi.mocked(context.defineExtension)).toHaveBeenCalledWith('textmodifier', name, expect.any(Object));
		}
	});

	it('removes installed methods when the host uninstalls extensions', () => {
		pluginCleanup?.();
		uninstallExtensions();

		expect(stub.figText).toBeUndefined();
		expect(stub.figFont).toBeUndefined();
		expect(stub.loadFigFont).toBeUndefined();

		pluginCleanup = FigletPlugin.install(stub, context) ?? undefined;
	});
});

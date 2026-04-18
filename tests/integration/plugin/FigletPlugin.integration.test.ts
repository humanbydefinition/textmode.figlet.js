import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RenderState } from '../../helpers/RenderState';
import { createTextmodifierHarness } from '../../helpers/textmodifierHarness';
import { readFigFontFixture } from '../../fixtures/builders/figFontBuilder';

import { FigletPlugin, TextmodeFigFont } from '../../../src';

const fontData = readFigFontFixture('layout-edge-cases.flf');

describe('FigletPlugin integration', () => {
	let stub = createTextmodifierHarness();
	let figFont: TextmodeFigFont;

	beforeEach(() => {
		stub = createTextmodifierHarness();
		figFont = TextmodeFigFont._fromString('fixture', fontData);
		FigletPlugin.install(stub, {} as never);
	});

	afterEach(() => {
		FigletPlugin.uninstall?.(stub, {} as never);
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
		expect(stub._trackDisposable).toHaveBeenCalledTimes(2);
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

	it('removes installed methods on uninstall', () => {
		FigletPlugin.uninstall?.(stub, {} as never);

		expect(stub.figText).toBeUndefined();
		expect(stub.figFont).toBeUndefined();
		expect(stub.loadFigFont).toBeUndefined();

		FigletPlugin.install(stub, {} as never);
	});
});

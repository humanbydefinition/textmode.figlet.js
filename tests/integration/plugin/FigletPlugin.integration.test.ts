import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RenderState } from '../../helpers/RenderState';
import { createTextmodifierHarness } from '../../helpers/textmodifierHarness';
import { buildSingleWidthFigFont, readFigFontFixture } from '../../fixtures/builders/figFontBuilder';

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

	it('renders non-blank FIGlet cells through batched print() runs', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, { horizontalLayout: 'fitted' });

		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('A');
		expect(stub.font._getCharacterColor).toHaveBeenCalledWith('B');
		expect(stub._renderer._rect).not.toHaveBeenCalled();
		expect(stub._renderer.prints.map((print) => print.text)).toEqual(['AB', 'AB']);
		expect(stub._renderer.prints.every((print) => print.markup === false)).toBe(true);
		expect(stub._renderer.draws).toHaveLength(4);

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
		expect(stub._renderer._rect).not.toHaveBeenCalled();
		expect(stub._renderer.prints.map((print) => [print.text, print.row])).toEqual([
			['A', 0],
			['A', 1],
			['B', 2],
			['B', 3],
		]);
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
		expect(stub._renderer._rect).not.toHaveBeenCalled();
		expect(stub._renderer.prints.map((print) => [print.text, print.row])).toEqual([
			['A', 0],
			['A', 1],
			['B', 2],
			['B', 3],
		]);
	});

	it('renders right-to-left FIGlet text in reversed visual order when requested', () => {
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'full',
			direction: 'rtl',
		});

		expect(stub._renderer.draws.map((draw) => draw.char)).toEqual(['B', 'A', 'B', 'A']);
	});

	it('does not draw blank FIGlet cells even with an active cell color', () => {
		stub.figFont(figFont);
		stub.cellColor(255, 0, 0);

		stub.figText('A', 0, 0, { horizontalLayout: 'full' });

		expect(stub._renderer._rect).not.toHaveBeenCalled();
		expect(stub._renderer.prints.map((print) => print.text)).toEqual(['A', 'A']);
		expect(stub._renderer.draws.map((draw) => draw.char)).toEqual(['A', 'A']);
		expect(stub._renderer.draws.some((draw) => draw.char === ' ')).toBe(false);
		expect(stub._renderer.draws.every((draw) => draw.cellColor[0] === 1)).toBe(true);
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
		const charColor = vi.fn((cell) => (cell.inputChar === 'A' ? [255, 200, 0] : [0, 180, 255]));
		const cellColor = vi.fn((cell) => (cell.col === 0 ? [12, 24, 36, 255] : undefined));

		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor,
			cellColor,
		});

		const aDraws = stub._renderer.draws.filter((draw) => draw.char === 'A');
		const bDraws = stub._renderer.draws.filter((draw) => draw.char === 'B');

		expect(charColor).toHaveBeenCalledTimes(4);
		expect(cellColor).toHaveBeenCalledTimes(4);
		expect(charColor.mock.calls.map(([cell]) => `${cell.char}:${cell.col},${cell.row}`)).toEqual([
			'A:0,0',
			'B:1,0',
			'A:0,1',
			'B:1,1',
		]);
		expect(aDraws).not.toHaveLength(0);
		expect(bDraws).not.toHaveLength(0);
		expect(aDraws.every((draw) => draw.charColor[0] === 1 && draw.charColor[1] === 200 / 255)).toBe(true);
		expect(bDraws.every((draw) => draw.charColor[0] === 0 && draw.charColor[2] === 1)).toBe(true);
		expect(stub._renderer.draws.some((draw) => draw.cellColor[0] === 12 / 255)).toBe(true);
		expect(stub._renderer.draws.some((draw) => draw.cellColor[0] === 0)).toBe(true);
	});

	it('batches callback-colored cells with matching styles and splits changed styles', () => {
		stub.figFont(figFont);

		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor: () => [10, 20, 30],
		});

		expect(stub._renderer.prints.map((print) => print.text)).toEqual(['AB', 'AB']);

		stub = createTextmodifierHarness();
		FigletPlugin.install(stub, {} as never);
		stub.figFont(figFont);
		stub.figText('AB', 0, 0, {
			horizontalLayout: 'fitted',
			charColor: (cell) => (cell.inputChar === 'A' ? [10, 20, 30] : [40, 50, 60]),
		});

		expect(stub._renderer.prints.map((print) => print.text)).toEqual(['A', 'B', 'A', 'B']);
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
		expect(stub._renderer._rect).not.toHaveBeenCalled();
		expect(stub._renderer.prints.map((print) => [print.text, print.col, print.row])).toEqual([
			['AB', 4, 5],
			['AB', 4, 6],
		]);
	});

	it('prints literal brackets with markup disabled', () => {
		const bracketFont = TextmodeFigFont._fromString('single', buildSingleWidthFigFont());
		stub.figFont(bracketFont);

		stub.figText('[]', 0, 0, { horizontalLayout: 'full' });

		expect(stub._renderer.prints).toHaveLength(1);
		expect(stub._renderer.prints[0]).toMatchObject({
			text: '[]',
			markup: false,
		});
		expect(stub._renderer.draws.map((draw) => draw.char)).toEqual(['[', ']']);
	});

	it('restores print alignment settings after FIGlet rendering', () => {
		stub.figFont(figFont);
		stub.printAlign('right', 'bottom');

		stub.figText('AB', 0, 0, { horizontalLayout: 'fitted' });

		expect(stub._printAlignHorizontal).toBe('right');
		expect(stub._printAlignVertical).toBe('bottom');
	});

	it('preserves transform and character state after FIGlet rendering', () => {
		stub.figFont(figFont);
		stub.translate(3, 4, 0);
		stub.char('Z');
		stub.charColor(10, 20, 30);
		stub.cellColor(40, 50, 60);

		stub.figText('AB', 0, 0, { horizontalLayout: 'fitted', charColor: [255, 0, 0] });

		const state = RenderState._createStateObject();
		stub._renderer.state._copyTo(state);
		expect(state._translationX).toBe(3);
		expect(state._translationY).toBe(4);
		expect(state._character._currentCharacterString).toBe('Z');
		expect(state._character._currentCharColor).toEqual([10 / 255, 20 / 255, 30 / 255, 1]);
		expect(state._character._currentCellColor).toEqual([40 / 255, 50 / 255, 60 / 255, 1]);
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

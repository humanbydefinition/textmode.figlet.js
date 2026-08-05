import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TextmodeFigFont } from '../../../src/figfont';
import type { FigCharacter } from '../../../src/figfont';
import { buildSingleWidthFigFont, readFigFontFixture } from '../../fixtures/builders/figFontBuilder';

const fontData = readFigFontFixture('minimal.flf');
const verticalFitFontData = readFigFontFixture('vertical-fit.flf');

describe('TextmodeFigFont integration', () => {
	beforeEach(() => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => fontData,
		}) as typeof fetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('creates a parsed font from a string', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);

		expect(font.name).toBe('Standard');
		expect(font.height).toBe(2);
		expect(font.baseline).toBe(1);
		expect(font.hardblank).toBe('$');
		expect(font.defaultLayout).toBe('smushed');
		expect(font.defaultPrintDirection).toBe('ltr');
		expect(font.defaultVerticalLayout).toBe('full');
		expect(font.getCharacter('A')?.lines).toEqual(['A', 'AA']);
		expect(font.getCharacter(9731)?.lines).toEqual(['**', '*_']);
	});

	it('loads a font from URL data and derives the name from the path', async () => {
		const font = await TextmodeFigFont._fromURL('fonts/standard.flf');

		expect(global.fetch).toHaveBeenCalledWith('fonts/standard.flf');
		expect(font.name).toBe('standard');
		expect(font.getCharacter('B')?.width).toBe(2);
	});

	it('measures explicit newline input as stacked logical lines', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);

		expect(font.measureText('A\nB')).toEqual({
			cols: 2,
			rows: 4,
		});
	});

	it('renders explicit newline input into a multi-line grid', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);
		const result = font.renderText('A\nB');

		expect(result).toEqual({
			grid: [
				['A', ' '],
				['A', 'A'],
				['B', ' '],
				['B', 'B'],
			],
			cols: 2,
			rows: 4,
		});
		expect(font.measureText('A\nB')).toEqual({
			cols: 2,
			rows: 4,
		});
	});

	it('wraps words into multiple logical lines when maxCols is exceeded', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);
		const bounds = font.measureText('A B', {
			wrap: 'word',
			maxCols: 2,
			horizontalLayout: 'full',
		});

		expect(bounds).toEqual({
			cols: 2,
			rows: 4,
		});
		expect(
			font.renderText('A B', {
				wrap: 'word',
				maxCols: 2,
				horizontalLayout: 'full',
			})
		).toEqual({
			grid: [
				['A', ' '],
				['A', 'A'],
				['B', ' '],
				['B', 'B'],
			],
			cols: 2,
			rows: 4,
		});
	});

	it('supports character wrapping for overlong input when requested', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);
		const bounds = font.measureText('ABC', {
			wrap: 'char',
			maxCols: 2,
			horizontalLayout: 'full',
		});

		expect(bounds).toEqual({
			cols: 2,
			rows: 6,
		});
	});

	it('supports right-to-left planning from font defaults and explicit overrides', () => {
		const rtlFont = TextmodeFigFont._fromString('RTL', buildSingleWidthFigFont({ printDirection: 1 }));
		const ltrFont = TextmodeFigFont._fromString('LTR', buildSingleWidthFigFont({ printDirection: 0 }));

		expect(rtlFont.defaultPrintDirection).toBe('rtl');
		expect(rtlFont.renderText('AB')).toEqual({
			grid: [['B', 'A']],
			cols: 2,
			rows: 1,
		});
		expect(ltrFont.renderText('AB', { direction: 'rtl' })).toEqual({
			grid: [['B', 'A']],
			cols: 2,
			rows: 1,
		});
		expect(rtlFont.renderText('AB', { direction: 'ltr' })).toEqual({
			grid: [['A', 'B']],
			cols: 2,
			rows: 1,
		});
	});

	it('uses vertical fitting when the font default requests it', () => {
		const font = TextmodeFigFont._fromString('VerticalFit', verticalFitFontData);

		expect(font.defaultVerticalLayout).toBe('fitted');
		expect(font.measureText('A\nB')).toEqual({
			cols: 1,
			rows: 2,
		});
		expect(font.renderText('A\nB')).toEqual({
			grid: [['A'], ['B']],
			cols: 1,
			rows: 2,
		});
		expect(font.measureText('A\nB', { verticalLayout: 'full' })).toEqual({
			cols: 1,
			rows: 4,
		});
	});

	it('throws when a fetch request fails', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		}) as typeof fetch;

		await expect(TextmodeFigFont._fromURL('fonts/missing.flf')).rejects.toThrow('Failed to load FIGfont file');
	});

	it('exposes immutable header and character objects', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);
		const header = font.header;
		const character = font.getCharacter('A');

		header.fullLayout = 0;
		(character as FigCharacter).lines[0] = 'ZZ';

		expect(font.defaultLayout).toBe('smushed');
		expect(font.header.fullLayout).not.toBe(0);
		expect(font.getCharacter('A')?.lines).toEqual(['A', 'AA']);
	});

	it('returns a detached character map view', () => {
		const font = TextmodeFigFont._fromString('Standard', fontData);
		const publicCharacters = font.characters as Map<number, ReturnType<typeof font.getCharacter>>;

		publicCharacters.clear();
		publicCharacters.set(65, font.getCharacter('B'));

		expect(publicCharacters.size).toBe(1);
		expect(font.characters.size).toBeGreaterThan(1);
		expect(font.getCharacter('A')?.code).toBe(65);
	});
});

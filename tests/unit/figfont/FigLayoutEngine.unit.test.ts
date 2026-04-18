import { describe, expect, it } from 'vitest';

import { FigLayoutEngine, FigSmushRules, TextmodeFigFont } from '../../../src/figfont';
import { readFigFontFixture } from '../../fixtures/builders/figFontBuilder';

import type { FigCharacter, FigFontHeader, FigRenderLine } from '../../../src/figfont';

function createHeader(overrides: Partial<FigFontHeader> = {}): FigFontHeader {
	return {
		signature: 'flf2a',
		hardblank: '$',
		height: 2,
		baseline: 1,
		maxLength: 16,
		oldLayout: 0,
		commentLines: 0,
		printDirection: 0,
		fullLayout: 0,
		codetagCount: 0,
		...overrides,
	};
}

function createCharacter(code: number, lines: string[]): FigCharacter {
	return {
		code,
		lines,
		width: Math.max(...lines.map((line) => line.length)),
	};
}

function createRenderLine(
	lineIndex: number,
	rows: number,
	cols: number,
	cells: Array<{ char: string; row: number; col: number }>
): FigRenderLine {
	return {
		lineIndex,
		rows,
		cols,
		cells: cells.map((cell, inputIndex) => ({
			char: cell.char,
			row: cell.row,
			col: cell.col,
			inputIndex,
			inputChar: cell.char,
			figCharCode: cell.char.codePointAt(0) ?? 32,
			subRow: cell.row,
			subCol: cell.col,
			lineIndex,
		})),
	};
}

const layoutFixture = readFigFontFixture('layout-edge-cases.flf');

describe('FigLayoutEngine unit', () => {
	it('keeps full layout at full width', () => {
		const engine = new FigLayoutEngine(createHeader());
		const left = createCharacter(65, ['A ', 'A ']);
		const right = createCharacter(66, [' B', ' B']);

		expect(engine._layoutHorizontal([left, right], 'full')).toEqual([
			['A', ' ', ' ', 'B'],
			['A', ' ', ' ', 'B'],
		]);
	});

	it('fits characters together until non-blank cells touch', () => {
		const engine = new FigLayoutEngine(createHeader());
		const left = createCharacter(65, ['A ', 'A ']);
		const right = createCharacter(66, [' B', ' B']);

		expect(engine._layoutHorizontal([left, right], 'fitted')).toEqual([
			['A', 'B'],
			['A', 'B'],
		]);
	});

	it('smushes overlapping characters when the active rules allow it', () => {
		const engine = new FigLayoutEngine(
			createHeader({
				oldLayout: 8,
				fullLayout: 128 | 8,
			})
		);
		const left = createCharacter(91, ['[', '[']);
		const right = createCharacter(93, [']', ']']);

		expect(engine._layoutHorizontal([left, right], 'smushed')).toEqual([['|'], ['|']]);
	});

	it('treats hardblanks as non-blank during layout and converts them to spaces in the final grid', () => {
		const fittedEngine = new FigLayoutEngine(createHeader());
		const hardblank = createCharacter(36, ['$', '$']);
		const letter = createCharacter(88, ['X', 'X']);

		expect(fittedEngine._layoutHorizontal([hardblank, letter], 'fitted')).toEqual([
			[' ', 'X'],
			[' ', 'X'],
		]);

		const smushedEngine = new FigLayoutEngine(
			createHeader({
				oldLayout: 32,
				fullLayout: 128 | 32,
			})
		);

		expect(smushedEngine._layoutHorizontal([hardblank, hardblank], 'smushed')).toEqual([[' '], [' ']]);
	});

	it('renders and measures text through TextmodeFigFont using the layout engine', () => {
		const font = TextmodeFigFont._fromString('layout-test', layoutFixture);
		const result = font.renderText('AB', { horizontalLayout: 'fitted' });

		expect(result.grid).toEqual([
			['A', 'B'],
			['A', 'B'],
		]);
		expect(font.measureText('AB', { horizontalLayout: 'fitted' })).toEqual({
			cols: 2,
			rows: 2,
		});
	});

	it('fits logical FIGlet lines vertically when visible cells do not collide', () => {
		const engine = new FigLayoutEngine(createHeader());
		const top = createRenderLine(0, 2, 1, [{ char: 'A', row: 0, col: 0 }]);
		const bottom = createRenderLine(1, 2, 1, [{ char: 'B', row: 1, col: 0 }]);

		const result = engine._layoutVerticalPlan([top, bottom], 'fitted');

		expect(result.rows).toBe(2);
		expect(result.cols).toBe(1);
		expect(result.cells.map((cell) => [cell.char, cell.row, cell.col])).toEqual([
			['A', 0, 0],
			['B', 1, 0],
		]);
	});

	it('smushes logical FIGlet lines vertically when the active rules allow it', () => {
		const engine = new FigLayoutEngine(
			createHeader({
				fullLayout: FigSmushRules.VERTICAL_RULE_HORIZONTAL_LINE | 16384,
			})
		);
		const top = createRenderLine(0, 1, 1, [{ char: '-', row: 0, col: 0 }]);
		const bottom = createRenderLine(1, 1, 1, [{ char: '_', row: 0, col: 0 }]);

		const result = engine._layoutVerticalPlan([top, bottom], 'smushed');

		expect(result.rows).toBe(1);
		expect(result.cols).toBe(1);
		expect(result.cells.map((cell) => [cell.char, cell.row, cell.col])).toEqual([['=', 0, 0]]);
	});
});

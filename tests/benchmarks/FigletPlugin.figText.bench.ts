import { beforeAll, bench, describe } from 'vitest';

import { FigletPlugin, TextmodeFigFont } from '../../src';
import { createTextmodifierHarness, type TextmodifierHarness } from '../helpers/textmodifierHarness';
import { readFigFontFixture } from '../fixtures/builders/figFontBuilder';

const fontData = readFigFontFixture('layout-edge-cases.flf');

let stub: TextmodifierHarness;
let figFont: TextmodeFigFont;

function resetRenderOutput(): void {
	stub._renderer.draws.length = 0;
	stub._renderer.prints.length = 0;
	stub.font._getCharacterColor.mockClear();
	stub.printAlign('left', 'top');
}

describe('FigletPlugin figText()', () => {
	beforeAll(() => {
		stub = createTextmodifierHarness();
		figFont = TextmodeFigFont._fromString('fixture', fontData);
		FigletPlugin.install(stub, {} as never);
		stub.figFont(figFont);
	});

	bench('large plain FIGlet text', () => {
		stub.figText('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG 0123456789'.repeat(8), 0, 0, {
			horizontalLayout: 'fitted',
		});
		resetRenderOutput();
	});

	bench('static color FIGlet text', () => {
		stub.figText('STATIC COLOR FIGLET PERFORMANCE'.repeat(8), 0, 0, {
			horizontalLayout: 'fitted',
			charColor: [255, 180, 80],
			cellColor: [8, 12, 24, 180],
		});
		resetRenderOutput();
	});

	bench('callback-colored FIGlet text', () => {
		stub.figText('CALLBACK COLOR FIGLET PERFORMANCE'.repeat(8), 0, 0, {
			horizontalLayout: 'fitted',
			charColor: (cell) => (cell.col % 2 === 0 ? [255, 120, 80] : [80, 180, 255]),
			cellColor: (cell) => (cell.row % 2 === 0 ? [4, 8, 16, 180] : undefined),
		});
		resetRenderOutput();
	});

	bench('sparse FIGlet text with blank gaps', () => {
		stub.figText('A B A B A B A B A B A B A B A B'.repeat(8), 0, 0, {
			horizontalLayout: 'full',
		});
		resetRenderOutput();
	});
});

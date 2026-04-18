import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIGFONT_REQUIRED_CODEPOINTS } from '../../../src/figfont';

export const FIGFONT_ENDMARK = '§';

export type FigFontOverrideMap = Map<number, string[]>;

export type FigFontCodetagEntry = {
	code: number;
	lines: string[];
	tag?: string;
};

export type BuildFigFontOptions = {
	headerLine?: string;
	commentLines?: string[];
	endmark?: string;
	overrides?: FigFontOverrideMap;
	codeTagged?: FigFontCodetagEntry[];
};

export type BuildSingleWidthFigFontOptions = {
	printDirection?: number;
	headerLine?: string;
	endmark?: string;
	overrides?: FigFontOverrideMap;
};

const FIXTURE_FONT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../fonts');

export function serializeFigCharacter(lines: string[], endmark: string = FIGFONT_ENDMARK): string[] {
	return lines.map((line, index) => `${line}${index === lines.length - 1 ? endmark.repeat(2) : endmark}`);
}

export function buildFigFont(options: BuildFigFontOptions = {}): string {
	const {
		headerLine = 'flf2a$ 2 1 12 0 1 0 0 1',
		commentLines = ['Sample test font'],
		endmark = FIGFONT_ENDMARK,
		overrides = new Map<number, string[]>(),
		codeTagged = [{ code: 9731, lines: ['**', '$*'], tag: '0x2603' }],
	} = options;

	const content: string[] = [headerLine, ...commentLines];

	for (const codePoint of FIGFONT_REQUIRED_CODEPOINTS) {
		const defaultChar = String.fromCodePoint(codePoint);
		const lines = overrides.get(codePoint) ?? [defaultChar, `${defaultChar}${defaultChar}`];
		content.push(...serializeFigCharacter(lines, endmark));
	}

	for (const entry of codeTagged) {
		content.push(entry.tag ?? String(entry.code));
		content.push(...serializeFigCharacter(entry.lines, endmark));
	}

	return content.join('\n');
}

export function buildSingleWidthFigFont(options: BuildSingleWidthFigFontOptions = {}): string {
	const {
		printDirection = 0,
		headerLine = `flf2a$ 1 1 8 -1 0 ${printDirection} 0 0`,
		endmark = FIGFONT_ENDMARK,
		overrides = new Map<number, string[]>(),
	} = options;

	const lines = [headerLine];

	for (const codePoint of FIGFONT_REQUIRED_CODEPOINTS) {
		const character = String.fromCodePoint(codePoint);
		const figLines = overrides.get(codePoint) ?? [character];
		lines.push(...serializeFigCharacter(figLines, endmark));
	}

	return lines.join('\n');
}

export function readFigFontFixture(relativePath: string): string {
	return readFileSync(resolve(FIXTURE_FONT_DIRECTORY, relativePath), 'utf8').replace(/\r\n/g, '\n').trimEnd();
}

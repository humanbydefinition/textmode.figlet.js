import { beforeEach, describe, expect, it } from 'vitest';

import { FigFontParser, FIGFONT_REQUIRED_CODEPOINTS } from '../../../src/figfont';
import { buildFigFont, readFigFontFixture } from '../../fixtures/builders/figFontBuilder';

describe('FigFontParser unit', () => {
	let sampleFont: string;

	beforeEach(() => {
		sampleFont = buildFigFont({
			overrides: new Map([
				[32, ['  ', ' $']],
				[65, ['$A', 'A$']],
			]),
		});
	});

	it('parses header metadata, required characters, and code-tagged characters', () => {
		const parsed = FigFontParser._parse(sampleFont);

		expect(parsed.header.signature).toBe('flf2a');
		expect(parsed.header.hardblank).toBe('$');
		expect(parsed.header.height).toBe(2);
		expect(parsed.header.baseline).toBe(1);
		expect(parsed.header.commentLines).toBe(1);
		expect(parsed.header.codetagCount).toBe(1);
		expect(parsed.characters.size).toBe(FIGFONT_REQUIRED_CODEPOINTS.length + 1);
		expect(parsed.characters.has(32)).toBe(true);
		expect(parsed.characters.has(126)).toBe(true);
		expect(parsed.characters.has(0x00df)).toBe(true);
		expect(parsed.characters.has(9731)).toBe(true);
	});

	it('preserves hardblanks and calculates widths after removing endmarks', () => {
		const parsed = FigFontParser._parse(sampleFont);
		const characterA = parsed.characters.get(65);
		const snowman = parsed.characters.get(9731);

		expect(characterA).toEqual({
			code: 65,
			lines: ['$A', 'A$'],
			width: 2,
		});
		expect(snowman?.lines).toEqual(['**', '$*']);
		expect(snowman?.width).toBe(2);
	});

	it('throws on invalid headers', () => {
		expect(() => FigFontParser._parse('not-a-font')).toThrow('Unsupported FIGfont signature');
		expect(() => FigFontParser._parse(readFigFontFixture('invalid/bad-header.flf'))).toThrow(
			'Incomplete FIGfont header'
		);
		expect(() => FigFontParser._parse(buildFigFont({ headerLine: 'flf2b$ 2 1 12 0 1' }))).toThrow(
			'Unsupported FIGfont signature'
		);
		expect(() => FigFontParser._parse(buildFigFont({ headerLine: 'flf2a$ 2 nope 12 0 1' }))).toThrow(
			'Invalid FIGfont header value'
		);
	});

	it('throws when required character data is truncated', () => {
		expect(() => FigFontParser._parse(readFigFontFixture('invalid/truncated.flf'))).toThrow(
			'Unexpected end of FIGfont character data'
		);
	});
});

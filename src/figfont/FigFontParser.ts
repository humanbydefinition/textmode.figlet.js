import { FigletError } from '../error/FigletError';

import type { FigCharacter, FigFontHeader, ParsedFigFontData } from './types';
import { FIGFONT_REQUIRED_CODEPOINTS } from './types';

/**
 * Parser for FIGfont v2 `.flf` files.
 *
 * @internal
 */
export class FigFontParser {
	/**
	 * Parse a complete `.flf` file string into structured header and character data.
	 *
	 * @param data Raw FIGfont file contents.
	 * @returns Parsed header metadata and a character map keyed by code point.
	 */
	public static _parse(data: string): ParsedFigFontData {
		if (data.length === 0) {
			throw new FigletError('Cannot parse an empty FIGfont file.');
		}

		const lines = data.replace(/\r\n?/g, '\n').split('\n');
		const headerLine = lines[0];
		if (!headerLine) {
			throw new FigletError('Missing FIGfont header line.');
		}

		const header = this._parseHeader(headerLine);
		let cursor = 1 + header.commentLines;

		if (cursor > lines.length) {
			throw new FigletError('FIGfont comment line count exceeds file length.', {
				commentLines: header.commentLines,
				totalLines: lines.length,
			});
		}

		const characters = new Map<number, FigCharacter>();
		cursor = this._parseRequiredCharacters(lines, cursor, header, characters);
		this._parseCodeTaggedCharacters(lines, cursor, header, characters);

		return {
			header,
			characters,
		};
	}

	/**
	 * Parse the FIGfont header line.
	 *
	 * @param headerLine First line of a `.flf` file.
	 * @returns Parsed header metadata.
	 */
	private static _parseHeader(headerLine: string): FigFontHeader {
		const tokens = headerLine.trim().split(/\s+/);
		const headerToken = tokens[0] ?? '';

		if (headerToken.length < 6) {
			throw new FigletError('Invalid FIGfont header token.', { headerToken });
		}

		const signature = headerToken.slice(0, 5);
		const hardblank = headerToken.slice(5);

		if (signature !== 'flf2a') {
			throw new FigletError('Unsupported FIGfont signature.', { signature });
		}

		if (hardblank.length !== 1) {
			throw new FigletError('FIGfont hardblank must be a single character.', { hardblank });
		}

		if (tokens.length < 6) {
			throw new FigletError('Incomplete FIGfont header.', { headerLine });
		}

		const height = this._parseIntegerToken(tokens[1], 'height');
		const baseline = this._parseIntegerToken(tokens[2], 'baseline');
		const maxLength = this._parseIntegerToken(tokens[3], 'maxLength');
		const oldLayout = this._parseIntegerToken(tokens[4], 'oldLayout');
		const commentLines = this._parseIntegerToken(tokens[5], 'commentLines');
		const printDirection = this._parseIntegerToken(tokens[6] ?? '0', 'printDirection');
		const fullLayout = this._parseIntegerToken(tokens[7] ?? '0', 'fullLayout');
		const codetagCount = this._parseIntegerToken(tokens[8] ?? '0', 'codetagCount');

		return {
			signature,
			hardblank,
			height,
			baseline,
			maxLength,
			oldLayout,
			commentLines,
			printDirection,
			fullLayout,
			codetagCount,
		};
	}

	private static _parseRequiredCharacters(
		lines: string[],
		startIndex: number,
		header: FigFontHeader,
		characters: Map<number, FigCharacter>
	): number {
		let cursor = startIndex;

		for (const codePoint of FIGFONT_REQUIRED_CODEPOINTS) {
			const parsedCharacter = this._readCharacter(lines, cursor, header.height, codePoint);
			characters.set(codePoint, parsedCharacter);
			cursor += header.height;
		}

		return cursor;
	}

	private static _parseCodeTaggedCharacters(
		lines: string[],
		startIndex: number,
		header: FigFontHeader,
		characters: Map<number, FigCharacter>
	): void {
		let cursor = startIndex;

		while (cursor < lines.length) {
			const codetagLine = lines[cursor]?.trim() ?? '';
			if (codetagLine.length === 0) {
				cursor += 1;
				continue;
			}

			const codePoint = this._parseCodetag(codetagLine);
			cursor += 1;

			const parsedCharacter = this._readCharacter(lines, cursor, header.height, codePoint);
			characters.set(codePoint, parsedCharacter);
			cursor += header.height;
		}
	}

	private static _readCharacter(
		lines: string[],
		startIndex: number,
		height: number,
		codePoint: number
	): FigCharacter {
		if (startIndex + height > lines.length) {
			throw new FigletError('Unexpected end of FIGfont character data.', {
				codePoint,
				startIndex,
				height,
				totalLines: lines.length,
			});
		}

		const parsedLines: string[] = [];
		let width = 0;

		for (let row = 0; row < height; row += 1) {
			const rawLine = lines[startIndex + row] ?? '';
			if (rawLine.length === 0) {
				throw new FigletError('Encountered an empty FIGcharacter row.', {
					codePoint,
					row,
					startIndex,
				});
			}

			const endmark = rawLine.at(-1);
			if (!endmark) {
				throw new FigletError('Failed to determine FIGcharacter endmark.', {
					codePoint,
					row,
				});
			}

			let line = rawLine;
			while (line.endsWith(endmark)) {
				line = line.slice(0, -1);
			}
			parsedLines.push(line);
			width = Math.max(width, line.length);
		}

		return {
			code: codePoint,
			lines: parsedLines,
			width,
		};
	}

	private static _parseCodetag(codetagLine: string): number {
		const token = codetagLine.split(/\s+/, 1)[0];

		if (/^[-+]?0x[0-9a-f]+$/i.test(token)) {
			return Number.parseInt(token, 16);
		}

		if (/^[-+]?0[0-7]+$/.test(token)) {
			return Number.parseInt(token, 8);
		}

		if (/^[-+]?\d+$/.test(token)) {
			return Number.parseInt(token, 10);
		}

		throw new FigletError('Invalid FIGfont code tag.', { codetagLine });
	}

	private static _parseIntegerToken(token: string, field: string): number {
		if (!/^-?\d+$/.test(token)) {
			throw new FigletError('Invalid FIGfont header value.', { field, token });
		}

		return Number.parseInt(token, 10);
	}
}

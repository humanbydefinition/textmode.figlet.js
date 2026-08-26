import { FigletError } from '../error/FigletError';

import { FigFontParser } from './FigFontParser';
import { FigLayoutEngine } from './FigLayoutEngine';

import type {
	FigCharacter,
	FigFontHeader,
	FigHorizontalLayout,
	FigPrintDirection,
	FigRenderPlan,
	FigTextOptions,
	FigTextResult,
	FigVerticalLayout,
	ResolvedFigInputCharacter,
} from './types';

interface FigInputCharacter {
	character: string;
	inputIndex: number;
}

/**
 * Parsed FIGfont resource used by `figText()` rendering.
 *
 * @category FIGfont resources
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont | TextmodeFigFont API reference}
 */
export class TextmodeFigFont {
	private readonly _name: string;
	private readonly _header: FigFontHeader;
	private readonly _characters: Map<number, FigCharacter>;
	private readonly _layoutEngine: FigLayoutEngine;
	private readonly _onDisposeCallbacks = new Set<() => void>();
	private _disposed = false;

	private constructor(name: string, header: FigFontHeader, characters: Map<number, FigCharacter>) {
		this._name = name;
		this._header = header;
		this._characters = characters;
		this._layoutEngine = new FigLayoutEngine(header);
	}

	/**
	 * Register a callback to run when this font is disposed.
	 *
	 * @internal
	 */
	public _addOnDispose(callback: () => void): void {
		if (this._disposed) {
			callback();
			return;
		}
		this._onDisposeCallbacks.add(callback);
	}

	/**
	 * Dispose resources associated with this FIGfont.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/dispose/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/methods/dispose | TextmodeFigFont.dispose API reference}
	 */
	public dispose(): void {
		if (this._disposed) return;
		this._disposed = true;
		for (const callback of this._onDisposeCallbacks) {
			callback();
		}
		this._onDisposeCallbacks.clear();
	}

	/**
	 * Load a FIGfont from a URL or path.
	 *
	 * @param source URL or relative path to a `.flf` file.
	 * @returns A parsed FIGfont instance.
	 *
	 * @internal
	 */
	public static async _fromURL(source: string | URL): Promise<TextmodeFigFont> {
		const response = await fetch(source);
		if (!response.ok) {
			throw new FigletError('Failed to load FIGfont file.', {
				source: String(source),
				status: response.status,
				statusText: response.statusText,
			});
		}

		const data = await response.text();
		return this._fromString(this._resolveName(source), data);
	}

	/**
	 * Parse a FIGfont from a raw `.flf` string.
	 *
	 * @param name Human-readable font name.
	 * @param data Raw `.flf` contents.
	 * @returns A parsed FIGfont instance.
	 *
	 * @internal
	 */
	public static _fromString(name: string, data: string): TextmodeFigFont {
		const parsed = FigFontParser._parse(data);
		return new TextmodeFigFont(name, parsed.header, parsed.characters);
	}

	private _getChar(value: number | string): FigCharacter | undefined {
		const codePoint = typeof value === 'number' ? value : value.codePointAt(0);
		if (codePoint === undefined) {
			return undefined;
		}
		return this._characters.get(codePoint);
	}

	/**
	 * Look up a FIGcharacter by Unicode code point or by the first character in a string.
	 *
	 * @param value Unicode code point or string to resolve.
	 * @returns The matching FIGcharacter, if present.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/getCharacter/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/methods/getCharacter | TextmodeFigFont.getCharacter API reference}
	 */
	public getCharacter(value: number | string): FigCharacter | undefined {
		return cloneCharacter(this._getChar(value));
	}

	/**
	 * Plan a string into positioned FIGlet cells and logical lines.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/planText/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/methods/planText | TextmodeFigFont.planText API reference}
	 */
	public planText(text: string, options: FigTextOptions = {}): FigRenderPlan {
		const horizontalLayout = options.horizontalLayout ?? this.defaultLayout;
		const verticalLayout = options.verticalLayout ?? this.defaultVerticalLayout;
		const direction = this._resolveDirection(options.direction);
		const lineInputs = this._splitInputLines(text)
			.map((line) => (direction === 'rtl' ? [...line].reverse() : line))
			.flatMap((line) => this._wrapInputLine(line, horizontalLayout, options));
		const plannedLines = lineInputs.map((line, lineIndex) => {
			const characters = this._resolveCharacters(line);
			return this._layoutEngine._layoutHorizontalPlan(characters, horizontalLayout, lineIndex);
		});
		const composed = this._layoutEngine._layoutVerticalPlan(plannedLines, verticalLayout);

		return {
			cells: composed.cells,
			lines: composed.lines,
			cols: composed.cols,
			rows: composed.rows,
			direction,
		};
	}

	/**
	 * Render a string into a FIGlet sub-character grid.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/renderText/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/methods/renderText | TextmodeFigFont.renderText API reference}
	 */
	public renderText(text: string, options: FigTextOptions = {}): FigTextResult {
		const plan = this.planText(text, options);
		const grid = Array.from({ length: plan.rows }, () => Array.from({ length: plan.cols }, () => ' '));

		for (const cell of plan.cells) {
			grid[cell.row]![cell.col] = cell.char;
		}

		return {
			grid,
			cols: plan.cols,
			rows: plan.rows,
		};
	}

	/**
	 * Measure rendered FIGlet text without drawing it.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/measureText/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/methods/measureText | TextmodeFigFont.measureText API reference}
	 */
	public measureText(text: string, options: FigTextOptions = {}): { cols: number; rows: number } {
		const plan = this.planText(text, options);
		return { cols: plan.cols, rows: plan.rows };
	}

	/**
	 * The display name associated with this FIGfont.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/name/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/name | TextmodeFigFont.name API reference}
	 */
	get name(): string {
		return this._name;
	}

	/**
	 * The parsed FIGfont header metadata.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/header/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/header | TextmodeFigFont.header API reference}
	 */
	get header(): FigFontHeader {
		return {
			...this._header,
		};
	}

	/**
	 * Parsed FIGcharacters keyed by Unicode code point.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/characters/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/characters | TextmodeFigFont.characters API reference}
	 */
	get characters(): Map<number, FigCharacter> {
		return new Map(
			Array.from(this._characters, ([codePoint, character]) => [codePoint, cloneCharacter(character)!])
		);
	}

	/**
	 * Hardblank character declared by the font.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/hardblank/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/hardblank | TextmodeFigFont.hardblank API reference}
	 */
	get hardblank(): string {
		return this._header.hardblank;
	}

	/**
	 * Number of rows in each FIGcharacter.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/height/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/height | TextmodeFigFont.height API reference}
	 */
	get height(): number {
		return this._header.height;
	}

	/**
	 * Baseline row declared by the font.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/baseline/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/baseline | TextmodeFigFont.baseline API reference}
	 */
	get baseline(): number {
		return this._header.baseline;
	}

	/**
	 * Default horizontal layout implied by the header metadata.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/defaultLayout/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/defaultLayout | TextmodeFigFont.defaultLayout API reference}
	 */
	get defaultLayout(): FigHorizontalLayout {
		if ((this._header.fullLayout & 128) !== 0) {
			return 'smushed';
		}

		if ((this._header.fullLayout & 64) !== 0) {
			return 'fitted';
		}

		if (this._header.oldLayout === -1) {
			return 'full';
		}

		if (this._header.oldLayout === 0) {
			return 'fitted';
		}

		return this._header.oldLayout > 0 ? 'smushed' : 'full';
	}

	/**
	 * Default print direction implied by the FIGfont header metadata.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/defaultPrintDirection/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/defaultPrintDirection | TextmodeFigFont.defaultPrintDirection API reference}
	 */
	get defaultPrintDirection(): 'ltr' | 'rtl' {
		return this._header.printDirection === 1 ? 'rtl' : 'ltr';
	}

	/**
	 * Default vertical layout implied by the FIGfont header metadata.
	 *
	 * @example
	 * {@includeCode ../../examples/TextmodeFigFont/defaultVerticalLayout/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont/accessors/defaultVerticalLayout | TextmodeFigFont.defaultVerticalLayout API reference}
	 */
	get defaultVerticalLayout(): FigVerticalLayout {
		if ((this._header.fullLayout & 16384) !== 0) {
			return 'smushed';
		}

		if ((this._header.fullLayout & 8192) !== 0) {
			return 'fitted';
		}

		return 'full';
	}

	private static _resolveName(source: string | URL): string {
		const rawSource = source instanceof URL ? source.pathname : source;
		const normalizedSource = rawSource.split(/[?#]/, 1)[0] ?? rawSource;
		const segment = normalizedSource.split('/').filter(Boolean).pop() ?? 'figfont';

		return segment.toLowerCase().endsWith('.flf') ? segment.slice(0, -4) || 'figfont' : segment;
	}

	private _splitInputLines(text: string): Array<Array<{ character: string; inputIndex: number }>> {
		const lines: Array<Array<{ character: string; inputIndex: number }>> = [[]];

		for (const [inputIndex, character] of Array.from(text).entries()) {
			if (character === '\n') {
				lines.push([]);
				continue;
			}

			lines[lines.length - 1]!.push({
				character,
				inputIndex,
			});
		}

		return lines;
	}

	private _resolveCharacters(line: FigInputCharacter[]): ResolvedFigInputCharacter[] {
		const characters = line.map(({ character, inputIndex }) => ({
			figChar: this._getChar(character) ?? this._getChar(32),
			inputChar: character,
			inputIndex,
		}));
		const missingCharacter = characters.find((character) => character.figChar === undefined);

		if (missingCharacter) {
			throw new FigletError('FIGfont is missing a required character for layout.', {
				character: missingCharacter.inputChar,
				index: missingCharacter.inputIndex,
			});
		}

		return characters as ResolvedFigInputCharacter[];
	}

	private _wrapInputLine(
		line: FigInputCharacter[],
		horizontalLayout: FigHorizontalLayout,
		options: FigTextOptions
	): FigInputCharacter[][] {
		const maxCols =
			typeof options.maxCols === 'number' && Number.isFinite(options.maxCols)
				? Math.floor(options.maxCols)
				: undefined;
		const wrapMode = options.wrap ?? 'none';

		if (line.length === 0 || !maxCols || maxCols < 1 || wrapMode === 'none') {
			return [line];
		}

		if (wrapMode === 'char') {
			return this._wrapInputLineByCharacter(line, horizontalLayout, maxCols);
		}

		return this._wrapInputLineByWord(line, horizontalLayout, maxCols);
	}

	private _wrapInputLineByWord(
		line: FigInputCharacter[],
		horizontalLayout: FigHorizontalLayout,
		maxCols: number
	): FigInputCharacter[][] {
		const tokens = this._tokenizeByWhitespace(line);
		const hasWord = tokens.some((token) => !token.isWhitespace);
		if (!hasWord) {
			return [line];
		}

		const wrappedLines: FigInputCharacter[][] = [];
		let currentLine: FigInputCharacter[] = [];
		let pendingWhitespace: FigInputCharacter[] = [];

		for (const token of tokens) {
			if (token.isWhitespace) {
				if (currentLine.length > 0) {
					pendingWhitespace = token.characters;
				}
				continue;
			}

			const candidate =
				currentLine.length === 0 ? token.characters : currentLine.concat(pendingWhitespace, token.characters);

			if (currentLine.length > 0 && this._measureInputLine(candidate, horizontalLayout) > maxCols) {
				wrappedLines.push(currentLine);
				currentLine = token.characters.slice();
			} else {
				currentLine = candidate;
			}

			pendingWhitespace = [];
		}

		if (currentLine.length === 0) {
			return [[]];
		}

		wrappedLines.push(currentLine);
		return wrappedLines;
	}

	private _wrapInputLineByCharacter(
		line: FigInputCharacter[],
		horizontalLayout: FigHorizontalLayout,
		maxCols: number
	): FigInputCharacter[][] {
		const wrappedLines: FigInputCharacter[][] = [];
		let currentLine: FigInputCharacter[] = [];

		for (const character of line) {
			const candidate = currentLine.concat(character);
			if (currentLine.length > 0 && this._measureInputLine(candidate, horizontalLayout) > maxCols) {
				wrappedLines.push(currentLine);
				currentLine = [character];
				continue;
			}

			currentLine = candidate;
		}

		if (currentLine.length === 0) {
			return [[]];
		}

		wrappedLines.push(currentLine);
		return wrappedLines;
	}

	private _measureInputLine(line: FigInputCharacter[], horizontalLayout: FigHorizontalLayout): number {
		const characters = this._resolveCharacters(line);
		return this._layoutEngine._layoutHorizontalPlan(characters, horizontalLayout, 0).cols;
	}

	private _tokenizeByWhitespace(
		line: FigInputCharacter[]
	): Array<{ isWhitespace: boolean; characters: FigInputCharacter[] }> {
		const tokens: Array<{ isWhitespace: boolean; characters: FigInputCharacter[] }> = [];

		for (const character of line) {
			const isWhitespace = /\s/u.test(character.character);
			const currentToken = tokens[tokens.length - 1];

			if (!currentToken || currentToken.isWhitespace !== isWhitespace) {
				tokens.push({
					isWhitespace,
					characters: [character],
				});
				continue;
			}

			currentToken.characters.push(character);
		}

		return tokens;
	}

	private _resolveDirection(direction: FigPrintDirection | undefined): 'ltr' | 'rtl' {
		if (direction === 'ltr' || direction === 'rtl') {
			return direction;
		}

		return this.defaultPrintDirection;
	}
}

function cloneCharacter(character: FigCharacter | undefined): FigCharacter | undefined {
	if (!character) {
		return undefined;
	}

	return {
		...character,
		lines: [...character.lines],
	};
}

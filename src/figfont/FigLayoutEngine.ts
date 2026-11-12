import { FigSmushRules } from './FigSmushRules';

import type {
	FigCharacter,
	FigFontHeader,
	FigHorizontalLayout,
	FigRenderLine,
	FigTextCellContext,
	FigVerticalLayout,
	ResolvedFigInputCharacter,
} from './types';

/**
 * Horizontal FIGlet layout engine for composing FIGcharacters into a character grid.
 *
 * @internal
 */
export class FigLayoutEngine {
	private readonly _header: FigFontHeader;
	private readonly _horizontalRuleMask: number;
	private readonly _verticalRuleMask: number;

	constructor(header: FigFontHeader) {
		this._header = header;
		this._horizontalRuleMask = FigSmushRules._getHorizontalRuleMask(header);
		this._verticalRuleMask = FigSmushRules._getVerticalRuleMask(header);
	}

	/**
	 * Lay out a sequence of FIGcharacters into a positioned render line.
	 */
	public _layoutHorizontalPlan(
		characters: readonly ResolvedFigInputCharacter[],
		mode: FigHorizontalLayout,
		lineIndex: number
	): FigRenderLine {
		if (characters.length === 0) {
			return {
				lineIndex,
				cells: [],
				cols: 0,
				rows: this._header.height,
			};
		}

		const first = characters[0]!;
		let rows = this._createRowsFromCharacter(first, lineIndex);
		let width = first.figChar.width;

		for (let index = 1; index < characters.length; index += 1) {
			const item = characters[index]!;
			const { figChar } = item;
			const overlap = this._calculateSmushAmountForRows(rows, width, figChar, mode);
			const startColumn = width - overlap;
			const nextWidth = Math.max(width, startColumn + figChar.width);
			const mergedRows = rows.map((row) => Array.from({ length: nextWidth }, (_, colIndex) => row[colIndex]));

			for (let rowIndex = 0; rowIndex < this._header.height; rowIndex += 1) {
				const rightLine = figChar.lines[rowIndex] ?? '';
				const mergedRow = mergedRows[rowIndex]!;

				for (let column = 0; column < figChar.width; column += 1) {
					const rightChar = rightLine[column] ?? ' ';
					if (rightChar === ' ') {
						continue;
					}

					const targetColumn = startColumn + column;
					const leftCell = mergedRow[targetColumn];
					const rightCell = this._createCell(targetColumn, rowIndex, column, lineIndex, item, rightChar);

					if (!leftCell) {
						mergedRow[targetColumn] = rightCell;
						continue;
					}

					const smushed = FigSmushRules._smushHorizontal(
						leftCell.char,
						rightChar,
						this._header.hardblank,
						this._horizontalRuleMask
					);

					mergedRow[targetColumn] = this._resolveSmushedCell(leftCell, rightCell, smushed ?? rightChar);
				}
			}

			rows = mergedRows;
			width = nextWidth;
		}

		return this._materializeLine(rows, width, lineIndex);
	}

	/**
	 * Compose multiple planned FIGlet lines vertically.
	 */
	public _layoutVerticalPlan(
		lines: readonly FigRenderLine[],
		mode: FigVerticalLayout
	): {
		cells: FigTextCellContext[];
		lines: FigRenderLine[];
		cols: number;
		rows: number;
	} {
		if (lines.length === 0) {
			return {
				cells: [],
				lines: [],
				cols: 0,
				rows: 0,
			};
		}

		let rows = this._createRowsFromLine(lines[0]!);
		let width = lines[0]!.cols;
		let height = lines[0]!.rows;
		const positionedLines: FigRenderLine[] = [this._offsetLine(lines[0]!, 0)];

		for (let index = 1; index < lines.length; index += 1) {
			const line = lines[index]!;
			const overlap = this._calculateVerticalSmushAmount(rows, height, width, line, mode);
			const startRow = height - overlap;
			const nextWidth = Math.max(width, line.cols);
			const nextHeight = Math.max(height, startRow + line.rows);
			const mergedRows = Array.from({ length: nextHeight }, (_, rowIndex) =>
				Array.from({ length: nextWidth }, (_, columnIndex) => rows[rowIndex]?.[columnIndex])
			);

			for (const cell of line.cells) {
				const targetRow = startRow + cell.row;
				const targetColumn = cell.col;
				const existingCell = mergedRows[targetRow]?.[targetColumn];
				if (!existingCell) {
					mergedRows[targetRow]![targetColumn] = {
						...cell,
						row: targetRow,
					};
					continue;
				}

				const smushed = FigSmushRules._smushVertical(existingCell.char, cell.char, this._verticalRuleMask);
				mergedRows[targetRow]![targetColumn] = this._resolveSmushedCell(
					existingCell,
					{
						...cell,
						row: targetRow,
					},
					smushed ?? cell.char
				);
			}

			rows = mergedRows;
			width = nextWidth;
			height = nextHeight;
			positionedLines.push(this._offsetLine(line, startRow));
		}

		return this._materializePlan(rows, width, height, positionedLines);
	}

	private _calculateSmushAmountForRows(
		leftRows: Array<Array<FigTextCellContext | undefined>>,
		leftWidth: number,
		right: FigCharacter,
		mode: FigHorizontalLayout
	): number {
		if (mode === 'full') {
			return 0;
		}

		for (let overlap = leftWidth; overlap >= 0; overlap -= 1) {
			let canUseOverlap = true;

			for (let rowIndex = 0; rowIndex < this._header.height && canUseOverlap; rowIndex += 1) {
				const leftRow = leftRows[rowIndex] ?? [];
				const rightLine = right.lines[rowIndex] ?? '';

				for (let column = 0; column < overlap; column += 1) {
					const leftChar = leftRow[leftWidth - overlap + column]?.char ?? ' ';
					const rightChar = rightLine[column] ?? ' ';

					if (!this._canOverlap(leftChar, rightChar, mode)) {
						canUseOverlap = false;
						break;
					}
				}
			}

			if (canUseOverlap) {
				return overlap;
			}
		}

		return 0;
	}

	private _canOverlap(left: string, right: string, mode: FigHorizontalLayout): boolean {
		if (left === ' ' || right === ' ') {
			return true;
		}

		if (mode === 'fitted') {
			return false;
		}

		return FigSmushRules._smushHorizontal(left, right, this._header.hardblank, this._horizontalRuleMask) !== null;
	}

	private _createRowsFromCharacter(
		item: ResolvedFigInputCharacter,
		lineIndex: number = 0
	): Array<Array<FigTextCellContext | undefined>> {
		const { figChar } = item;
		return Array.from({ length: this._header.height }, (_, rowIndex) => {
			const line = figChar.lines[rowIndex] ?? '';
			return Array.from({ length: figChar.width }, (_, column) => {
				const char = line[column] ?? ' ';
				return char === ' ' ? undefined : this._createCell(column, rowIndex, column, lineIndex, item, char);
			});
		});
	}

	private _createCell(
		col: number,
		row: number,
		subCol: number,
		lineIndex: number,
		item: ResolvedFigInputCharacter,
		char: string
	): FigTextCellContext {
		return {
			char,
			col,
			row,
			inputIndex: item.inputIndex,
			inputChar: item.inputChar,
			figCharCode: item.figChar.code,
			subRow: row,
			subCol,
			lineIndex,
		};
	}

	private _resolveSmushedCell(left: FigTextCellContext, right: FigTextCellContext, char: string): FigTextCellContext {
		if (char === left.char) {
			return left;
		}

		return {
			...right,
			char,
		};
	}

	private _materializeLine(
		rows: Array<Array<FigTextCellContext | undefined>>,
		width: number,
		lineIndex: number
	): FigRenderLine {
		const cells: FigTextCellContext[] = [];

		for (let rowIndex = 0; rowIndex < this._header.height; rowIndex += 1) {
			const row = rows[rowIndex] ?? [];

			for (let column = 0; column < width; column += 1) {
				const cell = row[column];
				if (!cell || cell.char === this._header.hardblank) {
					continue;
				}

				cells.push({
					...cell,
					col: column,
					row: rowIndex,
					lineIndex,
				});
			}
		}

		return {
			lineIndex,
			cells,
			cols: width,
			rows: this._header.height,
		};
	}

	private _calculateVerticalSmushAmount(
		topRows: Array<Array<FigTextCellContext | undefined>>,
		topHeight: number,
		width: number,
		bottomLine: FigRenderLine,
		mode: FigVerticalLayout
	): number {
		if (mode === 'full') {
			return 0;
		}

		const bottomRows = this._createRowsFromLine(bottomLine);
		const maxOverlap = Math.min(topHeight, bottomLine.rows);
		const sharedWidth = Math.max(width, bottomLine.cols);

		for (let overlap = maxOverlap; overlap >= 0; overlap -= 1) {
			let canUseOverlap = true;

			for (let rowOffset = 0; rowOffset < overlap && canUseOverlap; rowOffset += 1) {
				const topRow = topRows[topHeight - overlap + rowOffset] ?? [];
				const bottomRow = bottomRows[rowOffset] ?? [];

				for (let column = 0; column < sharedWidth; column += 1) {
					const topChar = topRow[column]?.char ?? ' ';
					const bottomChar = bottomRow[column]?.char ?? ' ';

					if (!this._canOverlapVertically(topChar, bottomChar, mode)) {
						canUseOverlap = false;
						break;
					}
				}
			}

			if (canUseOverlap) {
				return overlap;
			}
		}

		return 0;
	}

	private _canOverlapVertically(top: string, bottom: string, mode: FigVerticalLayout): boolean {
		if (top === ' ' || bottom === ' ') {
			return true;
		}

		if (mode === 'fitted') {
			return false;
		}

		return FigSmushRules._smushVertical(top, bottom, this._verticalRuleMask) !== null;
	}

	private _createRowsFromLine(line: FigRenderLine): Array<Array<FigTextCellContext | undefined>> {
		const rows = Array.from({ length: line.rows }, () =>
			Array.from({ length: line.cols }, () => undefined as FigTextCellContext | undefined)
		);

		for (const cell of line.cells) {
			rows[cell.row]![cell.col] = cell;
		}

		return rows;
	}

	private _offsetLine(line: FigRenderLine, rowOffset: number): FigRenderLine {
		return {
			...line,
			cells: line.cells.map((cell) => ({
				...cell,
				row: cell.row + rowOffset,
			})),
		};
	}

	private _materializePlan(
		rows: Array<Array<FigTextCellContext | undefined>>,
		width: number,
		height: number,
		lines: FigRenderLine[]
	): {
		cells: FigTextCellContext[];
		lines: FigRenderLine[];
		cols: number;
		rows: number;
	} {
		const cells: FigTextCellContext[] = [];

		for (let rowIndex = 0; rowIndex < height; rowIndex += 1) {
			for (let column = 0; column < width; column += 1) {
				const cell = rows[rowIndex]?.[column];
				if (!cell) {
					continue;
				}

				cells.push({
					...cell,
					row: rowIndex,
					col: column,
				});
			}
		}

		return {
			cells,
			lines,
			cols: width,
			rows: height,
		};
	}
}

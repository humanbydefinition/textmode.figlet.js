import type { color } from 'textmode.js';

/**
 * Required FIGfont character order defined by the FIGfont v2 spec:
 * ASCII 32-126 followed by 7 German characters.
 *
 * @internal
 */
export const FIGFONT_REQUIRED_CODEPOINTS: readonly number[] = [
	...Array.from({ length: 95 }, (_, index) => index + 32),
	0x00c4,
	0x00d6,
	0x00dc,
	0x00e4,
	0x00f6,
	0x00fc,
	0x00df,
];

/**
 * Parsed FIGfont header metadata from the `.flf` header line.
 *
 * @category FIGfont resources
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader | FigFontHeader API reference}
 */
export interface FigFontHeader {
	/**
	 * Always `flf2a` for supported FIGfont v2 files.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#signature | FigFontHeader.signature API reference}
	 */
	signature: string;
	/**
	 * Hardblank character used by the font.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#hardblank | FigFontHeader.hardblank API reference}
	 */
	hardblank: string;
	/**
	 * Number of rows in every FIGcharacter.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#height | FigFontHeader.height API reference}
	 */
	height: number;
	/**
	 * Baseline row reported by the font.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#baseline | FigFontHeader.baseline API reference}
	 */
	baseline: number;
	/**
	 * Maximum line length declared by the font.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#maxlength | FigFontHeader.maxLength API reference}
	 */
	maxLength: number;
	/**
	 * Legacy horizontal layout bitfield.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#oldlayout | FigFontHeader.oldLayout API reference}
	 */
	oldLayout: number;
	/**
	 * Number of comment lines immediately following the header.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#commentlines | FigFontHeader.commentLines API reference}
	 */
	commentLines: number;
	/**
	 * Font print direction: `0` left-to-right, `1` right-to-left.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#printdirection | FigFontHeader.printDirection API reference}
	 */
	printDirection: number;
	/**
	 * Full FIGfont layout flags when present.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#fulllayout | FigFontHeader.fullLayout API reference}
	 */
	fullLayout: number;
	/**
	 * Number of code-tagged characters declared by the font.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigFontHeader#codetagcount | FigFontHeader.codetagCount API reference}
	 */
	codetagCount: number;
}

/**
 * A single parsed FIGcharacter from a FIGfont.
 *
 * @category FIGfont resources
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigCharacter | FigCharacter API reference}
 */
export interface FigCharacter {
	/**
	 * Unicode code point represented by the FIGcharacter.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigCharacter#code | FigCharacter.code API reference}
	 */
	code: number;
	/**
	 * Raw FIGcharacter rows with endmarks removed.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigCharacter#lines | FigCharacter.lines API reference}
	 */
	lines: string[];
	/**
	 * Maximum row width after endmark removal.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigCharacter#width | FigCharacter.width API reference}
	 */
	width: number;
}

/**
 * Complete parsed output from a FIGfont file.
 *
 * @internal
 */
export interface ParsedFigFontData {
	header: FigFontHeader;
	characters: Map<number, FigCharacter>;
}

/**
 * A resolved input character bound to its matching FIGcharacter glyph.
 *
 * @internal
 */
export interface ResolvedFigInputCharacter {
	figChar: FigCharacter;
	inputChar: string;
	inputIndex: number;
}

/**
 * Supported horizontal layout modes for FIGlet rendering.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigHorizontalLayout | FigHorizontalLayout API reference}
 */
export type FigHorizontalLayout = 'full' | 'fitted' | 'smushed';

/**
 * Supported vertical layout modes for multi-line FIGlet rendering.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigVerticalLayout | FigVerticalLayout API reference}
 */
export type FigVerticalLayout = 'full' | 'fitted' | 'smushed';

/**
 * Supported wrap modes for FIGlet text layout.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigWrapMode | FigWrapMode API reference}
 */
export type FigWrapMode = 'none' | 'word' | 'char';

/**
 * Supported print directions for FIGlet text layout.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigPrintDirection | FigPrintDirection API reference}
 */
export type FigPrintDirection = 'font' | 'ltr' | 'rtl';

/**
 * Accepted color input for per-cell FIGlet styling.
 *
 * @category Styling
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigTextColorValue | FigTextColorValue API reference}
 */
export type FigTextColorValue =
	number | string | color.TextmodeColor | [number, number, number] | [number, number, number, number];

/**
 * Public cell metadata exposed to FIGlet styling callbacks.
 *
 * @category Styling
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext | FigTextCellContext API reference}
 */
export interface FigTextCellContext {
	/**
	 * Final drawable sub-character after layout normalization.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#char | FigTextCellContext.char API reference}
	 */
	char: string;
	/**
	 * Absolute column within the rendered result.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#col | FigTextCellContext.col API reference}
	 */
	col: number;
	/**
	 * Absolute row within the rendered result.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#row | FigTextCellContext.row API reference}
	 */
	row: number;
	/**
	 * Zero-based index into the original input string's character sequence.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#inputindex | FigTextCellContext.inputIndex API reference}
	 */
	inputIndex: number;
	/**
	 * Original input character that produced this cell.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#inputchar | FigTextCellContext.inputChar API reference}
	 */
	inputChar: string;
	/**
	 * FIGcharacter code used to produce this cell.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#figcharcode | FigTextCellContext.figCharCode API reference}
	 */
	figCharCode: number;
	/**
	 * Row within the source FIGcharacter.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#subrow | FigTextCellContext.subRow API reference}
	 */
	subRow: number;
	/**
	 * Column within the source FIGcharacter.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#subcol | FigTextCellContext.subCol API reference}
	 */
	subCol: number;
	/**
	 * Logical rendered line index after explicit newline splitting.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextCellContext#lineindex | FigTextCellContext.lineIndex API reference}
	 */
	lineIndex: number;
}

/**
 * Resolver for per-cell FIGlet colors.
 *
 * @category Styling
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigTextColorResolver | FigTextColorResolver API reference}
 */
export type FigTextColorResolver = FigTextColorValue | ((cell: FigTextCellContext) => FigTextColorValue | undefined);

/**
 * Layout options for rendering FIGlet text.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions | FigTextOptions API reference}
 */
export interface FigTextOptions {
	/**
	 * Override the font's default horizontal layout.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#horizontallayout | FigTextOptions.horizontalLayout API reference}
	 */
	horizontalLayout?: FigHorizontalLayout;
	/**
	 * Override the vertical composition mode for multi-line FIGlet layout.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#verticallayout | FigTextOptions.verticalLayout API reference}
	 */
	verticalLayout?: FigVerticalLayout;
	/**
	 * Override the effective print direction for layout.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#direction | FigTextOptions.direction API reference}
	 */
	direction?: FigPrintDirection;
	/**
	 * Optional wrap strategy for multi-line layout.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#wrap | FigTextOptions.wrap API reference}
	 */
	wrap?: FigWrapMode;
	/**
	 * Maximum rendered columns per logical line before wrapping occurs.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#maxcols | FigTextOptions.maxCols API reference}
	 */
	maxCols?: number;
	/**
	 * Override or resolve the foreground color for each rendered FIGlet cell.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#charcolor | FigTextOptions.charColor API reference}
	 */
	charColor?: FigTextColorResolver;
	/**
	 * Override or resolve the background color for each rendered FIGlet cell.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.figlet.js/interfaces/FigTextOptions#cellcolor | FigTextOptions.cellColor API reference}
	 */
	cellColor?: FigTextColorResolver;
}

/**
 * A single logical line within a planned FIGlet render.
 *
 * @internal
 */
export interface FigRenderLine {
	/** Logical line index. */
	lineIndex: number;
	/** Drawable cells in row-major order. */
	cells: FigTextCellContext[];
	/** Width of the line in grid cells, including blanks. */
	cols: number;
	/** Height of the line in grid cells. */
	rows: number;
}

/**
 * Full internal render plan for FIGlet text.
 *
 * @internal
 */
export interface FigRenderPlan {
	/** All drawable cells in row-major order. */
	cells: FigTextCellContext[];
	/** Logical lines included in the rendered output. */
	lines: FigRenderLine[];
	/** Total rendered width in grid cells. */
	cols: number;
	/** Total rendered height in grid cells. */
	rows: number;
	/** Effective print direction for the plan. */
	direction: 'ltr' | 'rtl';
}

/**
 * Rendered FIGlet text as a 2D sub-character grid.
 *
 * @internal
 */
export interface FigTextResult {
	/** Grid rows made up of single-character cells. */
	grid: string[][];
	/** Number of occupied columns in the rendered grid. */
	cols: number;
	/** Number of rows in the rendered grid. */
	rows: number;
}

/**
 * Horizontal alignment options for `figText()` placement.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigTextAlign | FigTextAlign API reference}
 */
export type FigTextAlign = 'left' | 'center' | 'right';

/**
 * Vertical alignment options for `figText()` placement.
 *
 * @category Layout and rendering
 *
 * @see {@link https://code.textmode.art/api/textmode.figlet.js/type-aliases/FigTextBaseline | FigTextBaseline API reference}
 */
export type FigTextBaseline = 'top' | 'center' | 'bottom' | 'baseline';

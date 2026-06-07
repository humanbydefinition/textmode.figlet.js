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
 */
export interface FigFontHeader {
	/** Always `flf2a` for supported FIGfont v2 files. */
	signature: string;
	/** Hardblank character used by the font. */
	hardblank: string;
	/** Number of rows in every FIGcharacter. */
	height: number;
	/** Baseline row reported by the font. */
	baseline: number;
	/** Maximum line length declared by the font. */
	maxLength: number;
	/** Legacy horizontal layout bitfield. */
	oldLayout: number;
	/** Number of comment lines immediately following the header. */
	commentLines: number;
	/** Font print direction: `0` left-to-right, `1` right-to-left. */
	printDirection: number;
	/** Full FIGfont layout flags when present. */
	fullLayout: number;
	/** Number of code-tagged characters declared by the font. */
	codetagCount: number;
}

/**
 * A single parsed FIGcharacter from a FIGfont.
 */
export interface FigCharacter {
	/** Unicode code point represented by the FIGcharacter. */
	code: number;
	/** Raw FIGcharacter rows with endmarks removed. */
	lines: string[];
	/** Maximum row width after endmark removal. */
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
 * Supported horizontal layout modes for FIGlet rendering.
 */
export type FigHorizontalLayout = 'full' | 'fitted' | 'smushed';

/**
 * Supported vertical layout modes for multi-line FIGlet rendering.
 */
export type FigVerticalLayout = 'full' | 'fitted' | 'smushed';

/**
 * Supported wrap modes for FIGlet text layout.
 */
export type FigWrapMode = 'none' | 'word' | 'char';

/**
 * Supported print directions for FIGlet text layout.
 */
export type FigPrintDirection = 'font' | 'ltr' | 'rtl';

/**
 * Accepted color input for per-cell FIGlet styling.
 */
export type FigTextColorValue =
	| number
	| string
	| color.TextmodeColor
	| [number, number, number]
	| [number, number, number, number];

/**
 * Public cell metadata exposed to FIGlet styling callbacks.
 */
export interface FigTextCellContext {
	/** Final drawable sub-character after layout normalization. */
	char: string;
	/** Absolute column within the rendered result. */
	col: number;
	/** Absolute row within the rendered result. */
	row: number;
	/** Zero-based index into the original input string's character sequence. */
	inputIndex: number;
	/** Original input character that produced this cell. */
	inputChar: string;
	/** FIGcharacter code used to produce this cell. */
	figCharCode: number;
	/** Row within the source FIGcharacter. */
	subRow: number;
	/** Column within the source FIGcharacter. */
	subCol: number;
	/** Logical rendered line index after explicit newline splitting. */
	lineIndex: number;
}

/**
 * Resolver for per-cell FIGlet colors.
 */
export type FigTextColorResolver = FigTextColorValue | ((cell: FigTextCellContext) => FigTextColorValue | undefined);

/**
 * Layout options for rendering FIGlet text.
 */
export interface FigTextOptions {
	/** Override the font's default horizontal layout. */
	horizontalLayout?: FigHorizontalLayout;
	/** Override the vertical composition mode for multi-line FIGlet layout. */
	verticalLayout?: FigVerticalLayout;
	/** Override the effective print direction for layout. */
	direction?: FigPrintDirection;
	/** Optional wrap strategy for multi-line layout. */
	wrap?: FigWrapMode;
	/** Maximum rendered columns per logical line before wrapping occurs. */
	maxCols?: number;
	/** Override or resolve the foreground color for each rendered FIGlet cell. */
	charColor?: FigTextColorResolver;
	/** Override or resolve the background color for each rendered FIGlet cell. */
	cellColor?: FigTextColorResolver;
}

/**
 * A single drawable cell produced by FIGlet layout.
 *
 * @internal
 */
export type FigRenderCell = FigTextCellContext;

/**
 * A single logical line within a planned FIGlet render.
 *
 * @internal
 */
export interface FigRenderLine {
	/** Logical line index. */
	lineIndex: number;
	/** Drawable cells in row-major order. */
	cells: FigRenderCell[];
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
	cells: FigRenderCell[];
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
 */
export type FigTextAlign = 'left' | 'center' | 'right';

/**
 * Vertical alignment options for `figText()` placement.
 */
export type FigTextBaseline = 'top' | 'center' | 'bottom' | 'baseline';

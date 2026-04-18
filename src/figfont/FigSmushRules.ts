import type { FigFontHeader } from './types';

/**
 * Horizontal FIGlet smushing rules.
 *
 * @internal
 */
export class FigSmushRules {
	public static readonly RULE_EQUAL_CHARACTER = 1;
	public static readonly RULE_UNDERSCORE = 2;
	public static readonly RULE_HIERARCHY = 4;
	public static readonly RULE_OPPOSITE_PAIR = 8;
	public static readonly RULE_BIG_X = 16;
	public static readonly RULE_HARDBLANK = 32;
	public static readonly VERTICAL_RULE_EQUAL_CHARACTER = 256;
	public static readonly VERTICAL_RULE_UNDERSCORE = 512;
	public static readonly VERTICAL_RULE_HIERARCHY = 1024;
	public static readonly VERTICAL_RULE_HORIZONTAL_LINE = 2048;
	public static readonly VERTICAL_RULE_VERTICAL_LINE_SUPERSMUSH = 4096;

	/**
	 * Resolve the active horizontal rule mask from the parsed FIGfont header.
	 */
	public static _getHorizontalRuleMask(header: FigFontHeader): number {
		if (header.fullLayout !== 0) {
			return header.fullLayout & 63;
		}

		return header.oldLayout > 0 ? header.oldLayout & 63 : 0;
	}

	/**
	 * Resolve the active vertical rule mask from the parsed FIGfont header.
	 */
	public static _getVerticalRuleMask(header: FigFontHeader): number {
		return header.fullLayout & 7936;
	}

	/**
	 * Attempt to smush two horizontally overlapping characters.
	 *
	 * Returns `null` when the two characters cannot be merged in controlled-smush mode.
	 */
	public static _smushHorizontal(left: string, right: string, hardblank: string, rules: number): string | null {
		if (left === ' ') {
			return right;
		}

		if (right === ' ') {
			return left;
		}

		if (rules === 0) {
			return this._smushUniversal(left, right, hardblank);
		}

		return (
			((rules & this.RULE_EQUAL_CHARACTER) !== 0 ? this._rule1EqualCharacter(left, right, hardblank) : null) ??
			((rules & this.RULE_UNDERSCORE) !== 0 ? this._rule2Underscore(left, right) : null) ??
			((rules & this.RULE_HIERARCHY) !== 0 ? this._rule3Hierarchy(left, right) : null) ??
			((rules & this.RULE_OPPOSITE_PAIR) !== 0 ? this._rule4OppositePair(left, right) : null) ??
			((rules & this.RULE_BIG_X) !== 0 ? this._rule5BigX(left, right) : null) ??
			((rules & this.RULE_HARDBLANK) !== 0 ? this._rule6Hardblank(left, right, hardblank) : null)
		);
	}

	/**
	 * Universal smushing used when a font requests smushing without any rule bits enabled.
	 */
	public static _smushUniversal(left: string, right: string, _hardblank: string): string {
		if (left === ' ') {
			return right;
		}

		if (right === ' ') {
			return left;
		}

		return right;
	}

	/**
	 * Attempt to smush two vertically overlapping characters.
	 *
	 * Returns `null` when the two characters cannot be merged in controlled-smush mode.
	 */
	public static _smushVertical(top: string, bottom: string, rules: number): string | null {
		if (top === ' ') {
			return bottom;
		}

		if (bottom === ' ') {
			return top;
		}

		if (rules === 0) {
			return this._smushUniversal(top, bottom, ' ');
		}

		return (
			((rules & this.VERTICAL_RULE_EQUAL_CHARACTER) !== 0 ? this._rule1EqualCharacter(top, bottom, ' ') : null) ??
			((rules & this.VERTICAL_RULE_UNDERSCORE) !== 0 ? this._rule2Underscore(top, bottom) : null) ??
			((rules & this.VERTICAL_RULE_HIERARCHY) !== 0 ? this._rule3Hierarchy(top, bottom) : null) ??
			((rules & this.VERTICAL_RULE_HORIZONTAL_LINE) !== 0
				? this._verticalRule4HorizontalLine(top, bottom)
				: null) ??
			((rules & this.VERTICAL_RULE_VERTICAL_LINE_SUPERSMUSH) !== 0
				? this._verticalRule5VerticalLineSupersmush(top, bottom)
				: null)
		);
	}

	public static _rule1EqualCharacter(left: string, right: string, hardblank: string): string | null {
		if (left === right && left !== hardblank) {
			return left;
		}

		return null;
	}

	public static _rule2Underscore(left: string, right: string): string | null {
		const replacementChars = '|/\\[]{}()<>';

		if (left === '_' && replacementChars.includes(right)) {
			return right;
		}

		if (right === '_' && replacementChars.includes(left)) {
			return left;
		}

		return null;
	}

	public static _rule3Hierarchy(left: string, right: string): string | null {
		const hierarchy = ['|', '/\\', '[]', '{}', '()', '<>'];
		const leftIndex = hierarchy.findIndex((group) => group.includes(left));
		const rightIndex = hierarchy.findIndex((group) => group.includes(right));

		if (leftIndex === -1 || rightIndex === -1 || leftIndex === rightIndex) {
			return null;
		}

		return leftIndex > rightIndex ? left : right;
	}

	public static _rule4OppositePair(left: string, right: string): string | null {
		const pair = `${left}${right}`;
		return ['[]', '][', '{}', '}{', '()', ')('].includes(pair) ? '|' : null;
	}

	public static _rule5BigX(left: string, right: string): string | null {
		const pair = `${left}${right}`;

		if (pair === '/\\') {
			return '|';
		}

		if (pair === '\\/') {
			return 'Y';
		}

		if (pair === '><') {
			return 'X';
		}

		return null;
	}

	public static _rule6Hardblank(left: string, right: string, hardblank: string): string | null {
		return left === hardblank && right === hardblank ? hardblank : null;
	}

	public static _verticalRule4HorizontalLine(top: string, bottom: string): string | null {
		const pair = `${top}${bottom}`;
		return pair === '-_' || pair === '_-' ? '=' : null;
	}

	public static _verticalRule5VerticalLineSupersmush(top: string, bottom: string): string | null {
		return top === '|' && bottom === '|' ? '|' : null;
	}
}

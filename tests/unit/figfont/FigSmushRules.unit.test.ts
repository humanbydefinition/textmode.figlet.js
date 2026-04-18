import { describe, expect, it } from 'vitest';

import { FigSmushRules } from '../../../src/figfont';

describe('FigSmushRules unit', () => {
	it('supports universal smushing when no rule bits are enabled', () => {
		expect(FigSmushRules._smushHorizontal(' ', 'A', '$', 0)).toBe('A');
		expect(FigSmushRules._smushHorizontal('A', ' ', '$', 0)).toBe('A');
		expect(FigSmushRules._smushHorizontal('A', 'B', '$', 0)).toBe('B');
	});

	it('applies the equal-character rule', () => {
		expect(FigSmushRules._smushHorizontal('|', '|', '$', FigSmushRules.RULE_EQUAL_CHARACTER)).toBe('|');
		expect(FigSmushRules._smushHorizontal('$', '$', '$', FigSmushRules.RULE_EQUAL_CHARACTER)).toBeNull();
	});

	it('applies the underscore rule', () => {
		expect(FigSmushRules._smushHorizontal('_', ']', '$', FigSmushRules.RULE_UNDERSCORE)).toBe(']');
		expect(FigSmushRules._smushHorizontal('/', '_', '$', FigSmushRules.RULE_UNDERSCORE)).toBe('/');
	});

	it('applies the hierarchy rule', () => {
		expect(FigSmushRules._smushHorizontal('|', ']', '$', FigSmushRules.RULE_HIERARCHY)).toBe(']');
		expect(FigSmushRules._smushHorizontal('}', '/', '$', FigSmushRules.RULE_HIERARCHY)).toBe('}');
		expect(FigSmushRules._smushHorizontal('[', ']', '$', FigSmushRules.RULE_HIERARCHY)).toBeNull();
	});

	it('applies the opposite-pair rule', () => {
		expect(FigSmushRules._smushHorizontal('[', ']', '$', FigSmushRules.RULE_OPPOSITE_PAIR)).toBe('|');
		expect(FigSmushRules._smushHorizontal('}', '{', '$', FigSmushRules.RULE_OPPOSITE_PAIR)).toBe('|');
	});

	it('applies the big-x rule', () => {
		expect(FigSmushRules._smushHorizontal('/', '\\', '$', FigSmushRules.RULE_BIG_X)).toBe('|');
		expect(FigSmushRules._smushHorizontal('\\', '/', '$', FigSmushRules.RULE_BIG_X)).toBe('Y');
		expect(FigSmushRules._smushHorizontal('>', '<', '$', FigSmushRules.RULE_BIG_X)).toBe('X');
	});

	it('applies the hardblank rule', () => {
		expect(FigSmushRules._smushHorizontal('$', '$', '$', FigSmushRules.RULE_HARDBLANK)).toBe('$');
		expect(FigSmushRules._smushHorizontal('$', 'A', '$', FigSmushRules.RULE_HARDBLANK)).toBeNull();
	});

	it('supports universal vertical smushing when no rule bits are enabled', () => {
		expect(FigSmushRules._smushVertical(' ', 'A', 0)).toBe('A');
		expect(FigSmushRules._smushVertical('A', ' ', 0)).toBe('A');
		expect(FigSmushRules._smushVertical('A', 'B', 0)).toBe('B');
	});

	it('applies the vertical horizontal-line rule', () => {
		expect(FigSmushRules._smushVertical('-', '_', FigSmushRules.VERTICAL_RULE_HORIZONTAL_LINE)).toBe('=');
		expect(FigSmushRules._smushVertical('_', '-', FigSmushRules.VERTICAL_RULE_HORIZONTAL_LINE)).toBe('=');
	});

	it('applies the vertical supersmush rule for stacked bars', () => {
		expect(FigSmushRules._smushVertical('|', '|', FigSmushRules.VERTICAL_RULE_VERTICAL_LINE_SUPERSMUSH)).toBe('|');
		expect(FigSmushRules._smushVertical('|', '/', FigSmushRules.VERTICAL_RULE_VERTICAL_LINE_SUPERSMUSH)).toBeNull();
	});
});

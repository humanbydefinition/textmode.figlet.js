import type { color, Textmodifier } from 'textmode.js';
import { vi } from 'vitest';

import { RenderState } from './RenderState';

// This harness intentionally models only the narrow Textmodifier surface used by
// the plugin's integration tests.

type TestFont = {
	characters: Array<{ character: string }>;
	_getCharacterColor: ReturnType<typeof vi.fn<(char: string) => [number, number, number]>>;
};

type TextmodeColor = color.TextmodeColor;

export class MockRenderer {
	public state = new RenderState();
	public draws: Array<{
		char: string;
		charColor: [number, number, number, number];
		cellColor: [number, number, number, number];
	}> = [];

	public _rect = vi.fn((_width: number, _height: number) => {
		this.draws.push({
			char: this.state._character._currentCharacterString,
			charColor: [...this.state._character._currentCharColor] as [number, number, number, number],
			cellColor: [...this.state._character._currentCellColor] as [number, number, number, number],
		});
	});
}

export type TextmodifierHarness = Textmodifier & {
	_renderer: MockRenderer;
	font: TestFont;
	push: () => void;
	pop: () => void;
	translate: (x?: number, y?: number, z?: number) => void;
	char: (value?: string | number) => string | void;
	charColor: (value: string | TextmodeColor | number, g?: number, b?: number, a?: number) => void;
	cellColor: (value: string | TextmodeColor | number, g?: number, b?: number, a?: number) => void;
	point: (x?: number, y?: number, z?: number) => void;
};

function normalizeChannel(value: number): number {
	return value > 1 ? value / 255 : value;
}

function parseHexColor(value: string): [number, number, number, number] {
	const normalized = value.startsWith('#') ? value.slice(1) : value;

	if (normalized.length !== 6 && normalized.length !== 8) {
		throw new Error(`Unsupported color string: ${value}`);
	}

	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);
	const a = normalized.length === 8 ? parseInt(normalized.slice(6, 8), 16) : 255;

	return [r, g, b, a];
}

function resolveColorChannels(
	value: string | TextmodeColor | number,
	g?: number,
	b?: number,
	a?: number
): [number, number, number, number] {
	if (typeof value === 'string') {
		const [r, green, blue, alpha] = parseHexColor(value);
		return [normalizeChannel(r), normalizeChannel(green), normalizeChannel(blue), normalizeChannel(alpha)];
	}

	if (typeof value === 'number') {
		return [
			normalizeChannel(value),
			normalizeChannel(g ?? value),
			normalizeChannel(b ?? value),
			normalizeChannel(a ?? 255),
		];
	}

	return [normalizeChannel(value.r), normalizeChannel(value.g), normalizeChannel(value.b), normalizeChannel(value.a)];
}

export function createTextmodifierHarness(): TextmodifierHarness {
	const renderer = new MockRenderer();
	const font: TestFont = {
		characters: Array.from({ length: 256 }, (_, index) => ({ character: String.fromCharCode(index) })),
		_getCharacterColor: vi.fn().mockImplementation((char: string) => [char.charCodeAt(0), 0, 0]),
	};

	return {
		_renderer: renderer,
		font,
		push() {
			renderer.state._push();
		},
		pop() {
			renderer.state._pop();
		},
		translate(x: number = 0, y: number = 0, z: number = 0) {
			renderer.state._transform._translate(x, y, z);
		},
		char(value?: string | number) {
			if (value === undefined) {
				return renderer.state._character._currentCharacterString;
			}

			const charString = typeof value === 'number' ? (font.characters[value]?.character ?? '') : value;
			renderer.state._character._setCharacter(font._getCharacterColor(charString));
			renderer.state._character._setCharacterString(charString);
		},
		charColor(value: string | TextmodeColor | number, g?: number, b?: number, a?: number) {
			const [r, green, blue, alpha] = resolveColorChannels(value, g, b, a);
			renderer.state._character._setCharColor(r, green, blue, alpha);
		},
		cellColor(value: string | TextmodeColor | number, g?: number, b?: number, a?: number) {
			const [r, green, blue, alpha] = resolveColorChannels(value, g, b, a);
			renderer.state._character._setCellColor(r, green, blue, alpha);
		},
		point(_x?: number, _y?: number, _z?: number) {
			renderer._rect(1, 1);
		},
	} as TextmodifierHarness;
}

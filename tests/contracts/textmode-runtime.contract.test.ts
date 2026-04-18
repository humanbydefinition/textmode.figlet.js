import { describe, expect, it } from 'vitest';

import { Textmodifier } from 'textmode.js';

// These tests protect behaviors that must match the real textmode.js runtime,
// even when fast integration tests use a smaller local harness.

type RuntimeCharacterState = {
	Ar: [number, number, number, number];
	br: [number, number, number, number];
	wr: string;
	jr: (r: number, g: number, b: number, a: number) => void;
	Br: (r: number, g: number, b: number, a: number) => void;
	Hr: (rgb: [number, number, number]) => void;
	Ir: (character: string) => void;
};

type RuntimeHarness = Textmodifier & {
	q: {
		state: {
			kr: RuntimeCharacterState;
		};
	};
	font: {
		characters: Array<{ character: string }>;
		Gt: (character: string) => [number, number, number];
	};
};

function createRuntimeHarness(): RuntimeHarness {
	const characterState: RuntimeCharacterState = {
		Ar: [0, 0, 0, 1],
		br: [0, 0, 0, 0],
		wr: '',
		jr(r, g, b, a) {
			this.Ar = [r / 255, g / 255, b / 255, a / 255];
		},
		Br(r, g, b, a) {
			this.br = [r / 255, g / 255, b / 255, a / 255];
		},
		Hr(rgb) {
			this.Ar = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1];
		},
		Ir(character) {
			this.wr = character;
		},
	};

	const textmodifier = Object.create(Textmodifier.prototype) as RuntimeHarness;
	textmodifier.q = {
		state: {
			kr: characterState,
		},
	};
	Object.defineProperty(textmodifier, 'font', {
		value: {
			characters: Array.from({ length: 256 }, (_, index) => ({ character: String.fromCharCode(index) })),
			Gt: (character: string) => [character.charCodeAt(0), 0, 0],
		},
		configurable: true,
	});

	return textmodifier;
}

describe('textmode.js runtime contract', () => {
	it('char() replaces the active character color with the font-mapped color', () => {
		const textmodifier = createRuntimeHarness();

		textmodifier.charColor('#ff0000');
		textmodifier.char('A');

		expect(textmodifier.charColor()).toMatchObject({
			r: 65,
			g: 0,
			b: 0,
			a: 255,
		});
	});

	it('cellColor() survives char() calls while post-char charColor() overrides win', () => {
		const textmodifier = createRuntimeHarness();

		textmodifier.cellColor('#112233');
		textmodifier.char('A');
		textmodifier.charColor('#ff0000');

		expect(textmodifier.cellColor()).toMatchObject({
			r: 0x11,
			g: 0x22,
			b: 0x33,
			a: 255,
		});
		expect(textmodifier.charColor()).toMatchObject({
			r: 255,
			g: 0,
			b: 0,
			a: 255,
		});
	});
});

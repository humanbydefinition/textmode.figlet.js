function normalizeChannel(value: number): number {
	return value > 1 ? value / 255 : value;
}

type Snapshot = {
	translationX: number;
	translationY: number;
	translationZ: number;
	characterString: string;
	charColor: [number, number, number, number];
	cellColor: [number, number, number, number];
};

export class RenderState {
	public _translationX = 0;
	public _translationY = 0;
	public _translationZ = 0;

	private _stack: Snapshot[] = [];

	public _character = {
		_currentCharacterString: '',
		_currentCharColor: [0, 0, 0, 1] as [number, number, number, number],
		_currentCellColor: [0, 0, 0, 0] as [number, number, number, number],
		_setCharacter: (rgb: [number, number, number]) => {
			this._character._currentCharColor = [
				normalizeChannel(rgb[0]),
				normalizeChannel(rgb[1]),
				normalizeChannel(rgb[2]),
				1,
			];
		},
		_setCharacterString: (character: string) => {
			this._character._currentCharacterString = character;
		},
		_setCharColor: (r: number, g: number = r, b: number = r, a: number = 1) => {
			this._character._currentCharColor = [r, g, b, a];
		},
		_setCellColor: (r: number, g: number = r, b: number = r, a: number = 1) => {
			this._character._currentCellColor = [r, g, b, a];
		},
	};

	public _transform = {
		_translate: (x: number, y: number, z: number) => {
			this._translationX += x;
			this._translationY += y;
			this._translationZ += z;
		},
	};

	public _push(): void {
		this._stack.push({
			translationX: this._translationX,
			translationY: this._translationY,
			translationZ: this._translationZ,
			characterString: this._character._currentCharacterString,
			charColor: [...this._character._currentCharColor] as [number, number, number, number],
			cellColor: [...this._character._currentCellColor] as [number, number, number, number],
		});
	}

	public _pop(): void {
		const snapshot = this._stack.pop();
		if (!snapshot) {
			return;
		}

		this._translationX = snapshot.translationX;
		this._translationY = snapshot.translationY;
		this._translationZ = snapshot.translationZ;
		this._character._currentCharacterString = snapshot.characterString;
		this._character._currentCharColor = snapshot.charColor;
		this._character._currentCellColor = snapshot.cellColor;
	}

	public _copyTo(target: RenderState): void {
		target._translationX = this._translationX;
		target._translationY = this._translationY;
		target._translationZ = this._translationZ;
		target._character._currentCharacterString = this._character._currentCharacterString;
		target._character._currentCharColor = [...this._character._currentCharColor] as [
			number,
			number,
			number,
			number,
		];
		target._character._currentCellColor = [...this._character._currentCellColor] as [
			number,
			number,
			number,
			number,
		];
	}

	public static _createStateObject(): RenderState {
		return new RenderState();
	}
}

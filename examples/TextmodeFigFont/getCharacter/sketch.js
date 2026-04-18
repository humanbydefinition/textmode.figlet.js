/**
 * @title TextmodeFigFont.getCharacter
 * @author codex
 */
const { textmode, FigletPlugin } = window;

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	frameRate: 60,
	plugins: [FigletPlugin],
});

let font;
let figCharacter;
let previewLines = [];

function writeLabel(text, y, color = [220, 220, 220]) {
	const startX = -Math.floor(text.length / 2);
	t.charColor(...color);

	for (let i = 0; i < text.length; i++) {
		t.push();
		t.translate(startX + i, y);
		t.char(text[i]);
		t.point();
		t.pop();
	}
}

function drawLines(lines, originX, originY, color = [124, 214, 255]) {
	t.charColor(...color);

	for (let row = 0; row < lines.length; row++) {
		for (let col = 0; col < lines[row].length; col++) {
			const cell = lines[row][col];
			if (cell === ' ') {
				continue;
			}

			t.push();
			t.translate(originX + col, originY + row);
			t.char(cell);
			t.point();
			t.pop();
		}
	}
}

t.setup(async () => {
	font = await t.loadFigFont(window.FigletExampleFonts.bulbhead);
	figCharacter = font.getCharacter('A');
	previewLines = (figCharacter?.lines ?? []).map((line) => line.replaceAll(font.hardblank, ' '));
});

t.draw(() => {
	t.background(10, 9, 18);

	if (!font || !figCharacter) {
		writeLabel('resolving FIGcharacter metadata with getCharacter()', 0, [255, 214, 102]);
		return;
	}

	writeLabel('TextmodeFigFont.getCharacter', -10, [255, 214, 102]);
	drawLines(previewLines, -Math.floor(figCharacter.width / 2), -4, [124, 214, 255]);
	writeLabel(`glyph: ${String.fromCodePoint(figCharacter.code)} (${figCharacter.code})`, 6, [220, 230, 255]);
	writeLabel(`width: ${figCharacter.width} | rows: ${figCharacter.lines.length}`, 9, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

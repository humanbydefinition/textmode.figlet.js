/**
 * @title Textmodifier.parseFigFont
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
let rendered;

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

function drawGrid(grid, originX, originY, color = [255, 120, 150]) {
	t.charColor(...color);

	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < grid[row].length; col++) {
			const cell = grid[row][col];
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
	const response = await fetch(window.FigletExampleFonts.bulbhead);
	const data = await response.text();
	font = t.parseFigFont('Bulbhead copy', data);
	t.figFont(font);
	rendered = font.renderText('PARSE');
});

t.draw(() => {
	t.background(8, 10, 18);

	if (!font || !rendered) {
		writeLabel('parsing raw FIGfont text with t.parseFigFont()', 0, [255, 214, 102]);
		return;
	}

	writeLabel('Textmodifier.parseFigFont', -10, [255, 214, 102]);
	drawGrid(rendered.grid, -Math.floor(rendered.cols / 2), -4);
	writeLabel(`parsed: ${font.name}`, 7, [220, 230, 255]);
	writeLabel(`characters: ${font.characters.size}`, 10, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

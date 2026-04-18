/**
 * @title TextmodeFigFont.name
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

function drawGrid(grid, originX, originY, color = [124, 214, 255]) {
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
	font = await t.loadFigFont(window.FigletExampleFonts.bulbhead);
	rendered = font.renderText(font.name.toUpperCase());
});

t.draw(() => {
	t.background(8, 10, 16);

	if (!font || !rendered) {
		writeLabel('loading font name metadata...', 0, [255, 214, 102]);
		return;
	}

	writeLabel('TextmodeFigFont.name', -12, [255, 214, 102]);
	drawGrid(rendered.grid, -Math.floor(rendered.cols / 2), -6);
	writeLabel(`font.name -> ${font.name}`, 9, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

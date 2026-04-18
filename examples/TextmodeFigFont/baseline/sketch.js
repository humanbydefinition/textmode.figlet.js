/**
 * @title TextmodeFigFont.baseline
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

function drawBaseline(originX, originY, cols, baseline) {
	t.charColor(255, 120, 150);
	t.char('-');

	for (let col = 0; col < cols; col++) {
		t.push();
		t.translate(originX + col, originY + baseline);
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont(window.FigletExampleFonts.colossal);
	rendered = font.renderText('BASE');
});

t.draw(() => {
	t.background(7, 10, 18);

	if (!font || !rendered) {
		writeLabel('loading baseline metadata...', 0, [255, 214, 102]);
		return;
	}

	const originX = -Math.floor(rendered.cols / 2);
	const originY = -7;

	writeLabel('TextmodeFigFont.baseline', -13, [255, 214, 102]);
	drawBaseline(originX, originY, rendered.cols, font.baseline);
	drawGrid(rendered.grid, originX, originY);
	writeLabel(`font.baseline -> row ${font.baseline}`, 10, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

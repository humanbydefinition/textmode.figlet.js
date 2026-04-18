/**
 * @title TextmodeFigFont.renderText
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

function drawGrid(grid, originX, originY) {
	for (let row = 0; row < grid.length; row++) {
		const wave = Math.sin(t.frameCount * 0.07 + row * 0.45) * 0.5 + 0.5;
		t.charColor(110 + wave * 145, 170 + row * 8, 255);

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
	font = await t.loadFigFont(window.FigletExampleFonts.isometric1);
	rendered = font.renderText('GRID\nAPI');
});

t.draw(() => {
	t.background(8, 10, 20);

	if (!font || !rendered) {
		writeLabel('rendering a character grid with renderText()', 0, [255, 214, 102]);
		return;
	}

	writeLabel('TextmodeFigFont.renderText', -12, [255, 214, 102]);
	drawGrid(rendered.grid, -Math.floor(rendered.cols / 2), -7);
	writeLabel(`rendered grid: ${rendered.cols} cols × ${rendered.rows} rows`, 8, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

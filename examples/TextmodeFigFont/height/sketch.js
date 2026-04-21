/**
 * @title TextmodeFigFont.height
 * @author codex
 */
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

function drawRuler(x, y, height) {
	t.charColor(255, 120, 150);
	t.char('|');

	for (let row = 0; row < height; row++) {
		t.push();
		t.translate(x, y + row);
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Colossal.flf');
	rendered = font.renderText('HI');
});

t.draw(() => {
	t.background(8, 10, 18);

	if (!font || !rendered) {
		writeLabel('loading font height...', 0, [255, 214, 102]);
		return;
	}

	const originX = -Math.floor(rendered.cols / 2);
	const originY = -6;

	writeLabel('TextmodeFigFont.height', -12, [255, 214, 102]);
	drawRuler(originX - 2, originY, font.height);
	drawGrid(rendered.grid, originX, originY);
	writeLabel(`font.height -> ${font.height} rows`, 9, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

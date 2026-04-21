/**
 * @title TextmodeFigFont.hardblank
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

function drawGrid(grid, originX, originY, color = [255, 214, 102]) {
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
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	rendered = font.renderText('A B');
});

t.draw(() => {
	t.background(9, 10, 18);

	if (!font || !rendered) {
		writeLabel('loading hardblank metadata...', 0, [255, 214, 102]);
		return;
	}

	const codePoint = font.hardblank.codePointAt(0);

	writeLabel('TextmodeFigFont.hardblank', -12, [255, 214, 102]);
	drawGrid(rendered.grid, -Math.floor(rendered.cols / 2), -6, [124, 214, 255]);
	writeLabel(`font.hardblank -> "${font.hardblank}"`, 8, [220, 230, 255]);
	writeLabel(`code point: ${codePoint}`, 11, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

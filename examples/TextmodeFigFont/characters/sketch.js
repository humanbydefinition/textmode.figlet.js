/**
 * @title TextmodeFigFont.characters
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

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	rendered = font.renderText('ABC');
});

t.draw(() => {
	t.background(8, 10, 16);

	if (!font || !rendered) {
		writeLabel('loading character map...', 0, [255, 214, 102]);
		return;
	}

	const previewCodes = [32, 33, 34, 35, 36].filter((code) => font.characters.has(code)).join(', ');

	writeLabel('TextmodeFigFont.characters', -12, [255, 214, 102]);
	drawGrid(rendered.grid, -Math.floor(rendered.cols / 2), -6);
	writeLabel(`font.characters.size -> ${font.characters.size}`, 8, [220, 230, 255]);
	writeLabel(`first codes: ${previewCodes}`, 11, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

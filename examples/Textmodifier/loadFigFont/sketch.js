/**
 * @title Textmodifier.loadFigFont
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
	t.figFont(font);
	rendered = font.renderText('LOAD');
});

t.draw(() => {
	t.background(8, 10, 16);

	if (!font || !rendered) {
		writeLabel('loading a FIGfont with t.loadFigFont()', 0, [255, 214, 102]);
		return;
	}

	writeLabel('Textmodifier.loadFigFont', -10, [255, 214, 102]);
	drawGrid(rendered.grid, -Math.floor(rendered.cols / 2), -4);
	writeLabel(`loaded: ${font.name}`, 7, [220, 230, 255]);
	writeLabel(`active font: ${t.figFont()?.name ?? 'none'}`, 10, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

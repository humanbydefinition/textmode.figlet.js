/**
 * @title TextmodeFigFont.height
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let font;
let rendered;
function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	rendered = font.renderText('HEIGHT');
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.HEIGHT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FONT HEIGHT PROPERTY', [140, 210, 255]],
		['Defines vertical lines per character.', [140, 160, 190]],
		['Ensures consistent row-height bounds.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Height: ${Math.round(font.height)} cells` : 'Loading...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 18);
	if (!font || !rendered) return;

	const startX = -Math.floor(rendered.cols / 2) + 2;
	const startY = -Math.floor(rendered.rows / 2);
	const time = t.secs * 1.5;

	// Draw faint background grid bounding box
	t.push();
	t.charColor(30, 40, 60);
	for (let r = 0; r < font.height; r++) {
		for (let c = 0; c < rendered.cols; c++) {
			t.print('.', startX + c, startY + r);
		}
	}
	t.pop();

	// Draw rendered text with vertical color waves
	for (let row = 0; row < rendered.grid.length; row++) {
		for (let col = 0; col < rendered.grid[row].length; col++) {
			const char = rendered.grid[row][col];
			if (char === ' ') continue;

			const wave = 0.5 + 0.5 * Math.sin(time + row * 0.4);
			t.push();
			t.translate(startX + col, startY + row);
			t.charColor(Math.round(100 + 155 * wave), Math.round(200 + 55 * (1.0 - wave)), 255);
			t.char(char);
			t.point();
			t.pop();
		}
	}

	// Draw vertical height ruler
	t.push();
	const rulerX = startX - 4;
	for (let r = 0; r < font.height; r++) {
		const active = Math.floor(time * 3) % font.height === r;
		t.charColor(active ? 255 : 100, active ? 100 : 120, active ? 100 : 150);
		t.print(`${r + 1}`, rulerX, startY + r);
		t.print('>', rulerX + 2, startY + r);
	}
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

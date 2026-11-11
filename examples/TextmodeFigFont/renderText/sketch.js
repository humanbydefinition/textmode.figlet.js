/**
 * @title TextmodeFigFont.renderText
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const layout = { horizontalLayout: 'fitted' };
let font,
	rendered,
	filledCells = 0;
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
	rendered = font.renderText('GRID', layout);
	filledCells = rendered.grid.flat().filter((char) => char !== ' ').length;
});
t.draw(() => t.background(12, 16, 30));
sceneLayer.draw(() => {
	if (!rendered) return;
	t.clear();
	t.cellColor(0, 0, 0, 0);
	const startCol = -Math.floor(rendered.cols / 2);
	const startRow = -1;
	const time = t.secs * 1.8;
	// Blank cells stay in the grid. Dots make that rectangular raster visible.
	for (let row = 0; row < rendered.rows; row++) {
		for (let col = 0; col < rendered.cols; col++) {
			const char = rendered.grid[row][col];
			const pulse = 0.7 + 0.3 * Math.sin(time + col * 0.14 + row * 0.3);
			t.push();
			t.translate(startCol + col, startRow + row);
			t.char(char === ' ' ? '.' : char);
			t.charColor(
				...(char === ' ' ? [28, 42, 66] : [Math.round(255 * pulse), Math.round(140 + 80 * pulse), 210])
			);
			t.point();
			t.pop();
		}
	}

	const left = startCol - 1;
	const right = startCol + rendered.cols;
	const top = startRow - 1;
	const bottom = startRow + rendered.rows;
	t.push();
	t.printAlign('left', 'top');
	t.charColor(110, 150, 210);
	for (let col = left; col <= right; col++) {
		const edge = col === left || col === right ? '+' : '-';
		t.print(edge, col, top);
		t.print(edge, col, bottom);
	}
	for (let row = top + 1; row < bottom; row++) {
		t.print('|', left, row);
		t.print('|', right, row);
	}
	t.pop();
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.RENDERTEXT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: RENDERED 2D GRID', [140, 210, 255]],
		['renderText() returns a string grid.', [140, 160, 190]],
		['Dots show its blank grid cells.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Grid: ${rendered ? rendered.cols : 0} x ${rendered ? rendered.rows : 0} cells`, [140, 255, 200]],
		[`Filled: ${filledCells} of ${rendered ? rendered.cols * rendered.rows : 0} cells`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

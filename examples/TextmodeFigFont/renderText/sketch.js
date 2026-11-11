/**
 * @title TextmodeFigFont.renderText
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [FigletPlugin],
});

const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const layout = { horizontalLayout: 'fitted' };
let font,
	rendered,
	filledCells = 0;
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
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	const x = left + 3;
	let y = top + 3;

	// Opaque HUD panel, two cells in from the top and left edges.
	t.push();
	t.printAlign('left', 'top');
	t.cellColor(6, 10, 22);
	for (let i = 0; i < 380; i++) t.print(' ', left + 2 + (i % 38), top + 2 + Math.floor(i / 38));
	t.charColor(120, 240, 180);
	t.print('TEXTMODEFIGFONT.RENDERTEXT', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RENDERED 2D GRID', x, y++);
	t.charColor(140, 160, 190);
	t.print('renderText() returns a string grid.', x, y++);
	t.print('Dots show its blank grid cells.', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 255, 200);
	t.print(`Grid: ${rendered ? rendered.cols : 0} x ${rendered ? rendered.rows : 0} cells`, x, y++);
	t.print(`Filled: ${filledCells} of ${rendered ? rendered.cols * rendered.rows : 0} cells`, x, y++);
	t.pop();
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	sceneLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
	labelLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
});

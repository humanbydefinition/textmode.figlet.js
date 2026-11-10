/**
 * @title Textmodifier.figTextBounds
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
const words = ['FIG', 'FONT', 'BOUNDS'];

let font,
	current = { text: 'FIG', cols: 0, rows: 0 };
t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextAlign('left');
	t.figTextBaseline('top');
});
t.draw(() => t.background(12, 16, 30));

sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	const text = words[Math.floor(t.secs / 3) % words.length];
	const size = t.figTextBounds(text, layout);
	current = { text, cols: size.cols, rows: size.rows };

	const startCol = -Math.floor(size.cols / 2);
	const startRow = -1;
	t.figText(text, startCol, startRow, {
		...layout,
		cellColor: [0, 0, 0, 0],
		charColor: (cell) => {
			const pulse = 0.7 + 0.3 * Math.sin(t.secs * 1.8 + cell.col * 0.16 + cell.row * 0.4);
			return [Math.round(255 * pulse), Math.round(150 + 80 * pulse), Math.round(220 - 60 * pulse)];
		},
	});

	// The frame sits exactly one cell outside the measured bounds.
	const left = startCol - 1;
	const right = startCol + size.cols;
	const top = startRow - 1;
	const bottom = startRow + size.rows;
	t.push();
	t.printAlign('left', 'top');
	t.charColor(Math.round(140 * (0.65 + 0.35 * Math.sin(t.secs * 1.44))), 180, 240);
	for (let col = left; col <= right; col++) {
		const edge = col === left || col === right ? '+' : '-';
		t.print(edge, col, top);
		t.print(edge, col, bottom);
	}
	for (let row = top + 1; row < bottom; row++) {
		t.print('|', left, row);
		t.print('|', right, row);
	}
	t.charColor(140, 255, 200);
	t.printAlign('center', 'top');
	t.print(`${size.cols} cells wide`, 0, bottom + 2);
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
	t.print('TEXTMODIFIER.FIGTEXTBOUNDS', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: MEASURE BEFORE DRAWING', x, y++);
	t.charColor(140, 160, 190);
	t.print('figTextBounds() gives cols and rows.', x, y++);
	t.print('Frame it with a one-cell margin.', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 255, 200);
	t.print(`Text: ${current.text}`, x, y++);
	t.print(`Size: ${current.cols} x ${current.rows} cells`, x, y++);
	t.pop();
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	sceneLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
	labelLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
});

/**
 * @title Textmodifier.figTextBounds
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
const words = ['FIG', 'FONT', 'BOUNDS'];
let font,
	current = { text: 'FIG', cols: 0, rows: 0 };
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
	drawLabel([
		['TEXTMODIFIER.FIGTEXTBOUNDS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: MEASURE BEFORE DRAWING', [140, 210, 255]],
		['figTextBounds() gives cols and rows.', [140, 160, 190]],
		['Frame it with a one-cell margin.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Text: ${current.text}`, [140, 255, 200]],
		[`Size: ${Math.round(current.cols)} x ${Math.round(current.rows)} cells`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

/**
 * @title Textmodifier.figTextHeight
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const fontSize = () => (window.innerWidth < 700 ? 8 : 16);
const sceneLayer = t.layers.add({ fontSize: fontSize() });
const labelLayer = t.layers.add({ fontSize: fontSize() });
const inputs = ['UP', 'UP\nDN'];
const layout = { verticalLayout: 'full' };
let font,
	state = { lines: 1, rows: 4 };
function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.cellColor(6, 10, 22);
	lines.forEach(([text, color], i) => {
		t.charColor(...color);
		t.print(text, left + 3, top + 3 + i);
	});
}
t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('top');
});
t.draw(() => t.background(8, 10, 18));
sceneLayer.draw(() => {
	t.clear();
	if (!font) return;
	const text = inputs[Math.floor(t.secs / 3) % inputs.length];
	const count = text.split('\n').length;
	const rows = t.figTextHeight(text, layout);
	state = { lines: count, rows };
	const top = -Math.floor(rows / 2);
	const band = rows / count;
	// A fixed rail makes the measured stack's growth visible.
	t.charColor(44, 72, 100);
	for (let row = -5; row <= 4; row++) {
		t.print(row === -5 || row === 4 ? '+' : '|', -18, row);
		if (row % 2 === 0) t.print('-', -20, row);
	}
	// One tinted band per input line: the rows returned by figTextHeight().
	for (let line = 0; line < count; line++) {
		t.push();
		t.translate(0, top + line * band + band / 2);
		t.cellColor(...(line === 0 ? [18, 54, 58] : [28, 38, 78]));
		t.rect(26, band);
		t.pop();
	}
	t.push();
	t.translate(0, top + (Math.floor(t.secs * 2.7) % rows));
	t.cellColor(42, 96, 110);
	t.rect(26, 1);
	t.pop();
	t.figText(text, 0, top, {
		...layout,
		charColor: (cell) => (cell.lineIndex === 0 ? [150, 255, 210] : [150, 205, 255]),
		cellColor: (cell) => (cell.lineIndex === 0 ? [18, 54, 58] : [28, 38, 78]),
	});

	// Amber rules bound exactly the rows that figTextHeight() reports.
	t.charColor(255, 200, 80);
	for (let col = -14; col <= 14; col++) t.print(col === -14 || col === 14 ? '+' : '-', col, top - 1);
	for (let col = -14; col <= 14; col++) t.print(col === -14 || col === 14 ? '+' : '-', col, top + rows);
	for (let row = top; row < top + rows; row++) t.print('|', 17, row);
	t.print('+', 17, top);
	t.print('+', 17, top + rows - 1);
	t.charColor(140, 255, 200);
	t.print(`${rows}`, 17, top + Math.floor(rows / 2));
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.FIGTEXTHEIGHT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: VERTICAL STACK GAUGE', [140, 210, 255]],
		['figTextHeight() returns total rows.', [140, 160, 190]],
		['Two input lines double the rows.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`LINES: ${state.lines}  ROWS: ${state.rows}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = fontSize();
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

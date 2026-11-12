/**
 * @title TextmodeFigFont.measureText
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
const words = ['METRIC', 'WIDE', 'I'];
const layout = { horizontalLayout: 'fitted' };
let font,
	state = { word: 'METRIC', cols: 0, rows: 0 };
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
});
t.draw(() => t.background(8, 14, 26));
sceneLayer.draw(() => {
	t.clear();
	if (!font) return;
	const word = words[Math.floor(t.secs / 3.5) % words.length];
	const measured = font.measureText(word, layout);
	state = { word, cols: measured.cols, rows: measured.rows };
	const left = -Math.floor(measured.cols / 2);
	const top = -Math.floor(measured.rows / 2);
	const right = left + measured.cols - 1;
	const bottom = top + measured.rows - 1;

	// A dotted cell envelope marks the measured region. No glyph is drawn.
	t.charColor(74, 138, 176);
	for (let col = left; col <= right; col++) t.print('.', col, top);
	for (let col = left; col <= right; col++) t.print('.', col, bottom);
	for (let row = top + 1; row < bottom; row++) t.print('.', left, row);
	for (let row = top + 1; row < bottom; row++) t.print('.', right, row);
	t.charColor(120, 220, 255);
	t.print('+', left - 1, top - 1);
	t.print('+', right + 1, top - 1);
	t.print('+', left - 1, bottom + 1);
	t.print('+', right + 1, bottom + 1);

	// Dimension arrows annotate the measured width and height.
	t.charColor(255, 200, 80);
	t.print('<', left, top - 2);
	t.print('>', right, top - 2);
	for (let col = left + 1; col < right; col++) t.print('-', col, top - 2);
	t.print(`${measured.cols}`, Math.round((left + right) / 2), top - 3);
	t.print('^', left - 3, top);
	t.print('v', left - 3, bottom);
	for (let row = top + 1; row < bottom; row++) t.print('|', left - 3, row);
	t.print(`${measured.rows}`, left - 5, top + 1);

	// A scan line sweeps the envelope while the measured word stays invisible.
	const phase = (t.secs * 0.45) % 2;
	const scan = left + Math.min(measured.cols - 1, Math.floor((phase > 1 ? 2 - phase : phase) * measured.cols));
	t.push();
	t.translate(scan, top + measured.rows / 2);
	t.cellColor(24, 62, 74);
	t.rect(1, measured.rows);
	t.pop();
	t.charColor(120, 255, 190);
	for (let row = top; row <= bottom; row++) t.print(':', scan, row);
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.MEASURETEXT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: BLUEPRINT MEASUREMENT', [140, 210, 255]],
		['measureText() returns cols and rows', [140, 160, 190]],
		['without drawing a single cell.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`${state.word}: ${state.cols} X ${state.rows} CELLS`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = fontSize();
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

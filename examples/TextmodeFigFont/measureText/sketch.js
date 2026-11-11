/**
 * @title TextmodeFigFont.measureText
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const size = () => (window.innerWidth < 700 ? 8 : 16);
const labelLayer = t.layers.add({ fontSize: size() });

let font;
let dimensions = { cols: 0, rows: 0 };

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.char(' ');
	t.charColor(6, 10, 22);
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
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

labelLayer.draw(() => {
	t.clear();
	const live = font ? `SIZE: ${dimensions.cols}X${dimensions.rows} CELLS` : 'MEASURING TEXT...';
	drawLabel([
		['TEXTMODEFIGFONT.MEASURETEXT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: OFFSCREEN TEXT MEASURE', [140, 210, 255]],
		['Measures size without rendering cells.', [140, 160, 190]],
		['Calculates columns and rows size.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[live, [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 15, 12);

	if (!font) return;

	// Measure text size prior to drawing
	dimensions = font.measureText('MEASURE');

	const time = t.secs * 1.5;

	// Draw FIGlet text
	t.figText('MEASURE', 0, 0);

	// Draw measured frame
	const w = dimensions.cols;
	const h = dimensions.rows;
	const halfW = Math.floor(w / 2);
	const halfH = Math.floor(h / 2);

	t.push();
	t.charColor(255, 200, 100);
	for (let col = -halfW - 2; col <= -halfW + w + 1; col++) {
		const wave = Math.sin(time + col * 0.3);
		const borderChar = wave > 0 ? '=' : '-';
		t.print(borderChar, col, -halfH - 2);
		t.print(borderChar, col, -halfH + h + 1);
	}
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	t.fontSize(size());
	for (const layer of t.layers.all) layer.fontSize(size());
});

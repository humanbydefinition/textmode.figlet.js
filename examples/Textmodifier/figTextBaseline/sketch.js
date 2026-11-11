/**
 * @title Textmodifier.figTextBaseline
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
const modes = [
	{ name: 'TOP', baseline: 'top', col: -21, color: [120, 255, 180] },
	{ name: 'CENTER', baseline: 'center', col: -10, color: [120, 200, 255] },
	{ name: 'BOTTOM', baseline: 'bottom', col: 1, color: [255, 160, 220] },
	{ name: 'BASELINE', baseline: 'baseline', col: 12, color: [255, 220, 120] },
];
let font,
	glyphRows = 0;
function rowOffset(baseline, rows) {
	const fixed = { top: 0, center: -Math.floor(rows / 2), bottom: -(rows - 1) };
	return fixed[baseline] ?? -(font.baseline - 1);
}
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
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Slant.flf');
	t.figFont(font);
	t.figTextAlign('left');
	glyphRows = t.figTextHeight('A', layout);
});
t.draw(() => t.background(12, 16, 30));
sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	t.printAlign('left', 'top');
	// The shared horizontal axis is the row that every baseline mode measures from.
	t.charColor(48, 72, 112);
	for (let col = -24; col <= 24; col++) t.print('-', col, 0);
	t.charColor(100, 180, 255);
	t.print('y = 0', 20, 1);
	for (const mode of modes) {
		const startRow = rowOffset(mode.baseline, glyphRows);
		t.push();
		t.charColor(...mode.color);
		t.figTextBaseline(mode.baseline);
		t.figText('A', mode.col, 0, {
			...layout,
			cellColor: [0, 0, 0, 0],
			charColor: (cell) => {
				const pulse = 0.75 + 0.25 * Math.sin(t.secs * 1.8 + cell.row * 0.3);
				return mode.color.map((value) => Math.round(value * pulse));
			},
		});
		// Bracket the rows the glyph occupies after the selected baseline shift.
		const bracketCol = mode.col - 2;
		t.charColor(90, 120, 160);
		t.print('[', bracketCol, startRow);
		t.print(']', bracketCol, startRow + glyphRows - 1);
		for (let row = startRow + 1; row < startRow + glyphRows - 1; row++) t.print('|', bracketCol, row);
		t.charColor(...mode.color);
		t.print(mode.name, mode.col + 4 - Math.floor(mode.name.length / 2), -4);
		t.pop();
	}
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.FIGTEXTBASELINE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: VERTICAL ALIGNMENT', [140, 210, 255]],
		['Same glyph, same y = 0 anchor.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Font: ${font ? font.name : '...'} (${glyphRows} rows)`, [140, 255, 200]],
		[`Font baseline: row ${font ? Math.round(font.baseline) : '?'}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

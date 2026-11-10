/**
 * @title Textmodifier.figTextBaseline
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
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	const x = left + 3;
	let y = top + 3;
	// Opaque HUD panel, two cells in from the top and left edges.
	t.push();
	t.printAlign('left', 'top');
	t.cellColor(6, 10, 22);
	for (let i = 0; i < 342; i++) t.print(' ', left + 2 + (i % 38), top + 2 + Math.floor(i / 38));
	t.charColor(120, 240, 180);
	t.print('TEXTMODIFIER.FIGTEXTBASELINE', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: VERTICAL ALIGNMENT', x, y++);
	t.charColor(140, 160, 190);
	t.print('Same glyph, same y = 0 anchor.', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 255, 200);
	t.print(`Font: ${font ? font.name : '...'} (${glyphRows} rows)`, x, y++);
	t.print(`Font baseline: row ${font ? font.baseline : '?'}`, x, y++);
	t.pop();
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	sceneLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
	labelLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
});

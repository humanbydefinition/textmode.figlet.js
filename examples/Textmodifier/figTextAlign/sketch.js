/**
 * @title Textmodifier.figTextAlign
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
	{ name: 'LEFT', align: 'left', row: -2, color: [120, 255, 180] },
	{ name: 'CENTER', align: 'center', row: 4, color: [120, 200, 255] },
	{ name: 'RIGHT', align: 'right', row: 10, color: [255, 160, 220] },
];
let font,
	textWidth = 0;

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
	t.figTextBaseline('top');
	textWidth = t.figTextWidth('FIT', layout);
});
t.draw(() => t.background(12, 16, 30));
sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	const bottom = Math.ceil(t.grid.rows / 2) - 1;
	const time = t.secs * 1.8;
	// One shared x = 0 anchor makes the three alignments comparable.
	t.push();
	t.charColor(48, 72, 112);
	for (let row = -3; row <= bottom; row++) t.print('|', 0, row);
	t.pop();
	t.printAlign('left', 'top');
	for (const mode of modes) {
		const start =
			mode.align === 'center' ? -Math.floor(textWidth / 2) : mode.align === 'right' ? -(textWidth - 1) : 0;
		t.push();
		t.charColor(...mode.color);
		t.figTextAlign(mode.align);
		t.figText('FIT', 0, mode.row, {
			...layout,
			cellColor: [0, 0, 0, 0],
			charColor: (cell) => {
				const pulse = 0.75 + 0.25 * Math.sin(time + cell.col * 0.18);
				return mode.color.map((value) => Math.round(value * pulse));
			},
		});
		const rulerRow = mode.row + 5;
		for (let col = start - 1; col <= start + textWidth; col++) {
			const edge = col === start - 1 ? '[' : col === start + textWidth ? ']' : '-';
			t.print(edge, col, rulerRow);
		}
		t.charColor(255, 200, 80);
		t.print('+', 0, rulerRow);
		t.charColor(...mode.color);
		t.print(mode.name, start + textWidth + 2, rulerRow);
		t.pop();
	}
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.FIGTEXTALIGN', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: HORIZONTAL ALIGNMENT', [140, 210, 255]],
		['Same text, same x = 0 anchor.', [140, 160, 190]],
		['Only figTextAlign changes.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`FIT width: ${Math.round(textWidth)} cells`, [140, 255, 200]],
		['Modes: left / center / right', [140, 160, 190]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

/**
 * @title Textmodifier.figTextAlign
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
	{ name: 'LEFT', align: 'left', row: -2, color: [120, 255, 180] },
	{ name: 'CENTER', align: 'center', row: 4, color: [120, 200, 255] },
	{ name: 'RIGHT', align: 'right', row: 10, color: [255, 160, 220] },
];

let font,
	textWidth = 0;
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
	t.print('TEXTMODIFIER.FIGTEXTALIGN', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: HORIZONTAL ALIGNMENT', x, y++);
	t.charColor(140, 160, 190);
	t.print('Same text, same x = 0 anchor.', x, y++);
	t.print('Only figTextAlign changes.', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 255, 200);
	t.print(`FIT width: ${textWidth} cells`, x, y++);
	t.charColor(140, 160, 190);
	t.print('Modes: left / center / right', x, y++);
	t.pop();
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	sceneLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
	labelLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
});

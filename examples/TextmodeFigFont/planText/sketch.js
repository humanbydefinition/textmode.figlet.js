/**
 * @title TextmodeFigFont.planText
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
const sourceColors = {
	F: [120, 255, 180],
	I: [120, 200, 255],
	G: [255, 160, 220],
};
let font, plan;
t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	plan = font.planText('FIG', layout);
});
t.draw(() => t.background(12, 16, 30));
sceneLayer.draw(() => {
	if (!plan) return;
	t.clear();
	t.cellColor(0, 0, 0, 0);
	const startCol = -Math.floor(plan.cols / 2);
	const startRow = -1;
	const time = t.secs * 1.8;
	// planText gives positioned cells plus the source glyph that produced each one.
	for (const cell of plan.cells) {
		const color = sourceColors[cell.inputChar] ?? [220, 230, 255];
		const pulse = 0.7 + 0.3 * Math.sin(time + cell.inputIndex * 0.8 + cell.subRow * 0.2);
		t.push();
		t.translate(startCol + cell.col, startRow + cell.row);
		t.char(cell.char);
		t.charColor(...color.map((value) => Math.round(value * pulse)));
		t.point();
		t.pop();
	}

	const left = startCol - 1;
	const right = startCol + plan.cols;
	const top = startRow - 1;
	const bottom = startRow + plan.rows;
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
	for (let i = 0; i < 342; i++) t.print(' ', left + 2 + (i % 38), top + 2 + Math.floor(i / 38));
	t.charColor(120, 240, 180);
	t.print('TEXTMODEFIGFONT.PLANTEXT', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PLAN BEFORE DRAWING', x, y++);
	t.charColor(140, 160, 190);
	t.print('planText() returns positioned cells.', x, y++);
	t.print('Green F, blue I, pink G.', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 255, 200);
	t.print(
		`Plan: FIG ${plan ? plan.cols : 0} x ${plan ? plan.rows : 0}, ${plan ? plan.cells.length : 0} cells`,
		x,
		y++
	);
	t.pop();
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	sceneLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
	labelLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
});

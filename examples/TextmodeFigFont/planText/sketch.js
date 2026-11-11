/**
 * @title TextmodeFigFont.planText
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
const sourceColors = {
	F: [120, 255, 180],
	I: [120, 200, 255],
	G: [255, 160, 220],
};
let font, plan;

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
	const size = plan ? `${plan.cols}x${plan.rows}, ${plan.cells.length}` : '...';
	drawLabel([
		['TEXTMODEFIGFONT.PLANTEXT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PLAN BEFORE DRAWING', [140, 210, 255]],
		['planText() returns positioned cells.', [140, 160, 190]],
		['Green F, blue I, pink G.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Plan: FIG ${size} cells`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

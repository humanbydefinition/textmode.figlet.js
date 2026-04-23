/**
 * @title TextmodeFigFont.planText
 * @author codex
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	frameRate: 60,
	plugins: [FigletPlugin],
});

let font;
let plan;

const palette = [
	[255, 214, 102],
	[124, 214, 255],
	[255, 120, 150],
];

function writeLabel(text, y, color = [220, 220, 220]) {
	const startX = -Math.floor(text.length / 2);
	t.charColor(...color);

	for (let i = 0; i < text.length; i++) {
		t.push();
		t.translate(startX + i, y);
		t.char(text[i]);
		t.point();
		t.pop();
	}
}

function drawPlan(renderPlan, originX, originY) {
	for (const cell of renderPlan.cells) {
		const color = palette[cell.lineIndex % palette.length];
		t.charColor(...color);
		t.push();
		t.translate(originX + cell.col, originY + cell.row);
		t.char(cell.char);
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	plan = font.planText('PLAN TEXT WRAPS WORDS', {
		maxCols: 58,
		wrap: 'word',
	});
});

t.draw(() => {
	t.background(7, 10, 18);

	if (!font || !plan) {
		writeLabel('planning FIGlet layout with planText()', 0, [255, 214, 102]);
		return;
	}

	writeLabel('TextmodeFigFont.planText', -12, [255, 214, 102]);
	drawPlan(plan, -Math.floor(plan.cols / 2), -6);
	writeLabel(`lines: ${plan.lines.length} | direction: ${plan.direction}`, 8, [220, 230, 255]);
	writeLabel(`bounds: ${plan.cols} cols x ${plan.rows} rows`, 11, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

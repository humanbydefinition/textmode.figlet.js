/**
 * @title TextmodeFigFont.defaultPrintDirection
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

function drawPlan(renderPlan, originX, originY, color = [255, 214, 102]) {
	t.charColor(...color);

	for (const cell of renderPlan.cells) {
		t.push();
		t.translate(originX + cell.col, originY + cell.row);
		t.char(cell.char);
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	plan = font.planText('FLOW', {
		direction: 'font',
	});
});

t.draw(() => {
	t.background(9, 10, 18);

	if (!font || !plan) {
		writeLabel('loading print direction metadata...', 0, [255, 214, 102]);
		return;
	}

	writeLabel('TextmodeFigFont.defaultPrintDirection', -12, [255, 214, 102]);
	drawPlan(plan, -Math.floor(plan.cols / 2), -6, [124, 214, 255]);
	writeLabel(`font.defaultPrintDirection -> ${font.defaultPrintDirection}`, 8, [220, 230, 255]);
	writeLabel(`effective plan.direction -> ${plan.direction}`, 11, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

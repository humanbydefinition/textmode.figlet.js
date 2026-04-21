/**
 * @title Textmodifier.figTextAlign
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

function drawVerticalGuide(col, top, bottom, color = [64, 72, 96]) {
	t.charColor(...color);

	for (let row = top; row <= bottom; row++) {
		t.push();
		t.translate(col, row);
		t.char('|');
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextBaseline('center');
});

t.draw(() => {
	t.background(8, 10, 16);

	if (!font || !t.grid) {
		writeLabel('changing placement with t.figTextAlign()', 0, [255, 214, 102]);
		return;
	}

	const left = -t.grid.cols / 2 + 5;
	const center = 0;
	const right = t.grid.cols / 2 - 5;

	writeLabel('Textmodifier.figTextAlign', -13, [255, 214, 102]);
	drawVerticalGuide(left, -10, 12);
	drawVerticalGuide(center, -10, 12);
	drawVerticalGuide(right, -10, 12);

	t.charColor(255, 120, 150);
	t.figTextAlign('left');
	t.figText('LEFT', left, -6, {
		horizontalLayout: 'fitted',
	});

	t.charColor(255, 214, 102);
	t.figTextAlign('center');
	t.figText('CENTER', center, 1, {
		horizontalLayout: 'fitted',
	});

	t.charColor(124, 214, 255);
	t.figTextAlign('right');
	t.figText('RIGHT', right, 8, {
		horizontalLayout: 'fitted',
	});

	writeLabel(`current align: ${t.figTextAlign()}`, 14, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

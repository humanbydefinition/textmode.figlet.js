/**
 * @title Textmodifier.figTextBaseline
 * @author codex
 */
const { textmode, FigletPlugin } = window;

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

function drawHorizontalGuide(row, left, right, color = [64, 72, 96]) {
	t.charColor(...color);

	for (let col = left; col <= right; col++) {
		t.push();
		t.translate(col, row);
		t.char('-');
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont(window.FigletExampleFonts.bulbhead);
	t.figFont(font);
	t.figTextAlign('center');
});

t.draw(() => {
	t.background(8, 10, 16);

	if (!font || !t.grid) {
		writeLabel('changing vertical anchoring with t.figTextBaseline()', 0, [255, 214, 102]);
		return;
	}

	const left = -t.grid.cols / 2 + 4;
	const right = t.grid.cols / 2 - 4;
	const top = -10;
	const middle = 0;
	const bottom = 10;

	writeLabel('Textmodifier.figTextBaseline', -13, [255, 214, 102]);
	drawHorizontalGuide(top, left, right);
	drawHorizontalGuide(middle, left, right);
	drawHorizontalGuide(bottom, left, right);

	t.charColor(255, 120, 150);
	t.figTextBaseline('top');
	t.figText('TOP', 0, top, {
		horizontalLayout: 'fitted',
	});

	t.charColor(255, 214, 102);
	t.figTextBaseline('center');
	t.figText('MID', 0, middle, {
		horizontalLayout: 'fitted',
	});

	t.charColor(124, 214, 255);
	t.figTextBaseline('bottom');
	t.figText('BOT', 0, bottom, {
		horizontalLayout: 'fitted',
	});

	writeLabel(`current baseline: ${t.figTextBaseline()}`, 14, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

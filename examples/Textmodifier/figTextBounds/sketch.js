/**
 * @title Textmodifier.figTextBounds
 * @author codex
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	frameRate: 60,
	plugins: [FigletPlugin],
});

const sampleText = 'FRAME';
const sampleOptions = {
	horizontalLayout: 'fitted',
};

let font;
let bounds;

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

function drawFrame(cols, rows, originX, originY, color = [255, 120, 150]) {
	t.charColor(...color);

	for (let col = 0; col < cols; col++) {
		for (const row of [0, rows - 1]) {
			t.push();
			t.translate(originX + col, originY + row);
			t.char(col === 0 || col === cols - 1 ? '+' : '-');
			t.point();
			t.pop();
		}
	}

	for (let row = 1; row < rows - 1; row++) {
		for (const col of [0, cols - 1]) {
			t.push();
			t.translate(originX + col, originY + row);
			t.char('|');
			t.point();
			t.pop();
		}
	}
}

t.setup(async () => {
	font = await t.loadFigFont(FigletExampleFonts.bulbhead);
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
	bounds = t.figTextBounds(sampleText, sampleOptions);
});

t.draw(() => {
	t.background(8, 10, 18);

	if (!font || !bounds) {
		writeLabel('measuring width and height with t.figTextBounds()', 0, [255, 214, 102]);
		return;
	}

	const originX = -Math.floor(bounds.cols / 2);
	const originY = -Math.floor(bounds.rows / 2);

	writeLabel('Textmodifier.figTextBounds', -12, [255, 214, 102]);
	drawFrame(bounds.cols, bounds.rows, originX, originY);
	t.charColor(124, 214, 255);
	t.figText(sampleText, 0, 0, sampleOptions);
	writeLabel(`bounds: ${bounds.cols} cols × ${bounds.rows} rows`, 10, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

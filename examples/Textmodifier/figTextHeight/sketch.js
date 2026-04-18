/**
 * @title Textmodifier.figTextHeight
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

const sampleText = 'TALL';
const sampleOptions = {
	horizontalLayout: 'fitted',
};

let font;
let width;
let height;

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

function drawVerticalMeasure(x, originY, rows, color = [255, 120, 150]) {
	t.charColor(...color);

	for (let row = 0; row < rows; row++) {
		t.push();
		t.translate(x, originY + row);
		t.char(row === 0 || row === rows - 1 ? '+' : '|');
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont(window.FigletExampleFonts.bulbhead);
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
	width = t.figTextWidth(sampleText, sampleOptions);
	height = t.figTextHeight(sampleText, sampleOptions);
});

t.draw(() => {
	t.background(8, 10, 18);

	if (!font || width === undefined || height === undefined) {
		writeLabel('measuring rendered height with t.figTextHeight()', 0, [255, 214, 102]);
		return;
	}

	const originX = -Math.floor(width / 2);
	const originY = -Math.floor(height / 2);

	writeLabel('Textmodifier.figTextHeight', -12, [255, 214, 102]);
	drawVerticalMeasure(originX - 3, originY, height);
	t.charColor(124, 214, 255);
	t.figText(sampleText, 0, 0, sampleOptions);
	writeLabel(`height: ${height} rows`, 10, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

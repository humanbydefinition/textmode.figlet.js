/**
 * @title Textmodifier.figTextWidth
 * @author codex
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	frameRate: 60,
	plugins: [FigletPlugin],
});

const sampleText = 'WIDTH';
const sampleOptions = {
	horizontalLayout: 'fitted',
};

let font;
let width;

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

function drawHorizontalMeasure(originX, y, cols, color = [255, 120, 150]) {
	t.charColor(...color);

	for (let col = 0; col < cols; col++) {
		t.push();
		t.translate(originX + col, y);
		t.char(col === 0 || col === cols - 1 ? '+' : '-');
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont(FigletExampleFonts.bulbhead);
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
	width = t.figTextWidth(sampleText, sampleOptions);
});

t.draw(() => {
	t.background(8, 10, 18);

	if (!font || width === undefined) {
		writeLabel('measuring rendered width with t.figTextWidth()', 0, [255, 214, 102]);
		return;
	}

	const originX = -Math.floor(width / 2);

	writeLabel('Textmodifier.figTextWidth', -12, [255, 214, 102]);
	drawHorizontalMeasure(originX, -8, width);
	t.charColor(124, 214, 255);
	t.figText(sampleText, 0, 0, sampleOptions);
	writeLabel(`width: ${width} cols`, 10, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

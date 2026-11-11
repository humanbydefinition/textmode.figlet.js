/**
 * @title Textmodifier.figTextHeight
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font;
let textHeight = 0;

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
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.FIGTEXTHEIGHT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: MEASURING RENDER HEIGHT', [140, 210, 255]],
		['Gets the exact grid height of text.', [140, 160, 190]],
		['Useful for vertical layouts.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Measured height: ${Math.round(textHeight)} cells` : 'Loading font...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 10, 14);

	if (!font) return;

	textHeight = t.figTextHeight('HEIGHT');

	const time = t.secs * 2.0;

	// Draw the FIGlet text
	t.figText('HEIGHT', 0, 0);

	// Draw vertical rulers on the sides
	const halfH = Math.floor(textHeight / 2);
	t.push();
	t.charColor(180, 100, 255);
	for (let i = 0; i < textHeight; i++) {
		// Left ruler at x = -20, right ruler at x = 20
		const yPos = -halfH + i;
		const wave = Math.sin(time + i * 0.4);
		const charToUse = wave > 0 ? '█' : '▒';

		t.push();
		t.translate(-22, yPos);
		t.char(charToUse);
		t.point();
		t.pop();

		t.push();
		t.translate(22, yPos);
		t.char(charToUse);
		t.point();
		t.pop();
	}
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

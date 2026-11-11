/**
 * @title Textmodifier.figTextWidth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font;
let textWidth = 0;

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
		['TEXTMODIFIER.FIGTEXTWIDTH', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: MEASURING RENDER WIDTH', [140, 210, 255]],
		['Gets the exact grid width of text.', [140, 160, 190]],
		['Accounts for horizontal layout modes.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Measured width: ${Math.round(textWidth)} cells` : 'Loading font...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 16);

	if (!font) return;

	const layout = { horizontalLayout: 'fitted' };
	textWidth = t.figTextWidth('WIDTH', layout);

	const time = t.secs * 2.0;

	// Draw the FIGlet text
	t.figText('WIDTH', 0, -2, layout);

	// Draw a dynamic horizontal ruler matching the measured width
	const startX = -Math.floor(textWidth / 2);
	t.push();
	t.charColor(100, 255, 180);
	for (let i = 0; i < textWidth; i++) {
		t.push();
		t.translate(startX + i, 3);
		// Animate ruler characters
		const wave = Math.sin(time + i * 0.4);
		t.char(wave > 0 ? '█' : '▓');
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

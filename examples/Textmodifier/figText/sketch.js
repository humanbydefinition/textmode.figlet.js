/**
 * @title Textmodifier.figText
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font;

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
		['TEXTMODIFIER.FIGTEXT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: RENDERING FIGLET TEXT', [140, 210, 255]],
		['Draws stylized text using active font.', [140, 160, 190]],
		['Supports dynamic colors per cell.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? 'Orbiting "TEXT" layout animation' : 'Loading font...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(14, 10, 16);

	if (!font) return;

	const time = t.secs * 1.5;
	const ox = Math.floor(Math.cos(time) * 6);
	const oy = Math.floor(Math.sin(time) * 3);

	t.figText('TEXT', ox, oy, {
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const wave = 0.5 + 0.5 * Math.sin(time * 2.0 + cell.col * 0.1);
			return [Math.round(255 * wave), Math.round(180 * (1.0 - wave)), 255];
		},
	});
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

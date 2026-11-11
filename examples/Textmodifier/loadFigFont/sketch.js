/**
 * @title Textmodifier.loadFigFont
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font;
let bounds;

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
	bounds = t.figTextBounds('LOAD', { horizontalLayout: 'fitted' });
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.LOADFIGFONT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: DYNAMIC FONT LOADING', [140, 210, 255]],
		['Loads any standard FIGlet font file.', [140, 160, 190]],
		['Parses the font headers and layouts.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Active: ${font.name}` : 'Downloading .flf font...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 10, 16);

	if (!font || !bounds) return;

	const time = t.secs * 1.5;
	const scale = 0.5 + 0.5 * Math.sin(time);

	t.figText('LOAD', 0, 0, {
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const colorScale = (cell.col + bounds.cols / 2) / bounds.cols;
			return [Math.round(255 * colorScale), Math.round(100 + 155 * scale), Math.round(255 * (1.0 - colorScale))];
		},
	});
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

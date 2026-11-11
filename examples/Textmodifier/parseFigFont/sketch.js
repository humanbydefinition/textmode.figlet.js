/**
 * @title Textmodifier.parseFigFont
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font, bounds;

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
	const response = await fetch('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	const rawText = await response.text();
	font = t.parseFigFont('Bulbhead', rawText);
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
	bounds = t.figTextBounds('PARSE', { horizontalLayout: 'fitted' });
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.PARSEFIGFONT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PARSING RAW FONT STRINGS', [140, 210, 255]],
		['Parses string data into a FIGfont.', [140, 160, 190]],
		['Enables inline/local font definition.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Parsed name: ${font.name}` : 'Parsing...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(8, 10, 18);
	const time = t.secs;
	const cols = t.grid.cols;
	const rows = t.grid.rows;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);

	if (!font || !bounds) return;

	const w = bounds.cols;
	const h = bounds.rows;
	const halfW = Math.floor(w / 2);
	const halfH = Math.floor(h / 2);

	const cx = (w - 1) / 2 - halfW;
	const cy = (h - 1) / 2 - halfH;

	t.push();
	t.translate(cx, cy);
	t.char(' ');
	t.cellColor(10, 10, 12);
	t.rect(w + 4, h + 2);
	t.pop();

	const timeFig = t.secs * 1.8;
	t.figText('PARSE', 0, 0, {
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const wave = 0.5 + 0.5 * Math.sin(timeFig + cell.col * 0.25);
			return [Math.round(100 + 155 * wave), 255, Math.round(120 + 135 * (1.0 - wave))];
		},
	});
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

/**
 * @title Textmodifier.figFont
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let fontA;
let fontB;

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
	fontA = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	fontB = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Slant.flf');
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

labelLayer.draw(() => {
	t.clear();
	const active = t.figFont();
	drawLabel([
		['TEXTMODIFIER.FIGFONT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: GET/SET ACTIVE FIGFONT', [140, 210, 255]],
		['Sets active font for figText calls.', [140, 160, 190]],
		['Switching fonts updates render grid.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[active ? `Active font: ${active.name}` : 'Loading fonts...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 15, 14);

	if (!fontA || !fontB) return;

	// Cycle font every 3 seconds
	const cycle = Math.floor(t.secs / 3.0) % 2;
	const currentFont = cycle === 0 ? fontA : fontB;
	t.figFont(currentFont);

	const time = t.secs * 1.5;

	t.figText('FONT', 0, 0, {
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const wave = 0.5 + 0.5 * Math.sin(time + cell.col * 0.1);
			return [Math.round(200 + 55 * wave), Math.round(150 + 105 * (1.0 - wave)), Math.round(100 + 155 * wave)];
		},
	});
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

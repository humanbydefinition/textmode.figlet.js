/**
 * @title TextmodeFigFont.header
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
		['TEXTMODEFIGFONT.HEADER', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FIGFONT HEADER ACCESS', [140, 210, 255]],
		['Accesses parsed font header metadata.', [140, 160, 190]],
		['Inspects font specs and layout options.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? 'Header properties printed below' : 'Loading header...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 14);

	if (!font) return;

	// Render "HEADER" at the top center
	t.figText('HEADER', 0, -5);

	// Render the parsed header properties in a table
	t.push();
	const time = t.secs * 1.5;
	const c = 0.5 + 0.5 * Math.sin(time);
	t.charColor(Math.round(100 + 155 * c), Math.round(200 + 55 * (1.0 - c)), 255);

	const h = font.header;
	t.printAlign('center', 'center');
	t.print(`signature : ${h.signature}`, 0, 2);
	t.print(`hardblank : ${h.hardblank}`, 0, 4);
	t.print(`height    : ${h.height}`, 0, 6);
	t.print(`baseline  : ${h.baseline}`, 0, 8);
	t.print(`commentLines : ${h.commentLines}`, 0, 10);
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

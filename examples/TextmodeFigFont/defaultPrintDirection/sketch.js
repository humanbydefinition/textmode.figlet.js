/**
 * @title TextmodeFigFont.defaultPrintDirection
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let font;
let currentDirection = 'ltr';

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
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.DEFAULTPRINTDIRECTION', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PRINT DIRECTION FLOW', [140, 210, 255]],
		['Defines LTR or RTL character flow.', [140, 160, 190]],
		['Reverses character layout ordering.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Default print: ${font.defaultPrintDirection}` : 'Loading...', [140, 255, 200]],
		[font ? `Current print: ${currentDirection}` : '', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 18);
	if (!font) return;

	const directions = ['ltr', 'rtl'];
	const idx = Math.floor(t.secs / 3.0) % directions.length;
	currentDirection = directions[idx];

	const plan = font.planText('FLOW', { direction: currentDirection });
	if (!plan) return;

	const startX = -Math.floor(plan.cols / 2);
	const startY = -Math.floor(plan.rows / 2);
	const time = t.secs * 2.0;

	// Draw characters
	for (const cell of plan.cells) {
		t.push();
		t.translate(startX + cell.col, startY + cell.row);
		const wave = 0.5 + 0.5 * Math.sin(time + cell.col * 0.1);
		t.charColor(Math.round(100 + 155 * wave), Math.round(180 + 75 * (1.0 - wave)), 255);
		t.char(cell.char);
		t.point();
		t.pop();
	}

	// Draw direction flow arrows
	t.push();
	t.charColor(100, 255, 140);
	const arrowY = startY - 3;
	const isLTR = currentDirection === 'ltr';
	const arrowChar = isLTR ? '>' : '<';
	const speed = isLTR ? 1.0 : -1.0;

	for (let col = 0; col < plan.cols; col++) {
		const pulse = 0.5 + 0.5 * Math.sin(time * 3 + col * 0.3 * speed);
		if (pulse > 0.7) {
			t.print(arrowChar, startX + col, arrowY);
		} else {
			t.print('.', startX + col, arrowY);
		}
	}
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

/**
 * @title TextmodeFigFont.defaultVerticalLayout
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let font;
let currentMode = 'default';

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
		['TEXTMODEFIGFONT.DEFAULTVERTICALLAYOUT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: DEFAULT VERTICAL LAYOUT', [140, 210, 255]],
		['Controls vertical spacing of lines.', [140, 160, 190]],
		['Combines row boundaries compact.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Default layout: ${font.defaultVerticalLayout}` : 'Loading...', [140, 255, 200]],
		[font ? `Current layout: ${currentMode}` : '', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 18);
	if (!font) return;

	const modes = ['full', 'fitted', 'smushed'];
	const idx = Math.floor(t.secs / 3.0) % modes.length;
	currentMode = modes[idx];

	const plan = font.planText('UP\nDN', { verticalLayout: currentMode });
	if (!plan) return;

	const startX = -Math.floor(plan.cols / 2) - 3;
	const startY = -Math.floor(plan.rows / 2);
	const time = t.secs * 1.5;

	// Draw characters
	for (const cell of plan.cells) {
		t.push();
		t.translate(startX + cell.col, startY + cell.row);
		const wave = 0.5 + 0.5 * Math.sin(time + cell.row * 0.15);
		t.charColor(255, Math.round(100 + 155 * wave), Math.round(150 + 105 * (1.0 - wave)));
		t.char(cell.char);
		t.point();
		t.pop();
	}

	// Draw vertical height bounds indicator on the right
	t.push();
	t.charColor(100, 220, 255);
	const borderX = startX + plan.cols + 3;
	t.print('┌', borderX, startY - 1);
	t.print('└', borderX, startY + plan.rows);
	for (let r = startY; r < startY + plan.rows; r++) {
		t.print('│', borderX, r);
	}
	const label = `${plan.rows} rows`;
	t.print(`< ${label}`, borderX + 2, 0);
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

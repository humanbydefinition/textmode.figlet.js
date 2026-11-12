/**
 * @title Textmodifier.figText
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const WORD = 'PRINTER';
const layout = { horizontalLayout: 'fitted' };
let font,
	state = { col: 0, row: 0, pct: 0, width: 0 };

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.cellColor(6, 10, 22);
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextAlign('left');
	t.figTextBaseline('top');
	state.width = t.figTextWidth(WORD, layout);
	state.col = -Math.floor(state.width / 2);
});
t.draw(() => t.background(9, 12, 22));
sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	const { cols, rows } = sceneLayer.grid;
	// Keep the gantry below the label panel on every viewport.
	const y = Math.max(19, Math.floor(rows * 0.4)) - Math.floor(rows / 2);
	const pad = Math.max(0, Math.min(4, Math.floor((cols - state.width) / 2)));
	const head = state.col - pad + Math.floor((t.secs * 14) % (state.width + pad * 2));
	const scan = Math.max(0, Math.min(state.width, head - state.col + 1));
	state.row = y;
	state.pct = Math.round((scan / state.width) * 100);
	// A paper sheet, its gantry rail, and the word under the head.
	const paperW = Math.min(state.width + 16, cols);
	const paperH = 2 * Math.floor(Math.max(6, Math.min(16, rows * 0.22)));
	t.push();
	t.translate(state.col + state.width / 2, y - 6 + paperH / 2);
	t.cellColor(14, 19, 34);
	t.rect(paperW, paperH);
	t.pop();
	t.charColor(46, 62, 92);
	t.print('+' + '='.repeat(state.width + pad * 2 - 2) + '+', state.col - pad, y - 4);
	t.figText(WORD, state.col, y, {
		...layout,
		charColor: (cell) => {
			if (cell.col >= scan) return [34, 46, 74];
			const heat = Math.exp(-(scan - cell.col) / 7);
			const wave = 14 * Math.sin(t.secs * 2.4 + cell.col * 0.3 + cell.row);
			const rgb = [44 + 206 * heat + wave, 198 + 48 * heat, 166 + 54 * heat];
			return rgb.map((v) => Math.min(255, Math.round(v)));
		},
	});
	// The head rides the rail and drops a nozzle toward the active column.
	t.charColor(255, 246, 220);
	for (let railY = y - 3; railY <= y - 1; railY += 1) t.print(railY === y - 1 ? 'v' : '█', head, railY);
	t.charColor(255, 186, 96);
	t.print('=', head - 2, y - 3);
	t.print('=', head + 2, y - 3);
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.FIGTEXT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PRINT HEAD, PER-CELL LIGHT', [140, 210, 255]],
		['figText() places cells at col and row.', [140, 160, 190]],
		['charColor() lights each printed cell.', [140, 160, 190]],
		[font ? `Col ${state.col}  Row ${state.row}  ${state.pct}%` : 'Loading font...', [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

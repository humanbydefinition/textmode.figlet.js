/**
 * @title TextmodeFigFont.baseline
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font;
let word;
let mark = 0;

function drawLabel(lines) {
	t.printAlign('left', 'top');
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.cellColor(6, 10, 22);
	for (let i = 0; i < lines.length + 2; i++) t.print(' '.repeat(width), left + 2, top + 2 + i);
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Slant.flf');
	t.figFont(font);
	word = font.renderText('Agy', { horizontalLayout: 'fitted' });
});

t.draw(() => t.background(8, 10, 18));
sceneLayer.draw(() => {
	if (!font || !word) return;
	t.clear();
	t.printAlign('left', 'top');
	const height = font.height;
	const baseRow = font.baseline - 1;
	const x = -Math.floor(word.cols / 2);
	const top = 2 - baseRow;
	const baseY = top + baseRow;
	const left = x - 1;
	const right = x + word.cols;
	const edge = -Math.floor(sceneLayer.grid.cols / 2) + 2;
	const rowBg = (r) => (r > baseRow ? [24, 16, 38] : r === baseRow ? [46, 30, 10] : [0, 0, 0, 0]);
	// Plumb rules run from each viewport edge to the word.
	mark = Math.floor(((Math.sin(t.secs * 2.1) + 1) / 2) * (word.cols - 1));
	const spot = x + mark;
	for (let c = edge; c <= -edge - 2; c++) {
		if (c > left - 2 && c < right + 2) continue;
		const glow = Math.abs(c - spot);
		t.charColor(255, Math.max(60, 230 - glow * 12), 90);
		t.print('=', c, baseY);
	}
	// Row number, arrow, and FIGlet row share one line.
	for (let r = 0; r < height; r++) {
		const row = word.grid[r].join('').split(font.hardblank).join(' ');
		t.cellColor(...rowBg(r));
		t.charColor(...(r > baseRow ? [228, 176, 255] : r === baseRow ? [255, 240, 205] : [110, 175, 240]));
		t.print(`${r + 1}  ${r === baseRow ? '>' : '|'} ${row}`, x - 5, top + r);
		t.cellColor(0, 0, 0, 0);
	}
	const tails = (word.grid[baseRow + 1] ?? []).join('').split(font.hardblank).join(' ');
	t.charColor(200, 150, 255);
	for (let c = 0; c < word.cols; c++) if (tails[c] !== ' ') t.print('v', x + c, baseY + 2);
	const belowText = `ROW ${height} DESCENDERS BELOW`;
	t.charColor(190, 140, 240);
	t.print(belowText, -Math.floor(belowText.length / 2), baseY + 3);
	t.charColor(110, 150, 210);
	const above = `ROWS 1-${baseRow} ABOVE BASELINE ROW`;
	t.print(above, -Math.floor(above.length / 2), top - 2);
	t.charColor(255, 245, 160);
	t.print('+', x + mark, baseY);
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.BASELINE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: BASELINE ROW AND DESCENDER', [140, 210, 255]],
		['The baseline is where capitals rest.', [140, 160, 190]],
		["Agy's g and y tails hang below it.", [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Slant baseline: row ${font.baseline} of ${font.height}` : 'Loading font...', [140, 255, 200]],
		[`Marker: ${mark + 1} / ${word ? word.cols : 0}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

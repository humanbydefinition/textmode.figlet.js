/**
 * @title TextmodeFigFont.getCharacter
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const chars = ['A', '5', '&', '?', '@', '#'];
let font,
	current = { char: 'A', code: 65, width: 0, rows: 0 };

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
t.draw(() => t.background(12, 16, 30));

sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	const char = chars[Math.floor(t.secs / 3) % chars.length];
	const info = font.getCharacter(char.charCodeAt(0));
	if (!info) return;
	current = { char, code: info.code, width: info.width, rows: info.lines.length };

	const startCol = -Math.floor(info.width / 2);
	const startRow = -1;
	const left = startCol - 1;
	const right = startCol + info.width;
	const top = startRow - 1;
	const bottom = startRow + info.lines.length;
	const pulse = 0.72 + 0.28 * Math.sin(t.secs * 2.2);
	const lineColor = [Math.round(150 + 90 * pulse), Math.round(210 + 40 * pulse), 255];

	t.push();
	t.printAlign('left', 'top');
	t.cellColor(0, 0, 0, 0);
	t.charColor(...lineColor);
	for (let row = 0; row < info.lines.length; row++) t.print(info.lines[row], startCol, startRow + row);

	t.charColor(110, 150, 210);
	for (let col = left; col <= right; col++) {
		const edge = col === left || col === right ? '+' : '-';
		t.print(edge, col, top);
		t.print(edge, col, bottom);
	}
	for (let row = top + 1; row < bottom; row++) {
		t.print('|', left, row);
		t.print('|', right, row);
	}

	// Column and row numbers expose the raw FIGcharacter dimensions.
	t.charColor(140, 255, 200);
	for (let col = 0; col < info.width; col++) t.print(String(col + 1), startCol + col, top - 1);
	for (let row = 0; row < info.lines.length; row++) t.print(String(row + 1), left - 2, startRow + row);
	t.pop();
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.GETCHARACTER', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: INSPECT ONE GLYPH', [140, 210, 255]],
		['Code lookup returns raw glyph rows.', [140, 160, 190]],
		['The frame matches width and height.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Char: '${current.char}'  Code: ${Math.round(current.code)}`, [140, 255, 200]],
		[`Glyph: ${Math.round(current.width)} x ${Math.round(current.rows)} cells`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

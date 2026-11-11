/**
 * @title TextmodeFigFont.getCharacter
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [FigletPlugin],
});

const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const chars = ['A', '5', '&', '?', '@', '#'];
let font,
	current = { char: 'A', code: 65, width: 0, rows: 0 };

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
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	const x = left + 3;
	let y = top + 3;

	// Opaque HUD panel, two cells in from the top and left edges.
	t.push();
	t.printAlign('left', 'top');
	t.cellColor(6, 10, 22);
	for (let i = 0; i < 380; i++) t.print(' ', left + 2 + (i % 38), top + 2 + Math.floor(i / 38));
	t.charColor(120, 240, 180);
	t.print('TEXTMODEFIGFONT.GETCHARACTER', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: INSPECT ONE GLYPH', x, y++);
	t.charColor(140, 160, 190);
	t.print('Code lookup returns raw glyph rows.', x, y++);
	t.print('The frame matches width and height.', x, y++);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', x, y++);
	t.charColor(140, 255, 200);
	t.print(`Char: '${current.char}'  Code: ${current.code}`, x, y++);
	t.print(`Glyph: ${current.width} x ${current.rows} cells`, x, y++);
	t.pop();
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	sceneLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
	labelLayer.fontSize(window.innerWidth < 700 ? 8 : 16);
});

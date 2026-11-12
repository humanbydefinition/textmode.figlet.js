/**
 * @title TextmodeFigFont.hardblank
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let font,
	raw,
	rendered,
	marks = [];

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
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Big.flf');
	raw = font.getCharacter('C');
	rendered = font.renderText('C');
	for (let row = 0; row < raw.lines.length; row++)
		for (let col = 0; col < raw.lines[row].length; col++)
			if (raw.lines[row][col] === font.hardblank) marks.push({ row, col });
});
sceneLayer.draw(() => {
	t.clear();
	if (!raw) return;
	const { cols } = sceneLayer.grid;
	const panelW = Math.min(24, Math.floor((cols - 10) / 2));
	const rawX = -Math.floor(panelW + 2);
	const outX = rawX + panelW + 4;
	const gx = rawX + panelW - raw.width - 2;
	const ox = outX + 2;
	const glyphY = 3;
	const pulse = 0.5 + 0.5 * Math.sin(t.secs * 4);
	t.charColor(150, 210, 255);
	t.print('RAW LINES', gx, 1);
	t.charColor(120, 255, 180);
	t.print('NORMALIZED', ox, 1);
	t.charColor(70, 100, 140);
	t.print('-'.repeat(outX + panelW - rawX), rawX, 2);
	t.print('-'.repeat(outX + panelW - rawX), rawX, 11);
	t.charColor(110, 170, 220);
	for (let row = 0; row < raw.lines.length; row++)
		for (let col = 0; col < raw.lines[row].length; col++)
			if (raw.lines[row][col] !== ' ') t.print(raw.lines[row][col], gx + col, glyphY + row);
	t.charColor(90, 225, 160);
	for (let row = 0; row < rendered.grid.length; row++)
		for (let col = 0; col < rendered.grid[row].length; col++)
			if (rendered.grid[row][col] !== ' ') t.print(rendered.grid[row][col], ox + col, glyphY + row);
	for (const mark of marks) {
		t.cellColor(58, 26, 42);
		t.charColor(220, 140, 180);
		t.print('x', ox + mark.col, glyphY + mark.row);
		t.cellColor(Math.round(180 + 75 * pulse), 50, 110);
		t.charColor(18, 8, 24);
		t.print(font.hardblank, gx + mark.col, glyphY + mark.row);
	}
	t.cellColor(0, 0, 0, 0);
	t.charColor(Math.round(200 + 55 * pulse), 150, 235);
	for (const mark of marks) t.print(`${font.hardblank}-->`, rawX + panelW, glyphY + mark.row);
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.HARDBLANK', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: HARDBLANK X-RAY', [140, 210, 255]],
		['Raw lines keep the hardblank cell.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Hardblank '${font ? font.hardblank : '?'}'  marks ${marks.length}`, [140, 255, 200]],
	]);
});
t.draw(() => t.background(10, 14, 26));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

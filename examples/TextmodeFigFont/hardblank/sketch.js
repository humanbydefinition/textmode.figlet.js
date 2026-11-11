/**
 * @title TextmodeFigFont.hardblank
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
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.HARDBLANK', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: HARDBLANK CHARACTER', [140, 210, 255]],
		['A special glyph used for padding.', [140, 160, 190]],
		['Replaced by space in final layout.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Hardblank: '${font.hardblank}'` : 'Loading...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 18);

	if (!font) return;

	const charInfo = font.getCharacter('H');
	if (!charInfo) return;

	const time = t.secs * 2.0;
	const h = charInfo.lines.length;
	const w = charInfo.width;
	const startY = -Math.floor(h / 2);

	// Left: Raw glyph with visible hardblank in red
	t.push();
	t.translate(-Math.floor(w / 2) - 8, startY);
	for (let r = 0; r < h; r++) {
		const line = charInfo.lines[r];
		for (let c = 0; c < line.length; c++) {
			const char = line[c];
			if (char === font.hardblank) {
				const pulse = 0.5 + 0.5 * Math.sin(time + r * 0.5);
				t.charColor(Math.round(255 * pulse), 60, 60);
				t.print(font.hardblank, c, r);
			} else if (char !== ' ') {
				t.charColor(150, 200, 255);
				t.print(char, c, r);
			}
		}
	}
	t.pop();

	// Right: Processed glyph (hardblank converted to space)
	t.push();
	t.translate(-Math.floor(w / 2) + 8, startY);
	for (let r = 0; r < h; r++) {
		const line = charInfo.lines[r];
		for (let c = 0; c < line.length; c++) {
			const char = line[c];
			if (char !== font.hardblank && char !== ' ') {
				t.charColor(100, 255, 140);
				t.print(char, c, r);
			}
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

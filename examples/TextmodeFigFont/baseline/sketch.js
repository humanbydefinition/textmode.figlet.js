/**
 * @title TextmodeFigFont.baseline
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let font;
let rendered;

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
	rendered = font.renderText('BASELINE');
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.BASELINE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FONT BASELINE PROPERTY', [140, 210, 255]],
		['Vertical line where glyphs sit.', [140, 160, 190]],
		['Separates main body from descenders.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Baseline: row ${Math.round(font.baseline)}` : 'Loading...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 12, 18);

	if (!font || !rendered) return;

	const startX = -Math.floor(rendered.cols / 2) - 2;
	const startY = -Math.floor(rendered.rows / 2);
	const time = t.secs * 1.5;

	// Draw rendered text with baseline highlight
	for (let row = 0; row < rendered.grid.length; row++) {
		for (let col = 0; col < rendered.grid[row].length; col++) {
			const char = rendered.grid[row][col];
			if (char === ' ') continue;

			const isBaseline = row === font.baseline - 1;
			t.push();
			t.translate(startX + col, startY + row);
			if (isBaseline) {
				const pulse = 0.5 + 0.5 * Math.sin(time * 3);
				t.charColor(255, Math.round(150 + 105 * pulse), 100);
			} else {
				t.charColor(100, 200, 255);
			}
			t.char(char);
			t.point();
			t.pop();
		}
	}

	// Draw baseline guide line
	t.push();
	const pulse = 0.5 + 0.5 * Math.sin(time * 3.0);
	t.charColor(255, Math.round(100 + 155 * pulse), 100);
	const lineY = startY + font.baseline - 1;
	for (let col = -2; col < rendered.cols + 2; col++) {
		t.print('-', startX + col, lineY);
	}
	t.print('< BASELINE', startX + rendered.cols + 3, lineY);
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

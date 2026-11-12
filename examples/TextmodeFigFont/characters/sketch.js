/**
 * @title TextmodeFigFont.characters
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
	glyphs = [],
	scroll = 0;
let current = { code: 65, char: 'A', width: 0 };
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
	// The Map holds every parsed glyph; tiles that exceed 8 cells are skipped.
	glyphs = [...font.characters.values()]
		.filter((glyph) => glyph.code >= 33 && glyph.code <= 126 && glyph.width <= 8)
		.sort((a, b) => a.code - b.code);
});
sceneLayer.draw(() => {
	t.clear();
	if (!font || !glyphs.length) return;
	const { cols, rows } = sceneLayer.grid;
	const top = -Math.floor(rows / 2);
	const glyphHeight = font.height;
	const stepX = 9,
		stepY = glyphHeight + 2;
	// Fit whole tiles into the area below the label panel.
	const across = Math.min(7, Math.max(3, Math.floor((cols - 4) / stepX)));
	const startX = -Math.floor((across * stepX) / 2);
	const down = Math.max(2, Math.floor((rows - 14) / stepY));
	const sceneTop = top + 13 + Math.floor((rows - 13 - down * stepY) / 2);
	const sel = Math.floor(t.secs * 1.3) % glyphs.length;
	const glyph = glyphs[sel];
	current = { code: glyph.code, char: String.fromCharCode(glyph.code), width: glyph.width };
	const lastRow = Math.ceil(glyphs.length / across) - down;
	scroll = Math.max(0, Math.min(lastRow, Math.floor(sel / across) - Math.floor(down / 2)));
	const pulse = 0.5 + 0.5 * Math.sin(t.secs * 3);
	for (let row = scroll; row < scroll + down; row++) {
		for (let col = 0; col < across; col++) {
			const index = row * across + col;
			if (index >= glyphs.length) break;
			const item = glyphs[index];
			const x = startX + col * stepX;
			const y = sceneTop + (row - scroll) * stepY;
			if (y + glyphHeight > top + rows - 1) continue;
			const active = index === sel;
			t.charColor(...(active ? [225, 255, 240] : [80, 118, 158]));
			t.print(`${String(item.code).padStart(3, '0')} ${String.fromCharCode(item.code)}`, x, y);
			t.charColor(...(active ? [190, 255, 225] : [62, 96, 136]));
			for (let line = 0; line < item.lines.length; line++) t.print(item.lines[line], x, y + 1 + line);
			if (!active) continue;
			t.charColor(Math.round(120 + 100 * pulse), 240, Math.round(180 + 60 * pulse));
			t.print(`+${'-'.repeat(stepX - 1)}+`, x - 1, y - 1);
			t.print(`+${'-'.repeat(stepX - 1)}+`, x - 1, y + glyphHeight + 1);
			for (let i = 0; i <= glyphHeight; i++) for (const side of [x - 1, x + stepX - 1]) t.print('|', side, y + i);
		}
	}
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.CHARACTERS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: GLYPH ATLAS WALL', [140, 210, 255]],
		['The characters Map lists every glyph.', [140, 160, 190]],
		['Tiles show raw rows by code point.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`Code ${current.code} '${current.char}'  width ${current.width}`, [140, 255, 200]],
		[`Map ${font ? font.characters.size : 0} glyphs  shown ${glyphs.length}`, [140, 255, 200]],
	]);
});
t.draw(() => t.background(10, 14, 26));
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

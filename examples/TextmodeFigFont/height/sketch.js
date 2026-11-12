/**
 * @title TextmodeFigFont.height
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const names = ['A', 'i', 'g'];
let font;
let cards = [];
let scan = 0;
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
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Big.flf');
	t.figFont(font);
	cards = names.map((name) => ({ name, glyph: font.getCharacter(name) }));
});
t.draw(() => t.background(9, 12, 20));
sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	t.printAlign('left', 'top');
	const height = font.height;
	const gap = Math.max(3, Math.min(9, Math.floor((sceneLayer.grid.cols - 33) / 2)));
	const widths = cards.map((card) => card.glyph.width);
	const total = widths.reduce((sum, w) => sum + w, 0) + gap * (cards.length - 1);
	const left = Math.round((5 - total) / 2);
	const top = -Math.floor(height / 2) + 2;
	const phase = (t.secs * 0.35) % 2;
	scan = Math.round((phase > 1 ? 2 - phase : phase) * (height - 1));
	const panel = ' '.repeat(total + 3);
	const band = (r) => ['#101826', '#16303e', '#226068'][Math.max(0, 2 - Math.abs(r - scan))];
	// One specimen panel reserves exactly height rows for all three glyphs.
	for (let r = -1; r <= height; r++) {
		t.cellColor(r < 0 || r >= height ? '#101826' : band(r));
		t.print(panel, left - 2, top + r);
	}
	let x = left;
	for (const card of cards) {
		const w = card.glyph.width;
		t.charColor(64, 92, 132);
		t.cellColor(0, 0, 0, 0);
		t.print('+' + '-'.repeat(w) + '+', x - 1, top - 1);
		t.print('+' + '-'.repeat(w) + '+', x - 1, top + height);
		for (let r = 0; r < height; r++) {
			t.cellColor(band(r));
			t.charColor(...(r === scan ? [255, 200 + Math.round(55 * Math.sin(t.secs * 6)), 150] : [96, 156, 224]));
			t.print((card.glyph.lines[r] ?? '').split(font.hardblank).join(' '), x, top + r);
		}
		t.cellColor(0, 0, 0, 0);
		t.charColor(140, 255, 200);
		t.print(card.name, x + Math.floor((w - 1) / 2), top + height + 2);
		x += w + gap;
	}
	// Row gutter: every glyph shares the same numbered band.
	for (let r = 0; r < height; r++) {
		const active = r === scan;
		t.charColor(...(active ? [255, 205, 90] : [64, 94, 134]));
		t.print(String(r + 1), left - 5, top + r);
		t.print(active ? '>' : '|', left - 3, top + r);
	}
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.HEIGHT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ONE HEIGHT FOR ALL GLYPHS', [140, 210, 255]],
		['Each glyph reserves font.height rows.', [140, 160, 190]],
		['Ink can be shorter than its box.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Height: ${font.height} rows per glyph` : 'Loading font...', [140, 255, 200]],
		[`Scan row: ${scan + 1} / ${font ? font.height : 0}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

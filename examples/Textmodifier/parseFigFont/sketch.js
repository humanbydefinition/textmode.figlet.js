/**
 * @title Textmodifier.parseFigFont
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const SRC = 'https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf';
const state = { raw: '', font: null, at: 0, bounds: { cols: 34, rows: 4 } };
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
t.setup(() => {
	fetch(SRC).then(async (response) => {
		state.raw = await response.text();
		state.at = performance.now();
		state.font = t.parseFigFont('Bulbhead', state.raw);
		t.figFont(state.font);
		t.figTextAlign('center');
		t.figTextBaseline('top');
		state.bounds = t.figTextBounds('FORGED', { horizontalLayout: 'fitted' });
	});
});
labelLayer.draw(() => {
	const level = !state.raw ? 0 : performance.now() - state.at < 850 ? 1 : 2;
	t.clear();
	drawLabel([
		['TEXTMODIFIER.PARSEFIGFONT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: RAW TEXT FORGE', [140, 210, 255]],
		['fetch(url).text() returns one string.', [140, 160, 190]],
		['parseFigFont(name, data) parses it.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[['STAGE: FETCHING BYTES', 'STAGE: STRING PARSED', 'STAGE: FONT FORGED'][level], [140, 255, 200]],
		[state.raw ? `RAW: ${state.raw.length} CHARS` : 'RAW: WAITING FOR TEXT', [140, 255, 200]],
		[`FONT: ${state.font ? state.font.name.slice(0, 22) : 'waiting for text'}`, [140, 255, 200]],
	]);
});
t.draw(() => t.background(6, 8, 14));
sceneLayer.draw(() => {
	const { cols, rows } = sceneLayer.grid;
	const level = !state.raw ? 0 : performance.now() - state.at < 850 ? 1 : 2;
	const area = { top: 13 - Math.floor(rows / 2), bottom: Math.floor(rows / 2) - 2 };
	const [bh, w] = [8, Math.min(cols - 2, 52) | 1];
	const left = -Math.floor(w / 2);
	const slabTop = Math.min(area.bottom - 13, Math.max(area.top + 1, Math.round((area.top + area.bottom - 16) / 2)));
	const deck = Math.max(state.bounds.cols + 4, 28);
	t.clear();
	// The raw .flf text sits in a hot slab; the parsed word cools on the anvil below.
	t.charColor(190, 120, 60);
	t.print(level === 0 ? 'RAW STREAM' : 'RAW .FLF EXCERPT', left + 2, slabTop - 1);
	const frame = `+${'-'.repeat(w - 2)}+`;
	t.charColor(120, 70, 45);
	for (const y of [slabTop, slabTop + bh - 1]) t.print(frame, left, y);
	for (let r = 1; r < bh - 1; r++) (t.print('|', left, slabTop + r), t.print('|', left + w - 1, slabTop + r));
	if (state.raw) {
		const lines = state.raw.split(/\r?\n/).filter((line) => line.trim() && line.length <= w - 4);
		const excerpt = lines.slice(0, bh - 2);
		excerpt.forEach((line, i) => {
			const heat = 0.6 + 0.4 * Math.sin(t.secs * 2.4 - i * 0.8);
			t.charColor(255, Math.round(115 + 90 * heat), Math.round(45 + 35 * heat));
			t.print(line, left + 2, slabTop + 1 + i, { markup: false });
		});
	} else {
		t.charColor(255, Math.round(190 + 40 * Math.sin(t.secs * 3)), 110);
		t.print('FETCHING RAW TEXT...', -9, slabTop + 3);
	}
	if (state.font) {
		t.figText('FORGED', 0, slabTop + bh + 1, {
			horizontalLayout: 'fitted',
			cellColor: [56, 26, 11],
			charColor: [255, Math.round(215 + 35 * Math.sin(t.secs * 2.6)), 180],
		});
	}
	t.charColor(150, 95, 55);
	t.print('='.repeat(deck), -Math.floor(deck / 2), slabTop + bh + 1 + state.bounds.rows);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

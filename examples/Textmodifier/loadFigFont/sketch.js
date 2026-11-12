/**
 * @title Textmodifier.loadFigFont
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
const state = { font: null, at: 0, bounds: { cols: 36, rows: 4 } };

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
	t.loadFigFont(SRC).then((loaded) => {
		state.font = loaded;
		state.at = performance.now();
		t.figFont(loaded);
		t.figTextAlign('center');
		t.figTextBaseline('top');
		state.bounds = t.figTextBounds('LOADED', { horizontalLayout: 'fitted' });
	});
});

labelLayer.draw(() => {
	const level = !state.font ? 0 : performance.now() - state.at < 900 ? 1 : 2;
	t.clear();
	drawLabel([
		['TEXTMODIFIER.LOADFIGFONT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FONT LOADING DOCK', [140, 210, 255]],
		['loadFigFont(url) fetches one .flf.', [140, 160, 190]],
		['Then figText() renders its font.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[['STAGE: FETCHING .FLF', 'STAGE: FONT PARSED', 'STAGE: FONT ACTIVE'][level], [140, 255, 200]],
		[`FONT: ${state.font ? state.font.name.slice(0, 22) : 'waiting for file'}`, [140, 255, 200]],
		[`FILE: ${state.font ? SRC.split('/').pop() : '.flf pending'}`, [140, 255, 200]],
	]);
});
t.draw(() => t.background(6, 9, 18));

sceneLayer.draw(() => {
	const { cols, rows } = sceneLayer.grid;
	const level = !state.font ? 0 : performance.now() - state.at < 900 ? 1 : 2;
	const area = { top: 13 - Math.floor(rows / 2), bottom: Math.floor(rows / 2) - 2 };
	const bayTop = Math.min(area.bottom - 9, Math.max(area.top, Math.round((area.top + area.bottom - 8) / 2)));
	const [bh, w] = [state.bounds.rows + 3, Math.min(cols - 2, Math.max(state.bounds.cols + 6, 36)) | 1];
	const [left, streamRow] = [-Math.floor(w / 2), bayTop + bh];
	t.clear();
	// The bay is the loading dock: a URL stream enters below, the font parks inside.
	const frame = `+${'='.repeat(w - 2)}+`;
	t.charColor(58, 88, 120);
	for (const y of [bayTop, bayTop + bh - 1]) t.print(frame, left, y);
	for (let r = 1; r < bh - 1; r++) (t.print('|', left, bayTop + r), t.print('|', left + w - 1, bayTop + r));
	if (level === 2) {
		t.figText('LOADED', 0, bayTop + 1, {
			horizontalLayout: 'fitted',
			charColor: [Math.round(110 + 70 * Math.sin(t.secs * 2.2)), 240, 200],
		});
	} else {
		const msg = ['AWAITING .FLF', 'BULBHEAD PARSED'][level];
		t.charColor(110, 150, 180);
		t.print(msg, -Math.floor(msg.length / 2), bayTop + 2);
		const scan = left + 2 + Math.floor((t.secs * 7) % (w - 4));
		for (let r = 1; r < bh - 1; r++) t.print(':', scan, bayTop + r);
	}
	const marquee = `${SRC.slice(8)}   `;
	const offset = Math.floor(t.secs * (level === 0 ? 10 : 4)) % marquee.length;
	const line = (marquee + marquee).slice(offset, offset + Math.min(w - 2, 44));
	t.charColor(level === 2 ? 70 : 230, level === 2 ? 120 : 170, 90);
	t.print(line, left + 1, streamRow, { markup: false });
	const progress = ['[SOURCE]', '[SOURCE] > [PARSE]', '[SOURCE] > [PARSE] > [LIVE]'][level];
	t.charColor(140, 255, 200);
	t.print(progress, -Math.floor(progress.length / 2), streamRow + 2);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

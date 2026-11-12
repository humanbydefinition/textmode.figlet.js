/**
 * @title Textmodifier.figFont
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const word = 'HI';
const layout = { horizontalLayout: 'fitted' };
const faces = [
	{ url: 'https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf', slot: 'A' },
	{ url: 'https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Slant.flf', slot: 'B' },
];
function plate(x, y, w, h, color) {
	t.cellColor(color[0], color[1], color[2]);
	for (let i = 0; i < h; i++) t.print(' '.repeat(w), x, y + i);
	t.cellColor(0, 0, 0, 0);
}
t.setup(async () => {
	for (const face of faces) {
		face.font = await t.loadFigFont(face.url);
		face.size = face.font.measureText(word, layout);
	}
	t.figFont(faces[0].font);
	t.figTextBaseline('baseline');
});
sceneLayer.draw(() => {
	t.clear();
	if (!faces[0].font) return;
	const { cols, rows } = sceneLayer.grid;
	t.figFont(faces[Math.floor(t.secs / 4) % 2].font);
	const active = t.figFont();
	const wordCols = Math.max(...faces.map((face) => face.size.cols));
	const wordRows = Math.max(...faces.map((face) => face.size.rows));
	const pw = Math.min(wordCols + 4, Math.floor((cols - 1) / 2));
	const gap = cols - 2 * pw >= 4 ? 2 : 0;
	const freeTop = -Math.floor(rows / 2) + 9;
	const freeH = rows - 9;
	const pad = Math.max(0, Math.min(10, Math.floor((freeH - 18) / 8)));
	const ph = wordRows + 6 + pad;
	const y0 = freeTop + Math.max(0, Math.floor((freeH - (ph + 4)) / 2));
	const py = y0 + 2;
	const baseRow = py + wordRows + pad;
	// Two panels share one baseline; figFont() decides which slot is active.
	for (const [index, face] of faces.entries()) {
		const on = face.font === active;
		const wave = 0.5 + 0.5 * Math.sin(t.secs * 3);
		const px = -Math.floor((2 * pw + gap) / 2) + index * (pw + gap);
		plate(px, py, pw, ph, on ? [17 + 7 * wave, 32 + 9 * wave, 44 + 9 * wave] : [10, 18, 28]);
		plate(px, py, pw, 1, on ? [28, 74, 64] : [18, 32, 46]);
		plate(px, py, 1, ph, on ? [120 + 40 * wave, 240, 180 + 30 * wave] : [32, 52, 70]);
		t.charColor(...(on ? [180, 255, 220] : [116, 148, 170]));
		t.print(face.font.name.toUpperCase() + ' '.repeat(pw - 5 - face.font.name.length) + face.slot, px + 2, py);
		t.charColor(...(on ? [140, 210, 190] : [100, 128, 150]));
		t.print(`H ${face.font.height}  BASE ${face.font.baseline}`, px + 3, py + 1);
		t.figFont(face.font);
		t.figText(word, px + Math.max(0, Math.floor((pw - face.size.cols) / 2)), baseRow, {
			...layout,
			charColor: (cell) => {
				const glow = 0.5 + 0.5 * Math.sin(t.secs * 2 + cell.col * 0.2);
				return on ? [160 + 95 * glow, 235, 200 + 40 * glow] : [96, 124, 148];
			},
		});
		plate(px + 2, baseRow + 2, pw - 4, 1, on ? [60, 130, 118] : [26, 42, 56]);
		t.charColor(...(on ? [140, 255, 200] : [110, 138, 162]));
		t.print(on ? 'ACTIVE SLOT' : 'STANDBY', px + 3, baseRow + 4);
	}
	t.figFont(active);
});
labelLayer.draw(() => {
	t.clear();
	const active = t.figFont();
	const lines = [
		['TEXTMODIFIER.FIGFONT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ONE ACTIVE FONT SLOT', [140, 210, 255]],
		['figFont(font) sets; figFont() reads.', [140, 160, 190]],
		[`ACTIVE ${active ? active.name : 'loading'}`, [140, 255, 200]],
		[`NEXT SWITCH ${(4 - (t.secs % 4)).toFixed(1)}s`, [140, 255, 200]],
	];
	const left = -Math.floor(labelLayer.grid.cols / 2),
		top = -Math.floor(labelLayer.grid.rows / 2);
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	plate(left + 2, top + 2, width, lines.length + 2, [6, 10, 22]);
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

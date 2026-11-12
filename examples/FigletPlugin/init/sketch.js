/**
 * @title FigletPlugin.init
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const nodes = ['loadFigFont   .flf', 'parseFigFont  raw text', 'figText       draw cells', 'figTextBounds measure'];
let font, ready;
let slot = 0;
function plate(x, y, w, h, color) {
	t.cellColor(color[0], color[1], color[2]);
	for (let i = 0; i < h; i++) t.print(' '.repeat(w), x, y + i);
	t.cellColor(0, 0, 0, 0);
}
t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextBaseline('top');
	ready = t.figTextBounds('READY', { horizontalLayout: 'fitted' });
});
sceneLayer.draw(() => {
	t.clear();
	if (!font) return;
	const cycle = t.secs % 9;
	slot = Math.min(4, Math.floor(cycle / 1.6));
	const local = Math.min(1, (cycle - slot * 1.6) / 1.1);
	const rows = sceneLayer.grid.rows;
	const freeTop = -Math.floor(rows / 2) + 12;
	const freeH = rows - 12;
	const slotH = Math.max(2, Math.min(5, Math.floor((freeH - 10) / 8)));
	const pitch = Math.max(slotH + 1, Math.floor((freeH - 10) / 4));
	const y0 = freeTop + Math.max(0, Math.floor((freeH - (8 + 3 * pitch + slotH)) / 2));
	const hw = ready.cols + 4;
	const hx = -Math.floor(hw / 2);
	const rack = y0 + ready.rows + 3;
	const textY = (index) => rack + index * pitch + Math.floor(slotH / 2);
	plate(hx, y0, hw, ready.rows + 2, [8, 16, 28]);
	t.print('[fg=#78f0b4]FIGLETPLUGIN.install()[/fg]', hx + 1, y0);
	t.figText('READY', hx + Math.floor((hw - ready.cols) / 2), y0 + 1, {
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const w = 0.5 + 0.5 * Math.sin(t.secs * 2.6 + cell.col * 0.2);
			const level = slot > 3 ? 1 : 0.6;
			return [132 + 80 * w * level, 178 + 50 * w * level, 162 + 50 * w * level].map(Math.round);
		},
	});
	for (let i = 0; i < 4; i++) {
		const lit = i < slot ? [24, 52, 62] : [12, 24, 38];
		plate(hx, rack + i * pitch, hw, slotH, lit);
		plate(hx, textY(i), 1, 1, i < slot ? [140, 240, 190] : [40, 66, 92]);
		t.cellColor(...lit);
		t.print(`[fg=${i < slot ? '#8cf0b4' : '#62879e'}]${nodes[i]}[/fg]`, hx + 3, textY(i));
	}

	// A pulse runs down the rail and powers one slot per step.
	t.char('|');
	t.charColor(40, 66, 92);
	for (let y = rack; y <= rack + 3 * pitch + slotH - 1; y++) t.print('|', hx - 1, y);
	if (slot < 4) {
		const dy = Math.floor(local * (textY(slot) - rack));
		t.charColor(96, 220, 170);
		t.line(hx - 1, rack, hx - 1, rack + dy);
		plate(hx - 1, rack + dy, 1, 1, [200, 255, 225]);
	}
});

labelLayer.draw(() => {
	t.clear();
	const lines = [
		['FIGLETPLUGIN.INIT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PLUGIN BOOT BAY', [140, 210, 255]],
		['install() adds FIGlet methods.', [140, 160, 190]],
		['Fonts load separately from install.', [140, 160, 190]],
		[`METHODS ${Math.min(slot, 4)}/4  ${slot > 3 ? 'READY' : 'SWEEPING'}`, [140, 255, 200]],
		[`FONT ${font ? font.name : 'loading'}`, [140, 255, 200]],
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

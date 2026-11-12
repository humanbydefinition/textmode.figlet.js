/**
 * @title TextmodeFigFont.name
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const registry = [
	{ file: 'Big', plate: 'BIG' },
	{ file: 'Slant', plate: 'SLANT' },
	{ file: 'Mini', plate: 'MINI' },
];

function drawLabel(lines) {
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
	for (const entry of registry) {
		entry.font = await t.loadFigFont(`https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/${entry.file}.flf`);
	}
	t.figFont(registry[0].font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

sceneLayer.draw(() => {
	t.background(10, 14, 26);
	t.cellColor(0, 0, 0, 0);
	if (!registry[0].font) return;
	const { cols, rows } = sceneLayer.grid;
	const top = -Math.floor(rows / 2);
	const time = t.secs;
	const active = Math.floor(time / 3.4) % registry.length;
	const entry = registry[active];
	t.figFont(entry.font);
	const cardW = Math.min(cols - 4, 52);
	const cardH = Math.min(34, rows - 16);
	const cardX = -Math.floor(cardW / 2);
	const cardY = Math.max(top + 12, -Math.floor(cardH / 2));

	t.charColor(190, 160, 95);
	t.print(`+${'-'.repeat(cardW - 2)}+`, cardX, cardY);
	t.print(`+${'-'.repeat(cardW - 2)}+`, cardX, cardY + cardH - 1);
	t.charColor(235, 205, 130);
	t.print(`FIGFONT PASSPORT No.${String(active + 1).padStart(3, '0')}`, -11, cardY + 1);
	t.charColor(110, 135, 165);
	t.print(`NAME  ${entry.font.name}`, cardX + 3, cardY + cardH - 2);

	t.figText(entry.plate, 0, cardY + Math.floor(cardH / 2) + 1, {
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const wave = 0.5 + 0.5 * Math.sin(cell.col * 0.22 - time * 2.2);
			return [Math.round(255 - 100 * wave), Math.round(190 + 45 * wave), Math.round(110 + 145 * wave)];
		},
	});

	const tabs = registry.map((item, i) => (i === active ? `[${item.file.toUpperCase()}]` : item.file.toUpperCase()));
	const tabText = tabs.join('  ');
	t.charColor(225, 190, 110);
	t.print(tabText, -Math.floor(tabText.length / 2), cardY + cardH + 1);
	t.print(`NEXT IN ${(3.4 - (time % 3.4)).toFixed(1)}S`, -6, cardY + cardH + 2);
});

labelLayer.draw(() => {
	t.clear();
	const active = Math.floor(t.secs / 3.4) % registry.length;
	const entry = registry[active];
	drawLabel([
		['TEXTMODEFIGFONT.NAME', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FONT PASSPORT', [140, 210, 255]],
		['name identifies the loaded FIGfont.', [140, 160, 190]],
		[`FONT "${entry.font.name}"  (${active + 1}/${registry.length})`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

/**
 * @title Textmodifier.figTextWidth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const WORD = 'WIDTH';
const modes = ['full', 'fitted', 'smushed'];
const warm = [255, 186, 92],
	cool = [120, 220, 255],
	soft = [200, 160, 255];
let font,
	spans = [0, 0, 0],
	active = 0;

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
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/ASCII%20New%20Roman.flf');
	t.figFont(font);
	t.figTextAlign('left');
	t.figTextBaseline('top');
	spans = modes.map((horizontalLayout) => t.figTextWidth(WORD, { horizontalLayout }));
});

t.draw(() => t.background(9, 12, 22));

sceneLayer.draw(() => {
	if (!font) return;
	t.clear();
	const { rows } = sceneLayer.grid;
	const full = spans[0];
	const left = -1 - Math.floor(full / 2);
	const step = Math.max(6, Math.min(9, Math.floor((rows - 18) / 3)));
	const first = Math.max(12, Math.floor((rows - 18) / 2) + 2) - Math.floor(rows / 2);
	active = Math.floor(t.secs / 2.4) % 3;
	const phase = (t.secs % 2.4) / 2.4;
	t.charColor(40, 52, 74);
	for (let r = first - 1; r <= first + 2 * step + 5; r += 1) t.print(':', left + full - 1, r);
	for (let i = 0; i < 3; i += 1) {
		const top = first + i * step;
		const span = spans[i];
		const bar = top + 5;
		const on = i === active;
		const lift = on ? 0.78 + 0.22 * Math.sin(t.secs * 3) : 0.42;
		const ink = [warm, cool, soft][i].map((v) => Math.round(v * lift));
		const needle = left + 1 + Math.floor(phase * (span - 2));
		t.figText(WORD, left, top + 1, { horizontalLayout: modes[i], charColor: ink });
		const fill = Array.from({ length: span - 2 }, (_, k) => ((k + 1) % 4 === 0 ? '+' : '=')).join('');
		t.charColor('#28344a');
		for (let x = left + span; x < left + full; x += 1) t.print('.', x, bar);
		t.charColor(ink[0], ink[1], ink[2]);
		t.print(`[${fill}]`, left, bar);
		t.print(`${span}`, left + full + 2, bar);
		t.print(modes[i].toUpperCase(), left, top);
		if (on) {
			t.charColor('#fff4c4');
			t.print('|', needle, bar);
		}
	}
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODIFIER.FIGTEXTWIDTH', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: CALIPER COMPARISON', [140, 210, 255]],
		['Same word, three layouts; span=width.', [140, 160, 190]],
		[font ? `Active: ${modes[active].toUpperCase()} = ${spans[active]}` : 'Loading font...', [140, 255, 200]],
		[font ? `Widths: ${spans.join(' / ')} cells` : '', [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

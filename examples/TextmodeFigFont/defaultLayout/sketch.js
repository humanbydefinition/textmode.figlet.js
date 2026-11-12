/**
 * @title TextmodeFigFont.defaultLayout
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const size = () => (window.innerWidth < 700 ? 8 : 16);
const sceneLayer = t.layers.add({ fontSize: size() });
const labelLayer = t.layers.add({ fontSize: size() });
const TITLE = 'TEXTMODEFIGFONT.DEFAULTLAYOUT';
const WORD = 'KERN';
const modes = ['full', 'fitted', 'smushed'];
const inks = { full: [105, 170, 255], fitted: [110, 245, 205], smushed: [255, 192, 112] };
let font,
	specs = [],
	span = 1,
	active = 0;

function box(x, y, w, h, rgb) {
	t.push();
	t.translate(x, y);
	t.cellColor(...rgb);
	t.rect(w, h);
	t.pop();
}
t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Ogre.flf');
	specs = modes.map((mode) => ({
		mode,
		plan: font.planText(WORD, { horizontalLayout: mode }),
		cols: font.measureText(WORD, { horizontalLayout: mode }).cols,
	}));
	span = Math.max(...specs.map((spec) => spec.cols));
	t.printAlign('left', 'top');
});
labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2) + 2, -Math.floor(rows / 2) + 2];
	const lines = [
		[TITLE, [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: HORIZONTAL KERNING', [140, 210, 255]],
		['KERN at one origin, three calipers.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[
			font
				? `DEFAULT ${font.defaultLayout.toUpperCase()} | SCAN ${modes[active].toUpperCase()} ${specs[active].cols}`
				: 'LOADING FONT...',
			[140, 255, 200],
		],
	];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.clear();
	box(left + width / 2, top + (lines.length + 2) / 2, width, lines.length + 2, [6, 10, 22]);
	t.cellColor(6, 10, 22);
	lines.forEach(([text, color], index) => {
		t.charColor(...color);
		t.print(text, left + 1, top + 1 + index);
	});
});
sceneLayer.draw(() => {
	t.clear();
	if (!font) return;
	const { rows } = sceneLayer.grid;
	const bandTop = -Math.floor(rows / 2) + 10 + Math.max(0, Math.floor((rows - 31) / 2));
	const origin = -Math.floor((span + 12) / 2);
	const phase = (t.secs * 3.2) % 21;
	const head = bandTop + phase;
	active = Math.min(2, Math.floor(phase / 7));
	// Every caliper starts on this shared zero rail.
	t.charColor(44, 66, 92);
	for (let row = bandTop; row < bandTop + 21; row += 1) t.print('|', origin - 2, row);
	// The scan strip lights the specimen it crosses.
	box(origin + (span + 8) / 2, Math.floor(head), span + 8, 1, [17, 31, 48]);
	for (let index = 0; index < 3; index += 1) {
		const spec = specs[index];
		const isDefault = spec.mode === font.defaultLayout;
		const y = bandTop + index * 7;
		const glow = Math.max(0, 1 - Math.abs(head - (y + 4)) / 4);
		const gain = (isDefault ? 1 : 0.66) + 0.45 * glow;
		const tint = inks[spec.mode].map((value) => Math.min(255, Math.round(value * gain)));
		t.charColor(...tint);
		for (let col = 0; col <= spec.cols; col += 1)
			t.print(col === 0 || col === spec.cols ? '+' : '=', origin - 1 + col, y);
		t.print(`${spec.cols} ${spec.mode.toUpperCase()}${isDefault ? ' DEFAULT' : ''}`, origin + spec.cols + 2, y);
		for (const cell of spec.plan.cells) t.print(cell.char, origin + cell.col, y + 1 + cell.row);
	}
	t.charColor(255, 210, 120);
	t.print('>', origin - 4, Math.floor(head));
});
t.draw(() => t.background(12, 16, 30));
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	t.fontSize(size());
	for (const layer of t.layers.all) layer.fontSize(size());
});

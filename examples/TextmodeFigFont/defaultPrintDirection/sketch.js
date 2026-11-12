/**
 * @title TextmodeFigFont.defaultPrintDirection
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const fontSize = () => (window.innerWidth < 700 ? 8 : 16);
const sceneLayer = t.layers.add({ fontSize: fontSize() });
const labelLayer = t.layers.add({ fontSize: fontSize() });
const FONT_URL = 'https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf';
const WORD = 'FLOW';
let font,
	defaultDir = 'ltr',
	plans = {};
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
	lines.forEach(([text, color], i) => {
		t.charColor(...color);
		t.print(text, left + 3, top + 3 + i);
	});
}
// One lane streams right and the other left; a sweep follows each reading order.
function drawLane(dir, y, laneW) {
	const plan = plans[dir],
		half = Math.floor(laneW / 2);
	const isDefault = dir === defaultDir,
		sign = dir === 'ltr' ? 1 : -1;
	const phase = Math.floor(t.secs * 7) * sign;
	t.push();
	t.translate(0, y + 2.5);
	t.cellColor(...(isDefault ? [8, 42, 40] : [12, 14, 26]));
	t.rect(laneW, 6);
	t.pop();
	// Repeated units print once; the slice offset scrolls the arrow stream.
	const unit = dir === 'ltr' ? '----->' : '<-----';
	const off = ((-phase % 6) + 6) % 6;
	const rail = unit.repeat(Math.ceil(laneW / 6) + 1).slice(off, off + laneW);
	t.charColor(...(isDefault ? [100, 245, 170] : [76, 106, 164]));
	t.print(rail, -half, y);
	const startX = -Math.floor(plan.cols / 2),
		sweep = (t.secs * 20) % (plan.cols + 12);
	t.figText(WORD, startX, y + 1, {
		direction: dir,
		horizontalLayout: 'fitted',
		charColor: (cell) => {
			const pos = sign === 1 ? sweep - 6 : plan.cols + 6 - sweep;
			const glow = Math.exp(-Math.abs(cell.col - pos) / 4);
			return (isDefault ? [64, 178, 150] : [62, 88, 138]).map((v, i) => Math.round(v + [130, 62, 80][i] * glow));
		},
	});
	t.print(dir === 'ltr' ? 'LTR >' : '< RTL', -half, y + 1);
	if (isDefault) t.print('DEFAULT', half - 7, y + 1);
}
t.setup(async () => {
	font = await t.loadFigFont(FONT_URL);
	t.figFont(font);
	t.figTextBaseline('top');
	defaultDir = font.defaultPrintDirection;
	for (const dir of ['ltr', 'rtl']) {
		plans[dir] = font.planText(WORD, { direction: dir, horizontalLayout: 'fitted' });
	}
});
t.draw(() => t.background(8, 12, 22));
sceneLayer.draw(() => {
	t.clear();
	const { cols, rows } = t.grid;
	// Center the two-lane stage in the space below the label panel.
	const laneW = Math.min(cols - 4, 54),
		top = Math.max(13, 12 + Math.floor((rows - 25) / 2)) - Math.floor(rows / 2);
	drawLane('ltr', top, laneW);
	drawLane('rtl', top + 7, laneW);
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.DEFAULTPRINTDIRECTION', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: SAME GLYPHS, OPPOSITE ORDER', [140, 210, 255]],
		['defaultPrintDirection reads the header.', [140, 160, 190]],
		['ltr keeps FLOW; rtl reverses to WOLF.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `DEFAULT: ${defaultDir}  LANES: LTR / RTL` : 'Loading font...', [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	t.fontSize(fontSize());
	for (const layer of t.layers.all) layer.fontSize(fontSize());
});

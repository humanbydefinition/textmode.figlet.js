/**
 * @title TextmodeFigFont.defaultVerticalLayout
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
const TITLE = 'TEXTMODEFIGFONT.DEFAULTVERTICALLAYOUT';
const INPUT = 'U\nD';
const modes = ['full', 'fitted', 'smushed'];
const inks = { full: [105, 170, 255], fitted: [110, 245, 205], smushed: [255, 192, 112] };
let font;
let stacks = [];

function box(x, y, w, h, rgb) {
	t.push();
	t.translate(x, y);
	t.cellColor(...rgb);
	t.rect(w, h);
	t.pop();
}
t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Big.flf');
	stacks = modes.map((mode) => {
		const plan = font.planText(INPUT, { verticalLayout: mode });
		const rows = font.measureText(INPUT, { verticalLayout: mode }).rows;
		// Two lines: the last line owns the final height rows, so this is its start.
		return { mode, plan, rows, seam: rows - font.height };
	});
	t.printAlign('left', 'top');
});
labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2) + 2, -Math.floor(rows / 2) + 2];
	const total = stacks.map((stack) => stack.rows).join('/');
	const lines = [
		[TITLE, [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: VERTICAL STACK GAPS', [140, 210, 255]],
		['Totals read full / fitted / smushed.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `DEFAULT ${font.defaultVerticalLayout.toUpperCase()} | ${total} ROWS` : '...', [140, 255, 200]],
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
	const { cols, rows } = sceneLayer.grid;
	const widest = Math.max(...stacks.map((stack) => stack.plan.cols));
	const tallest = Math.max(...stacks.map((stack) => stack.rows));
	const pitch = Math.min(24, Math.floor((cols - 6) / 3));
	const blockLeft = -Math.floor((pitch * 3) / 2);
	const sceneTop = -Math.floor(rows / 2) + 11 + Math.max(0, Math.floor((rows - 11 - tallest) / 2));
	const scan = sceneTop + ((t.secs * 5) % (tallest + 1));
	box(blockLeft + (pitch * 3) / 2, Math.floor(scan), pitch * 3, 1, [16, 29, 45]);
	for (let index = 0; index < 3; index += 1) {
		const stack = stacks[index];
		const ox = blockLeft + index * pitch + Math.floor((pitch - widest) / 2);
		const gx = ox + widest + 1;
		const ink = inks[stack.mode];
		const isDefault = stack.mode === font.defaultVerticalLayout;
		const overlap = Math.max(0, font.height - stack.seam);
		// Tint the rows DN pulls into UP, then point at the seam row.
		if (overlap > 0) box(ox + widest / 2, sceneTop + stack.seam + overlap / 2, widest, overlap, [34, 26, 26]);
		t.charColor(58, 84, 112);
		t.print('+', gx, sceneTop);
		for (let row = 1; row < stack.rows - 1; row += 1) t.print('|', gx, sceneTop + row);
		t.print('+', gx, sceneTop + stack.rows - 1);
		t.charColor(140, 255, 200);
		t.print(`${stack.rows}`, gx + 2, sceneTop + stack.rows - 1);
		t.charColor(...ink);
		// The star marks the font default; the caption sits above each stack.
		t.print(`${isDefault ? '*' : ' '}${stack.mode.toUpperCase()}`, ox, sceneTop - 1);
		t.print('>', ox - 1, sceneTop + stack.seam);
		for (const cell of stack.plan.cells) {
			const gain = (isDefault ? 1 : 0.7) + (Math.abs(scan - (sceneTop + cell.row)) < 1.2 ? 0.4 : 0);
			t.charColor(...ink.map((value) => Math.min(255, Math.round(value * gain))));
			t.print(cell.char, ox + cell.col, sceneTop + cell.row);
		}
	}
});
t.draw(() => t.background(12, 16, 30));
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	t.fontSize(size());
	for (const layer of t.layers.all) layer.fontSize(size());
});

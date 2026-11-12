/**
 * @title TextmodeFigFont.dispose
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
const ACTIVE = 4;
const CYCLE = 6.6;
let rawText, plan;
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
function activate() {
	t.figTextBaseline('top');
	const next = t.parseFigFont('Bulbhead', rawText);
	t.figFont(next);
	plan = next.planText('ALIVE', { horizontalLayout: 'full' });
}
t.setup(async () => {
	rawText = await (await fetch('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf')).text();
	activate();
});
t.draw(() => t.background(8, 12, 22));
sceneLayer.draw(() => {
	t.clear();
	if (!plan) return t.print('FETCHING FONT...', -8, Math.round(Math.sin(t.secs * 4) * 2));
	const elapsed = t.secs % CYCLE;
	const active = elapsed < ACTIVE;
	if (active && !t.figFont()) activate();
	else if (!active && t.figFont()) t.figFont().dispose();
	const x = -Math.floor(plan.cols / 2);
	const half = -x + 2;
	const pulse = 0.5 + 0.5 * Math.sin(t.secs * (active ? 3 : 8));
	t.charColor(...(active ? [60, 130, 130] : [150, 60 + 70 * pulse, 60]));
	t.print(`+${'-'.repeat(half * 2 - 1)}+`, -half, -1);
	if (active) {
		const sweep = (t.secs * 18) % (plan.cols + 16);
		t.figText('ALIVE', x, 1, {
			horizontalLayout: 'full',
			charColor: (cell) =>
				[90, 200, 190].map((v, i) =>
					Math.round(v + [140, 50, 60][i] * Math.exp(-Math.abs(cell.col - sweep) / 5))
				),
		});
	} else {
		// Cached cells dissolve out of the capsule; no figText call without a font.
		const p = (elapsed - ACTIVE) / (CYCLE - ACTIVE);
		for (const [index, cell] of plan.cells.entries()) {
			const drift = Math.round(Math.sin(t.secs * 4 + index) * (1 + p * 5));
			t.charColor(8 + 100 * (1 - p), 12 + 180 * (1 - p), 22 + 170 * (1 - p));
			t.print(cell.char, x + cell.col + drift, 1 + cell.row + Math.floor(p * p * 16));
		}
		t.charColor(255, 110 + Math.round(90 * pulse), 90);
		t.print('[ DISPOSED ]', -6, 8);
	}
	const fill = active ? 1 - elapsed / ACTIVE : (elapsed - ACTIVE) / (CYCLE - ACTIVE);
	const lit = Math.round(fill * (half * 2 - 1));
	t.print(`+${'='.repeat(lit)}${'.'.repeat(half * 2 - 1 - lit)}+`, -half, 6);
});
labelLayer.draw(() => {
	t.clear();
	const activeFont = t.figFont();
	const state = !plan ? 'loading' : activeFont ? 'active' : 'disposed';
	const name = activeFont ? activeFont.name : 'undefined';
	const cycles = Math.floor(t.secs / CYCLE) + 1;
	const remain = Math.max(0, (state === 'active' ? ACTIVE : CYCLE) - (t.secs % CYCLE));
	const action = state === 'disposed' ? 'REPARSE' : 'DISPOSE';
	const prompt = state === 'loading' ? 'LOADING FONT' : `${action} IN ${remain.toFixed(1)}S`;
	drawLabel([
		['TEXTMODEFIGFONT.DISPOSE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FONT LIFECYCLE LOOP', [140, 210, 255]],
		['dispose() frees the parsed FIGfont.', [140, 160, 190]],
		[`CYCLE ${cycles}  ${state.toUpperCase()}  FONT ${name}`, [140, 255, 200]],
		[prompt, [255, 200, 80]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	t.fontSize(fontSize());
	for (const layer of t.layers.all) layer.fontSize(fontSize());
});

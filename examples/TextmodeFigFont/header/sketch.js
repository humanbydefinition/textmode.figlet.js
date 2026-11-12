/**
 * @title TextmodeFigFont.header
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});
const sceneLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const fields = [
	['signature', 'v2 marker'],
	['hardblank', 'blank filler'],
	['height', 'glyph rows'],
	['baseline', 'text row'],
	['maxLength', 'max glyph width'],
	['oldLayout', 'legacy layout'],
	['commentLines', 'header lines'],
];
let font;
let headerLine = '';
let spans = [];
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
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	const keys = ['signature', 'hardblank', 'height', 'baseline', 'maxLength', 'oldLayout', 'commentLines'];
	for (const key of keys) {
		const text = String(font.header[key]);
		if (key !== 'signature' && key !== 'hardblank') headerLine += ' ';
		spans.push({ key, start: headerLine.length, size: text.length });
		headerLine += text;
	}
});

sceneLayer.draw(() => {
	t.background(9, 12, 20);
	t.cellColor(0, 0, 0, 0);
	if (!font) return;
	const { cols, rows } = sceneLayer.grid;
	const focus = Math.floor(t.secs / 2) % fields.length;
	const sheetX = -Math.floor(Math.min(cols - 6, 46) / 2);
	const sheetY = -Math.floor(rows / 2) + 13 + Math.max(0, Math.floor((rows - 30) / 2));
	t.charColor(120, 240, 180);
	t.print('FIGFONT HEADER SPEC', sheetX + 3, sheetY);
	const spread = cols >= 64 ? 3 : 2;
	const air = rows > 52 ? 2 : 1;
	const span = spans.find((item) => item.key === fields[focus][0]);
	const lineX = -Math.floor((headerLine.length * spread - 1) / 2);
	const lineY = sheetY + 2;
	// Rebuild one readable flf2a line from the parsed fields, then focus a token.
	const token = headerLine.slice(span.start, span.start + span.size);
	const marked = `${headerLine.slice(0, span.start)}[bg=#3a2f12][fg=#ffcd4b]${token}[/fg][/bg]${headerLine.slice(span.start + span.size)}`;
	t.charColor(Math.round(120 + 60 * Math.sin(t.secs * 2.5)), 195, 235);
	t.print(marked, lineX, lineY, { letterSpacing: spread - 1 });
	t.charColor(255, 205, 75);
	t.print('^'.repeat(span.size), lineX + span.start * spread, lineY + 1, { letterSpacing: spread - 1 });
	t.print(`[fg=#2d3e58]${'-'.repeat(headerLine.length * spread - 1)}[/fg]`, lineX, lineY + 2);
	const callout = `${focus + 1}/${fields.length} ${fields[focus][0].toUpperCase()} = "${font.header[fields[focus][0]]}"`;
	t.print(`${callout}\n[fg=#8ca0be]${fields[focus][1]}[/fg]`, sheetX + 3, lineY + 4);
	const tableRows = ['[fg=#465f80]FIELD        VALUE  DECODED[/fg]'].concat(
		fields.map(([key, hint]) => `${key.padEnd(13)}${String(font.header[key]).padEnd(7)}${hint}`)
	);
	t.charColor(Math.round(130 + 30 * Math.sin(t.secs * 2.2)), 190, 220);
	t.print(tableRows.join('\n'), sheetX + 3, lineY + 6 + air, { leading: air });
	t.print(`[bg=#3a2f12][fg=#ffcd4b]${tableRows[focus + 1]}[/fg][/bg]`, sheetX + 3, lineY + 6 + air * (focus + 2));
});

labelLayer.draw(() => {
	t.clear();
	const focus = Math.floor(t.secs / 2) % fields.length;
	const value = font ? font.header[fields[focus][0]] : '-';
	drawLabel([
		['TEXTMODEFIGFONT.HEADER', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FIGFONT SPEC SHEET', [140, 210, 255]],
		['header returns parsed .flf fields.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`FIELD ${focus + 1}/${fields.length} ${fields[focus][0]} = ${value}`, [140, 255, 200]],
		[`${font ? font.name : '-'}  ${headerLine}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

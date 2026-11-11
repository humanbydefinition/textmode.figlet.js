/**
 * @title TextmodeFigFont.characters
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

let font;
let keysList = [];

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
	keysList = Array.from(font.characters.keys()).filter((code) => code >= 33 && code <= 126);
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['TEXTMODEFIGFONT.CHARACTERS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: INSPECTING ALL CHARACTERS', [140, 210, 255]],
		['Accesses map of all loaded glyphs.', [140, 160, 190]],
		['Shows printable ASCII codes (33-126).', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[font ? `Glyphs loaded: ${font.characters.size}` : 'Loading characters map...', [140, 255, 200]],
	]);
});

t.draw(() => {
	t.background(10, 10, 14);

	if (!font || keysList.length === 0) return;

	t.figText('CHARS', 0, -6);

	t.push();
	t.printAlign('center', 'center');
	const time = t.secs * 1.2;
	const offset = Math.floor(time * 2) % keysList.length;

	// Draw a scrolling waterfall of loaded character codes
	for (let i = 0; i < 8; i++) {
		const idx = (offset + i) % keysList.length;
		const code = keysList[idx];
		const charStr = String.fromCharCode(code);

		const wave = 0.5 + 0.5 * Math.sin(time + i * 0.5);
		t.charColor(Math.round(100 + 155 * wave), 255, Math.round(150 + 105 * (1.0 - wave)));

		t.print(`code ${code} -> glyph '${charStr}'`, 0, -1 + i * 2);
	}
	t.pop();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});

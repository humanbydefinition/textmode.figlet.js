/**
 * @title Textmodifier.figText
 * @author codex
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	frameRate: 60,
	plugins: [FigletPlugin],
});

let font;

function writeLabel(text, y, color = [220, 220, 220]) {
	const startX = -Math.floor(text.length / 2);
	t.charColor(...color);

	for (let i = 0; i < text.length; i++) {
		t.push();
		t.translate(startX + i, y);
		t.char(text[i]);
		t.point();
		t.pop();
	}
}

function getWaveColor(phase, seed, from, to) {
	const wave = 0.5 + 0.5 * Math.sin(phase + seed);
	return from.map((start, index) => Math.round(start + (to[index] - start) * wave));
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

t.draw(() => {
	t.background(8, 10, 16);

	if (!font) {
		writeLabel('drawing FIGlet cells with t.figText()', 0, [255, 214, 102]);
		return;
	}

	const phase = Date.now() * 0.0035;

	writeLabel('Textmodifier.figText', -12, [255, 214, 102]);
	t.figText('DRAW', 0, -1, {
		horizontalLayout: 'fitted',
		charColor: (cell) => getWaveColor(phase, cell.col * 0.55 + cell.row * 0.35, [124, 214, 255], [255, 214, 102]),
		cellColor: (cell) => (cell.subCol === 0 ? [24, 28, 52, 255] : undefined),
	});
	writeLabel('per-cell color callbacks can style the rendered glyph plan', 10, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

/**
 * @title Textmodifier.figFont
 * @author codex
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	frameRate: 60,
	plugins: [FigletPlugin],
});

let bulbhead;
let colossal;

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

t.setup(async () => {
	[bulbhead, colossal] = await Promise.all([
		t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf'),
		t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Colossal.flf'),
	]);

	t.figTextAlign('center');
	t.figTextBaseline('center');
});

t.draw(() => {
	t.background(9, 10, 16);

	if (!bulbhead || !colossal) {
		writeLabel('setting and reading the active font with t.figFont()', 0, [255, 214, 102]);
		return;
	}

	const useBulbhead = Math.floor(Date.now() / 1400) % 2 === 0;
	const activeFont = useBulbhead ? bulbhead : colossal;
	const sample = useBulbhead ? 'BULB' : 'BIG';

	t.figFont(activeFont);

	writeLabel('Textmodifier.figFont', -12, [255, 214, 102]);
	t.charColor(124, 214, 255);
	t.figText(sample, 0, -2, {
		horizontalLayout: 'fitted',
	});
	writeLabel(`setter -> ${activeFont.name}`, 9, [220, 230, 255]);
	writeLabel(`getter -> ${t.figFont()?.name ?? 'none'}`, 12, [160, 180, 220]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

/**
 * @title TextmodeFigFont.dispose
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [FigletPlugin],
});

const labelLayer = t.layers.add();

let font;
let isDisposed = false;

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

t.setup(async () => {
	font = await t.loadFigFont('https://cdn.jsdelivr.net/gh/xero/figlet-fonts@master/Bulbhead.flf');
	t.figFont(font);
	t.figTextAlign('center');
	t.figTextBaseline('center');
});

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('TEXTMODEFIGFONT.DISPOSE', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: EXPLICIT RESOURCE DISPOSAL', x, y++, 100, 220, 255);
	drawText('Frees font resources and listeners.', x, y++, 140, 160, 190);
	drawText('Untracks font from sketch lifecycle.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	if (font) {
		const status = isDisposed ? 'Disposed' : 'Active';
		drawText(`Status: ${status}`, x, y++, isDisposed ? 255 : 140, isDisposed ? 100 : 255, 140);
	} else {
		drawText('Loading font...', x, y++, 255, 180, 100);
	}
});

t.draw(() => {
	t.background(10, 12, 16);

	if (!font) return;

	// Toggle disposal every 3 seconds for demonstration
	const cycle = Math.floor(t.secs / 3.0) % 2;
	if (cycle === 1 && !isDisposed) {
		font.dispose();
		isDisposed = true;
	}

	if (!isDisposed) {
		t.push();
		t.charColor(120, 220, 255);
		t.figText('ALIVE', 0, 0);
		t.pop();
	}
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

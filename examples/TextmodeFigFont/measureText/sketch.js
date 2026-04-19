/**
 * @title TextmodeFigFont.measureText
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
let measurement;
let rendered;

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

function drawGrid(grid, originX, originY, color = [124, 214, 255]) {
	t.charColor(...color);

	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < grid[row].length; col++) {
			const cell = grid[row][col];
			if (cell === ' ') {
				continue;
			}

			t.push();
			t.translate(originX + col, originY + row);
			t.char(cell);
			t.point();
			t.pop();
		}
	}
}

function drawBounds(cols, rows, originX, originY, color = [255, 120, 150]) {
	t.charColor(...color);
	t.char('+');

	for (let col = 0; col < cols; col++) {
		t.push();
		t.translate(originX + col, originY);
		t.point();
		t.pop();

		t.push();
		t.translate(originX + col, originY + rows - 1);
		t.point();
		t.pop();
	}

	for (let row = 0; row < rows; row++) {
		t.push();
		t.translate(originX, originY + row);
		t.point();
		t.pop();

		t.push();
		t.translate(originX + cols - 1, originY + row);
		t.point();
		t.pop();
	}
}

t.setup(async () => {
	font = await t.loadFigFont(FigletExampleFonts.colossal);
	measurement = font.measureText('MEASURE');
	rendered = font.renderText('MEASURE');
});

t.draw(() => {
	t.background(8, 10, 18);

	if (!font || !measurement || !rendered) {
		writeLabel('measuring rendered bounds with measureText()', 0, [255, 214, 102]);
		return;
	}

	const originX = -Math.floor(measurement.cols / 2);
	const originY = -4;

	writeLabel('TextmodeFigFont.measureText', -11, [255, 214, 102]);
	drawBounds(measurement.cols, measurement.rows, originX, originY, [255, 120, 150]);
	drawGrid(rendered.grid, originX, originY, [124, 214, 255]);
	writeLabel(`bounds: ${measurement.cols} cols × ${measurement.rows} rows`, 9, [220, 230, 255]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

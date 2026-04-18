const webGL2Constants = new Proxy(
	{},
	{
		get() {
			return 0;
		},
	}
);

if (!('WebGL2RenderingContext' in globalThis)) {
	Object.defineProperty(globalThis, 'WebGL2RenderingContext', {
		value: webGL2Constants,
		configurable: true,
	});
}

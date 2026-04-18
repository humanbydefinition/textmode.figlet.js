/**
 * Base class for objects that support explicit disposal.
 */
export class Disposable {
	private readonly _onDisposeCallbacks = new Set<() => void>();

	/**
	 * Register a callback to run when the resource is disposed.
	 *
	 * @param callback Callback to run on disposal.
	 */
	public _addOnDispose(callback: () => void): void {
		this._onDisposeCallbacks.add(callback);
	}

	/**
	 * Dispose the resource and invoke all registered callbacks.
	 */
	public dispose(): void {
		for (const callback of this._onDisposeCallbacks) {
			callback();
		}

		this._onDisposeCallbacks.clear();
	}
}

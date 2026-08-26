/**
 * Error type used by the `textmode.figlet.js` package internals.
 */
export class FigletError extends Error {
	/**
	 * Create a new `FigletError`.
	 *
	 * @param message The main error message.
	 * @param context Optional structured context appended to the message.
	 */
	constructor(message: string, context?: Record<string, unknown>) {
		super(FigletError.formatMessage(message, context));
		this.name = 'FigletError';
	}

	private static formatMessage(message: string, context?: Record<string, unknown>): string {
		if (!context || Object.keys(context).length === 0) {
			return message;
		}

		const formattedContext = Object.entries(context)
			.map(([key, value]) => `\n  - ${key}: ${FigletError.formatValue(value)}`)
			.join('');

		return `${message}\n\nContext:${formattedContext}`;
	}

	private static formatValue(value: unknown): string {
		if (typeof value === 'string') return `"${value}"`;
		return String(value);
	}
}

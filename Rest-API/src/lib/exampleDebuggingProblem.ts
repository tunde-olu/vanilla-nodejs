/**
 * A Library that demonstrates something throwing when it's init() is called
 */

class Example {
	private static _instance: Example;

	constructor() {
		if (Example._instance) {
			throw new Error('Instantiation failed: Use Example.getInstance() instead of new');
		}
	}

	public static getInstance() {
		if (Example._instance) {
			return Example._instance;
		}
		Example._instance = new Example();
		return Example._instance;
	}

	// Init function
	public init() {
		// This is an error created intentionally, (bar not defined)

		// @ts-ignore
		const foo = bar;
	}
}

export default Example.getInstance();

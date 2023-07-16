/**
 * Primary file for the API
 */

import server from './lib/server.js';
import workers from './lib/workers.js';
import cli from './lib/cli.js';
import { pathToFileURL } from 'url';

class App {
	private static _instance: App;

	constructor() {}

	public static getInstance(): App {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new App();
		return this._instance;
	}

	public init() {
		try {
			// Start the server
			server.init();

			// Start the workers
			workers.init();

			// Start the CLI (last)
			setImmediate(() => {
				cli.init();
			});
		} catch (error) {
			throw error;
		}
	}
}

const app = new App();

// Self invoking only if required directly
if (pathToFileURL(process.argv[1]).href === import.meta.url) {
	app.init();
}

export default App.getInstance();

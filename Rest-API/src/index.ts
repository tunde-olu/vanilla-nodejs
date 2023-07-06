/**
 * Primary file for the API
 */

import server from './lib/server.js';
import workers from './lib/workers.js';

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

	public async init() {
		// Start the server
		server.init();

		// Start the workers
		workers.init();
	}
}

const app = new App();
app.init();

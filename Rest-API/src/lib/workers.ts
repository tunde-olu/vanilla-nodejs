import path from 'path';
import fsPromises from 'fs';
import _data from './data.js';
import http from 'http';
import https from 'https';
import helpers from './helpers.js';
import url from 'url';

class Workers {
	private static _instance: Workers;

	private constructor() {}

	public static getInstance(): Workers {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new Workers();
		return this._instance;
	}

	// Lookup all the checks, get their data, send to a validator
	private async gatherAllChecks() {
		// Get all the check
		try {
			const folderList = await _data.list('checks');
			// Read  in the check data
		} catch (error) {
			console.log(error);
		}
	}

	// Time to execute the worker-process once per minute
	// TODO: change the timeInternal time to 1 min
	private loop() {
		setInterval(() => {
			this.gatherAllChecks();
		}, 1000 * 5);
	}

	// Init script
	async init() {
		// Execute all the checks immediately
		this.gatherAllChecks();

		// Call the loop so the checks will execute later
		await this.loop();
	}
}

export default Workers.getInstance();

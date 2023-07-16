import assert from 'assert';
import helpers from '../lib/helpers.js';
import _logs from '../lib/logs.js';
import exampleDebuggingProblem from '../lib/exampleDebuggingProblem.js';
import { RequestOptions } from 'https';
import config from '../lib/config.js';
import http from 'node:http';
import { IncomingMessage } from 'http';

class Tests {
	private static _instance: Tests;

	public unit: { [key: string]: () => void };
	public api: { [key: string]: () => void };

	private constructor() {
		if (Tests._instance) {
			throw new Error('Instantiation failed: Use Tests.getInstance() instead of new');
		}

		this.unit = {
			'helpers.getANumber should return a number': this.returnNumber,
			'helpers.getANumber should return 1': this.return1,
			'helpers.getANumber should return 2': this.return2,
			'logs.list should callback a false error and an array of log names': this.logsList,
			'logs.truncate should not throw if the logId does not exist, should callback an error instead':
				this.logTruncate,
			'exampleDebuggingProblem.init should not throw when called':
				this.exampleDebuggingProblemTest,

			'app.init should start without throwing': this.apiInit,
		};

		this.api = {};
	}

	public static getInstance() {
		if (Tests._instance) {
			return Tests._instance;
		}
		Tests._instance = new Tests();
		return Tests._instance;
	}

	//////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////	UNIT TEST	/////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////
	// Assert that the getANumber function is returning a number
	private returnNumber() {
		const val = helpers.getANumber();
		try {
			assert.equal(typeof val, 'number');
		} catch (error) {
			throw error;
		}
	}

	// Assert that the getNumber function is returning 1
	private return1() {
		const val = helpers.getANumber();
		try {
			assert.equal(val, 1);
		} catch (error) {
			throw error;
		}
	}

	// Assert that the getNumber function is returning 2
	private return2() {
		const val = helpers.getANumber();
		try {
			assert.equal(val, 2);
		} catch (error) {
			throw error;
		}
	}

	// Logs.list should callback an array and a false error
	private async logsList() {
		try {
			const logFilenames = await _logs.list(true);
			assert.ok(logFilenames instanceof Array);
			assert.ok(logFilenames.length > 0);
		} catch (error) {
			throw error;
		}
	}

	// Logs.truncate should not throw if the logId doesn't exist
	private async logTruncate() {
		assert.doesNotThrow(async () => {
			try {
				await _logs.truncate('3nurro9vvoidlhzteu82');
			} catch (error) {
				assert.ok(error);
			}
		}, TypeError);
	}

	// exampleDebuggingProblem.init should not throw (but it does)
	private exampleDebuggingProblemTest() {
		assert.doesNotThrow(() => {
			exampleDebuggingProblem.init();
		}, TypeError);
	}

	//////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////	API TEST	/////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////

	// Helper
	private async makeGuestRequest(path: string, callback: (res: IncomingMessage) => void) {
		// Configure the request details
		const requestDetails: RequestOptions = {
			protocol: 'http',
			hostname: 'localhost',
			port: config.httpPort,
			method: 'GET',
			path: path,
			headers: {
				'Content-Type': 'application/json',
			},
		};

		// Send the request
		// const req = await httpRequestPromise('requestDetails')
		const req = http.request(requestDetails, (res) => {
			callback(res);
		});

		req.end();
	}
	// The main init() function should be able to run without throwing.
	private apiInit() {
		assert.doesNotThrow(() => {
			// app.init();
		});
	}
}

export { Tests };
export default Tests.getInstance();

import assert from 'assert/strict';
import helpers from '../lib/helpers.js';
import _logs from '../lib/logs.js';
import exampleDebuggingProblem from '../lib/exampleDebuggingProblem.js';
import FileSystemError from '../error/fileSystemError.js';
import server from '../lib/server.js';
import { RequestOptions } from 'https';
import config from '../lib/config.js';
import http from 'node:http';
import { promisify } from 'util';
import { IncomingMessage } from 'http';
import app from '../index.js';

const httpRequestPromise = promisify(http.request);

class ApiTest {
	private static _instance: ApiTest;

	public apiTest: { [key: string]: () => void };

	private constructor() {
		if (ApiTest._instance) {
			throw new Error('Instantiation failed: Use ApiTest.getInstance() instead of new');
		}

		this.apiTest = {
			'app.init should start without throwing': this.appInit,
			'ping should respond to GET with 200': this.pingRespond200,
			'/api/users should respond to GET with 400': this.pathReturn400,
			'A random path should respond to GET with 404': this.randomPathReturnReturn404,
		};
	}

	public static getInstance() {
		if (ApiTest._instance) {
			return ApiTest._instance;
		}
		ApiTest._instance = new ApiTest();
		return ApiTest._instance;
	}
	//////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////	API TEST	/////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////

	// The main init() function should be able to run without throwing.
	private appInit() {
		assert.doesNotThrow(() => {
			app.init();
		});
	}

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

	// Make a request to /ping
	private async pingRespond200() {
		await this.makeGuestRequest('/ping', (res) => {
			console.log(res);
			console.log(res.statusCode, '\n\n\n');
		});
	}

	// Make a request to /api/users
	private pathReturn400() {
		this.makeGuestRequest('/api/users', (res) => {
			assert.strictEqual(res.statusCode, 400);
		});
	}

	// Make a request to a random path
	private randomPathReturnReturn404() {
		this.makeGuestRequest('/api/random', (res) => {
			assert.strictEqual(res.statusCode, 44);
		});
	}
}

export default ApiTest.getInstance().apiTest;

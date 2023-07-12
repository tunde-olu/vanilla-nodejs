import path from 'path';
import fsPromises from 'fs';
import _data from './data.js';
import http from 'http';
import https, { RequestOptions } from 'https';
import type { ICheckOutcome, IChecksDataObject, ITokenDataObject } from '../types/lib.js';
import helpers from './helpers.js';
import logs from './logs.js';
import { promisify, debuglog } from 'node:util';

const debug = debuglog('worker');

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

	private async log(
		checkData: IChecksDataObject,
		checkOutcome: ICheckOutcome,
		state: IChecksDataObject['state'],
		alertWarranted: boolean,
		timeOfCheck: number
	) {
		// Form the log data
		const logData = {
			check: checkData,
			outcome: checkOutcome,
			state,
			alert: alertWarranted,
			time: timeOfCheck,
		};

		// Convert data to a string
		const logString = JSON.stringify(logData);

		// Determine the name of the log file
		const logFileName = checkData.id;

		// Append the log string to the file
		try {
			const response = await logs.append(logFileName, logString);
			debug('Logging to file succeeded');
		} catch (error) {
			debug(error as string);
		}
	}

	// Alert the user as to a change in their check status
	private alertUserToStatusChange(newCheckData: IChecksDataObject) {
		const msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${
			newCheckData.protocol
		}://${newCheckData.url} is currently ${newCheckData.state}`;

		// TODO: send an sms or email to the user with msg

		debug('Success: User was alerted to a status in their check, via sms: ', msg);
	}

	/**
	 * Process the check outcome, update the check data as needed,
	 * 		and trigger an alert to the user if needed
	 *
	 * Special logic for accommodating a check that has never
	 * 		been tested before (don't alert on that one)
	 * @param checkData
	 * @param checkOutcome
	 */
	private processCheckOutcome(checkData: IChecksDataObject, checkOutcome: ICheckOutcome) {
		// Decide if the check is considered up or down
		const state =
			!checkOutcome.error &&
			checkOutcome.responseCode &&
			checkData.successCodes.indexOf(checkOutcome.responseCode as number) > -1
				? 'up'
				: 'down';

		// Decide if an alert is warranted
		const alertWarranted = checkData.lastChecked && checkData.state !== state ? true : false;

		// Log the outcome of the check
		const timeOfCheck = Date.now();
		this.log(checkData, checkOutcome, state, alertWarranted, timeOfCheck);

		// Update the checkData
		const newCheckData = checkData;
		newCheckData.state = state;
		newCheckData.lastChecked = timeOfCheck;

		// Save the updates
		_data.update('checks', newCheckData.id, newCheckData, (err) => {
			if (!err) {
				// Send the new check data to the next phase in the process if needed
				if (alertWarranted) {
					this.alertUserToStatusChange(newCheckData);
				} else {
					debug('Check outcome has not changed, no alert needed');
				}
			} else {
				debug('Error trying to save updates to on of the checks');
			}
		});
	}

	// Perform the check, send the checkData and the outcome of the check process, to the next step in the process
	private performChecks(checkData: IChecksDataObject) {
		// Prepare the initial check outcome
		const checkOutcome: ICheckOutcome = {
			error: false,
			responseCode: false,
		};

		// Mark that the outcome has not been sent yet
		let outcomeSent = false;

		// Parse the hostname and the path out of the checkData
		const url = new URL(`${checkData.protocol}://${checkData.url}`);
		const hostname = url.hostname;
		const path = url.pathname + url.search; // We want to get both the pathname and query{error: boolean, value: }

		// Construct the request
		const requestDetails: RequestOptions = {
			protocol: checkData.protocol + ':',
			hostname: hostname,
			method: checkData.method.toUpperCase(),
			path,
			timeout: checkData.timeoutSeconds * 1000,
		};

		// Instantiate the request object (using either the http or https module)
		let _moduleToUse = checkData.protocol === 'http' ? http : https;

		const req = _moduleToUse.request(requestDetails, (res) => {
			// Grab the status of the sent request
			const status = res.statusCode;

			// Update the check outcome and pass the data along
			checkOutcome.responseCode = status as number;

			if (!outcomeSent) {
				this.processCheckOutcome(checkData, checkOutcome);
				outcomeSent = true;
			}
		});

		// Bind to the error event so it doesn't get thrown
		req.on('error', (e: string) => {
			// Update the checkOutcome and pass the data along
			checkOutcome.error = { error: true, value: e };

			if (!outcomeSent) {
				this.processCheckOutcome(checkData, checkOutcome);
				outcomeSent = true;
			}
		});

		// Bind to the timeout event
		req.on('timeout', (e: string) => {
			// Update the checkOutcome and pass the data along
			checkOutcome.error = { error: true, value: 'timeout' };

			if (!outcomeSent) {
				this.processCheckOutcome(checkData, checkOutcome);
				outcomeSent = true;
			}
		});

		// End the request
		req.end();
	}

	// Sanity-checking the check data
	private validateCheckData(checkData: IChecksDataObject) {
		checkData =
			typeof checkData === 'object' && checkData !== null
				? checkData
				: ({} as IChecksDataObject);

		checkData.id =
			typeof checkData.id === 'string' && checkData.id.trim().length === 20
				? checkData.id
				: '';

		checkData.phone =
			typeof checkData.phone === 'string' && checkData.phone.trim().length === 11
				? checkData.phone
				: '';

		checkData.protocol =
			typeof checkData.protocol === 'string' &&
			['http', 'https'].indexOf(checkData.protocol) > -1
				? checkData.protocol
				: '';

		checkData.url =
			typeof checkData.url === 'string' && checkData.url.trim().length > 0
				? checkData.url
				: '';

		checkData.method =
			typeof checkData.method === 'string' &&
			['post', 'get', 'put', 'delete'].indexOf(checkData.method) > -1
				? checkData.method
				: '';
		checkData.successCodes =
			typeof checkData.successCodes === 'object' &&
			checkData.successCodes instanceof Array &&
			checkData.successCodes.length > 0
				? checkData.successCodes
				: [];

		checkData.timeoutSeconds =
			typeof checkData.timeoutSeconds === 'number' &&
			checkData.timeoutSeconds >= 1 &&
			checkData.timeoutSeconds <= 5
				? checkData.timeoutSeconds
				: 0;

		// Set the keys that may not be set (if the workers have never seen this check before)
		checkData.state =
			typeof checkData.state === 'string' && ['up', 'down'].indexOf(checkData.state) > -1
				? checkData.state
				: 'down';

		checkData.lastChecked =
			typeof checkData.lastChecked === 'number' && checkData.lastChecked > 0
				? checkData.lastChecked
				: 0;

		// If all the checks pass, pass the data along to the next step in the process
		if (
			checkData.id &&
			checkData.phone &&
			checkData.protocol &&
			checkData.url &&
			checkData.method &&
			checkData.successCodes &&
			checkData.timeoutSeconds
		) {
			this.performChecks(checkData);
		} else {
			debug('Error: One of the checks is not properly formatted. Skipping it.');
		}
	}

	// Lookup all the checks, get their data, send to a validator
	private async gatherAllChecks() {
		// Get all the check
		try {
			const folderList = await _data.list('checks');

			// Read  in the check data
			folderList.forEach((check) => {
				_data.read('checks', check, (err, data) => {
					const checkData = data as IChecksDataObject;
					if (!err && checkData) {
						// Pass it to the check validator, and let that function continue or log errors as needed
						this.validateCheckData(checkData);
					} else {
					}
				});
			});
		} catch (error) {
			debug(error as string);
		}
	}

	// Delete all expired tokens from file
	private async deleteExpiredTokens() {
		// Get all the token files
		try {
			const folderList = await _data.list('tokens');
			for (const token of folderList) {
				const tokenData: ITokenDataObject = await _data.read(
					'tokens',
					token,
					(err, data) => {}
				);

				if (tokenData.expires < Date.now()) {
					await _data.delete('tokens', token, (err) => {});
				}
			}
		} catch (error) {
			debug(error as string);
		}
	}

	// Time to execute the worker-process once per minute
	// TODO:
	private loop() {
		setInterval(() => {
			this.gatherAllChecks();
			this.deleteExpiredTokens();
		}, 1000 * 60);
	}

	// Rotate (compress) the log files
	private async rotateLogs() {
		// List all the (non compress) log files
		try {
			const folderList = await logs.list(false);

			for await (const logName of folderList) {
				// Compress the data to a different file
				const logId = logName.replace('.log', '');
				const newFileId = logId + '-' + Date.now().toString();

				await logs.compress(logId, newFileId);

				// Truncate the log
				await logs.truncate(logId);

				debug('Success truncating the log file');
			}

			debug('second');
		} catch (error) {
			debug(error as string);
		}
	}

	// Timer to execute the the log-rotation process once per day
	// TODO: modify the time
	private logRotationLoop() {
		setInterval(() => {
			this.rotateLogs();
		}, 1000 * 60 * 60 * 24);
	}

	// Init script
	public init() {
		// Send to console, in yellow
		debug('\x1b[33m%s\x1b[0m', 'Background workers are running');

		// Execute all the checks immediately
		this.gatherAllChecks();

		// Delete all the expired tokens immediately
		this.deleteExpiredTokens();

		// Call the loop so the checks will execute later
		this.loop();

		// Compress all the logs immediately
		this.rotateLogs();

		// Call the compression loop so logs will be compressed later on
		this.logRotationLoop();
	}
}

export default Workers.getInstance();

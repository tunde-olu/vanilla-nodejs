import * as crypto from 'node:crypto';
import config from './config.js';
import _data from './data.js';
import querystring from 'node:querystring';
import https, { RequestOptions } from 'node:https';
import path, { dirname } from 'path';
import { fileURLToPath } from 'node:url';
import fsPromises from 'node:fs/promises';

import type { IAsyncResponse, IHelpers, ITokenDataObject } from '../types/lib';
import FileSystemError from '../error/fileSystemError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Helpers implements IHelpers {
	private static _instance: Helpers;

	private constructor() {
		if (Helpers._instance) {
			throw new Error('Instantiation failed: Use Helpers.getInstance() instead of new');
		}
	}

	public static getInstance() {
		if (Helpers._instance) {
			return Helpers._instance;
		}
		Helpers._instance = new Helpers();
		return Helpers._instance;
	}

	/**
	 * Create a SHA256 hash
	 * @param str
	 * @returns {(boolean|string)} hashed password or string if @str type is not a string
	 */
	hash(str: string) {
		if (typeof str === 'string' && str.length > 0) {
			const hash = crypto
				.createHmac('sha256', config.hashingSecret)
				.update(str)
				.digest('hex');
			return hash;
		} else {
			return false;
		}
	}

	/**
	 * Parse a JSON string to an object in all cases, without throwing an error
	 * @param str
	 * @returns {(object)} Parsed JSON string if @str is valid or an empty {}
	 */
	parseJsonToObject(str: string) {
		try {
			const obj = JSON.parse(str);
			return obj;
		} catch (error) {
			return {};
		}
	}

	/**
	 * Create a string of random alphanumeric characters, of a given length
	 */
	createRandomString(strLen: number | boolean) {
		strLen = typeof strLen === 'number' && strLen > 0 ? strLen : false;

		if (strLen) {
			const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';

			let str = '';

			for (let i = 0; i < strLen; i++) {
				// Get random character from the possible characters string
				const random = Math.floor(Math.random() * alphanumeric.length);
				// Append this character to the final string
				str += alphanumeric.charAt(random);
			}

			return str;
		} else {
			return false;
		}
	}

	// Verify if a given token id currently valid for a given user
	public async verifyToken(id: string, phone: string, callback: (isTokenValid: boolean) => void) {
		// Lookup the token
		_data.read!('tokens', id, (err, data) => {
			const tokenData = data as ITokenDataObject;
			if (!err && data) {
				// Check that the token is for the given user and has not expired
				if (tokenData.phone === phone && tokenData.expires > Date.now()) {
					callback(true);
				} else {
					callback(false);
				}
			} else {
				callback(false);
			}
		});
	}

	/**
	 * sendTwilioSms - Send an SMS message via Twilio
	 */
	public sendTwilioSms(
		_phone: string,
		_msg: string,
		callback: (err: boolean, data: any) => void
	) {
		// Validate parameters
		// const phone = typeof _phone === 'string' && _phone.trim().length === 11 ? _phone : false;
		const phone = typeof _phone === 'string' && _phone.trim().length === 10 ? _phone : false;
		const msg =
			typeof _msg === 'string' && _msg.trim().length > 0 && _msg.length <= 1600
				? _msg
				: false;

		// Response to return if successful
		let successResponse: IAsyncResponse;

		if (phone && msg) {
			const payload = {
				From: config.twilio.fromPhone,
				// To: `+234${phone.slice(1)}`,
				To: `+1${phone}`,
				Body: msg,
			};

			// Stringify the payload
			const stringPayload = querystring.stringify(payload);

			// Configure the request details
			const requestDetails = {
				protocol: 'https:',
				hostname: 'api.twilio.com',
				method: 'POST',
				path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
				auth: `${config.twilio.accountSid}${config.twilio.authToken}`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(stringPayload),
				},
			};

			// Instantiate the request object
			const req = https.request(requestDetails, (res) => {
				console.log('connected');
				// Grab the status of the sent responses
				const status = res.statusCode;
				// Callback successfully if the request went through
				if (status === 200 || status === 201) {
					callback(false, 'Success');
				} else {
					callback(true, `Status code returned was ${status}`);
				}
			});

			// const url = 'https://pokeapi.co/api/v2/pokemon/ditto';
			// const reqDetails: RequestOptions = {
			// 	protocol: 'http:',
			// 	// method: 'GET',
			// 	hostname: 'pokeapi.co',
			// 	path: '/api/v2/pokemon/ditto',
			// 	headers: {
			// 		accept: 'application/json',
			// 	},
			// };

			// const req = https.get(reqDetails, async (res) => {
			// 	console.log('connected');
			// 	const status = res.statusCode;
			// 	if (status === 200 || status === 201) {
			// 		successResponse = {
			// 			code: status,
			// 			message: `Status code return was ${status}`,
			// 		} as IAsyncResponse;

			// 		let data: Buffer[] = [];

			// 		res.on('data', (chunk) => {
			// 			data.push(chunk);
			// 		});

			// 		res.on('end', () => {
			// 			successResponse = {
			// 				code: status,
			// 				message: `Status code return was ${status}`,
			// 			} as IAsyncResponse;

			// 			const pokemon = JSON.parse(Buffer.concat(data).toString());
			// 			callback(false, pokemon);
			// 		});
			// 	} else {
			// 		throw { code: 500, message: 'request rejected by Twilio' };
			// 	}
			// });

			// Bind to the error event so it doesn't get thrown
			req.on('error', (error) => {
				callback(true, error);
			});

			// Add the payload
			req.write(stringPayload);

			req.end(() => {
				console.log('req ended');
			});

			return successResponse!;
		} else {
			callback(true, 'Given parameters were missing or invalid');
		}
	}

	// Get the string content of a template
	public async getTemplate(templateName: string, data: { [index: string]: string }) {
		templateName = typeof templateName === 'string' ? templateName : '';
		data = typeof data === 'object' && data !== null ? data : {};
		try {
			const templatesDir = path.join(__dirname, '../templates/');
			const htmlString = await fsPromises.readFile(
				`${templatesDir}${templateName}.html`,
				'utf-8'
			);
			// Do interpolation on the string before returning it
			const finalString = this.interpolate(htmlString, data);
			return finalString;
			// throw 'A valid template was not specified';
		} catch (err) {
			const error = err as FileSystemError;
			console.log('\x1b[31m%s\x1b[0m', error.message);
			throw new FileSystemError((error as FileSystemError).message || (err as string));
		}
	}

	/**
	 * Add the universal header and footer to a string, and pas the provided data object to the header and the footer for interpolation
	 */
	public async addUniversalTemplates(str: string, data: { [index: string]: string }) {
		str = typeof str === 'string' ? str : '';
		data = typeof data === 'object' && data !== null ? data : {};

		// Get the header
		try {
			const headerString = await this.getTemplate('_header', data);
			const footerString = await this.getTemplate('_footer', data);
			// Add them all together
			const fullString = headerString + str + footerString;

			return fullString;
		} catch (error) {
			const err = error as FileSystemError;
			throw new FileSystemError(err.message || (error as string));
		}
	}

	/**
	 * Take a give string and a data object and find/replace all the keys within it
	 */
	public interpolate(str: string, data: { [index: string]: string }) {
		str = typeof str === 'string' ? str : '';
		data = typeof data === 'object' && data !== null ? data : {};
		// Add the templateGlobals to the data object, prepending their key name with "global"
		for (const key in config.templateGlobals) {
			if (config.templateGlobals.hasOwnProperty(key)) {
				data['global.' + key] = config.templateGlobals[key as string];
			}
		}

		// For each key in the data object, insert its value into the string at the corresponding placeholder
		for (const key in data) {
			if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
				const replace = data[key];
				const find = '{' + key + '}';
				str = str.replace(find, replace);
			}
		}

		return str;
	}

	/**
	 * getStaticAsset
	 * Get the contents of a static (public) asset
	 */
	public async getStaticAsset(filename: string) {
		try {
			if (typeof filename !== 'string') {
				throw 'A valid file name was not specified';
			}

			const publicDir = path.resolve(__dirname, '../public');
			const fileData = await fsPromises.readFile(publicDir + '/' + filename);
			return fileData;
		} catch (error) {
			if (typeof error === 'string') {
				throw error;
			} else {
				throw (error as FileSystemError).message || error;
			}
		}
	}

	public colors = {
		reset: '\x1b[0m',
		bright: '\x1b[1m',
		dim: '\x1b[2m',
		underscore: '\x1b[4m',
		blink: '\x1b[5m',
		reverse: '\x1b[7m',
		hidden: '\x1b[8m',

		fg: {
			black: '\x1b[30m',
			red: '\x1b[31m',
			green: '\x1b[32m',
			yellow: '\x1b[33m',
			blue: '\x1b[34m',
			magenta: '\x1b[35m',
			cyan: '\x1b[36m',
			white: '\x1b[37m',
			gray: '\x1b[90m',
			crimson: '\x1b[38m', // Scarlet
		},
		bg: {
			black: '\x1b[40m',
			red: '\x1b[41m',
			green: '\x1b[42m',
			yellow: '\x1b[43m',
			blue: '\x1b[44m',
			magenta: '\x1b[45m',
			cyan: '\x1b[46m',
			white: '\x1b[47m',
			gray: '\x1b[100m',
			crimson: '\x1b[48m',
		},
	};
}

export default Helpers.getInstance();

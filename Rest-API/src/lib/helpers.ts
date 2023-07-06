import * as crypto from 'crypto';
import config from './config.js';
import _data from './data.js';
import querystring from 'querystring';
import https, { RequestOptions } from 'https';

import type { IAsyncResponse, IHelpers, ITokenDataObject } from '../types/lib';

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
			console.log(alphanumeric.length);
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
				if (data.phone === phone && tokenData.expires > Date.now()) {
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
}

export default Helpers.getInstance();

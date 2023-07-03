import * as crypto from 'crypto';
import { IHelpers } from '../types/lib';
import config from './config.js';

// const helpers: IHelpers = {};
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
}

export default Helpers.getInstance();

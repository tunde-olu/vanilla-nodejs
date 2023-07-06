import userController from '../controllers/userController.js';
import checksController from '../controllers/checksController.js';
import type { CallbackFn, ICallbackData, IHandlers, RequestMethods } from '../types/index.js';
import _data from './data.js';
import tokenController from '../controllers/tokenController.js';

/**
 * Request handlers
 */

// Define the handlers
let handlers: IHandlers = {};

class Handlers implements IHandlers {
	private static _instance: Handlers;

	private constructor() {
		if (Handlers._instance) {
			throw new Error('Instantiation failed: Use Handlers.getInstance() instead of new.');
		}
	}

	public static getInstance() {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new Handlers();
		return this._instance;
	}

	// Users handler
	public users(data: ICallbackData, callback: CallbackFn) {
		const acceptableMethods: RequestMethods[] = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method as RequestMethods) > -1) {
			userController[data.method as RequestMethods](data, callback);
		} else {
			callback(405);
		}
	}

	// Tokens handler
	public tokens(data: ICallbackData, callback: CallbackFn) {
		const acceptableMethods: RequestMethods[] = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method as RequestMethods) > -1) {
			tokenController[data.method as RequestMethods](data, callback);
		} else {
			callback(405);
		}
	}

	public checks(data: ICallbackData, callback: CallbackFn) {
		const acceptableMethods: RequestMethods[] = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method as RequestMethods) > -1) {
			checksController[data.method as RequestMethods](data, callback);
		} else {
			callback(405);
		}
	}

	// Ping handler
	public ping(data: ICallbackData, callback: CallbackFn) {
		// Callback a http status code, and a payload object
		callback(200);
	}

	// Not found handler
	public notFound(data: ICallbackData, callback: CallbackFn) {
		callback(404);
	}
}

export default Handlers.getInstance();

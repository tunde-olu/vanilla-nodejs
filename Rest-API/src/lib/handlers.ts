import userController from '../controllers/userController.js';
import checksController from '../controllers/checksController.js';
import type {
	CallbackFn,
	HandlersFunction,
	ICallbackData,
	IHandlers,
	RequestMethods,
	contentType,
} from '../types/index.js';
import _data from './data.js';
import tokenController from '../controllers/tokenController.js';
import helpers from './helpers.js';
import FileSystemError from '../error/fileSystemError.js';

interface ICallbackArgs {
	statusCode: number;
	payload?: string | object;
	contentType: 'html' | 'json';
}

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

	////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////	HTML handlers	////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////

	/**
	 * Index Page
	 * @param data
	 * @param callback
	 */
	public async index(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Uptime Monitoring - Made Simple',
				'head.description':
					"We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we'll send you a text to let you know",
				'body.class': 'index',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('index', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Create Account
	 * @param data
	 * @param callback
	 */
	public async accountCreate(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Create an Account',
				'head.description': 'Signup is easy and only takes a few seconds.',
				'body.class': 'accountCreate',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('accountCreate', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Create New Session
	 * @param data
	 * @param callback
	 */
	public async sessionCreate(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Login to your account.',
				'head.description':
					'Please enter your phone number and password to access your account.',
				'body.class': 'sessionCreate',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('sessionCreate', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Session has been deleted
	 * @param data
	 * @param callback
	 */
	public async sessionDeleted(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Logged Out',
				'head.description': 'You have been logged out of your account.',
				'body.class': 'sessionDeleted',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('sessionDeleted', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Edit your account
	 * @param data
	 * @param callback
	 */
	public async accountEdit(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Account Settings',
				'body.class': 'accountEdit',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('accountEdit', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Account has been deleted
	 * @param data
	 * @param callback
	 */
	public async accountDeleted(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Account Deleted',
				'head.description': 'Your account has been deleted.',
				'body.class': 'accountDeleted',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('accountDeleted', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Create a new check
	 * @param data
	 * @param callback
	 */
	public async checkCreate(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Create a New Check',
				'body.class': 'checksCreate',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('checksCreate', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Dashboard (view all checks)
	 * @param data
	 * @param callback
	 */
	public async checksList(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Dashboard',
				'body.class': 'checksList',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('checksList', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Edit a check
	 * @param data
	 * @param callback
	 */
	public async checksEdit(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET

		if (data.method === 'get') {
			// Prepare data for interpolation
			const templateData = {
				'head.title': 'Check Detail',
				'body.class': 'checksEdit',
			};

			// Read in a template as a string
			try {
				const htmlString = await helpers.getTemplate('checksEdit', templateData);
				// Add the universal header and the footer
				const fullString = await helpers.addUniversalTemplates(htmlString, templateData);
				callback(200, fullString, 'html');
			} catch (error) {
				callback(500, undefined, 'html');
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Favicon
	 */
	public async favicon(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET
		if (data.method === 'get') {
			try {
				// Read in the favicon's data
				const faviconData = await helpers.getStaticAsset('favicon.ico');
				callback(200, undefined, 'favicon');
			} catch (error) {
				callback(500);
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * Public assets
	 */
	public async public(data: ICallbackData, callback: CallbackFn) {
		// Reject any method that isn't a GET
		if (data.method === 'get') {
			// Get the filename being requested
			const trimmedAssetName = data.trimmedPath?.replace('public/', '');

			if (trimmedAssetName && trimmedAssetName.length > 0) {
				try {
					// Read in the favicon's data
					const publicData = await helpers.getStaticAsset(trimmedAssetName);
					// Determine the content type (default to plain text)
					let contentType: contentType = 'plain';

					if (trimmedAssetName.endsWith('.css')) {
						contentType = 'css';
					}

					if (trimmedAssetName.endsWith('.png')) {
						contentType = 'png';
					}

					if (trimmedAssetName.endsWith('.jpg')) {
						contentType = 'jpg';
					}

					if (trimmedAssetName.endsWith('.ico')) {
						contentType = 'favicon';
					}

					callback(200, publicData, contentType);
				} catch (error) {
					callback(500);
				}
			} else {
				callback(404);
			}
		} else {
			callback(405, undefined, 'html');
		}
	}

	/**
	 * JSON API handlers
	 *
	 */

	// Example Error
	public exampleError(data: ICallbackData, callback: CallbackFn) {
		const err = new Error('This is an example error');
		throw err;
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

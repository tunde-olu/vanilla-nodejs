import type {
	CallbackFn,
	HandlersFunction,
	ICallbackData,
	IHandlers,
	RequestMethods,
} from '../types/index.js';
import type { ITokenDataObject, IUserDataObject, TFsError } from '../types/lib.js';
import _data from './data.js';
import helpers from './helpers.js';

/**
 * Request handlers
 */

// Define the handlers
let handlers: IHandlers = {};

class Handlers implements IHandlers {
	private static _instance: Handlers;

	private constructor() {
		if (Handlers._instance) {
			throw new Error('Instantiation failed: Use Handler.getInstance() instead of new.');
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
	users(data: ICallbackData, callback: CallbackFn) {
		const acceptableMethods: RequestMethods[] = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method as RequestMethods) > -1) {
			UserRequestMethods.getInstance()[data.method as RequestMethods](data, callback);
		} else {
			callback(405);
		}
	}

	// Tokens handler
	tokens(data: ICallbackData, callback: CallbackFn) {
		const acceptableMethods: RequestMethods[] = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method as RequestMethods) > -1) {
			TokenRequestMethods.getInstance()[data.method as RequestMethods](data, callback);
		} else {
			callback(405);
		}
	}

	// Ping handler
	ping(data: ICallbackData, callback: CallbackFn) {
		// Callback a http status code, and a payload object
		callback(200);
	}

	// Not found handler
	notFound(data: ICallbackData, callback: CallbackFn) {
		callback(404);
	}
}

class UserRequestMethods implements Record<RequestMethods, HandlersFunction> {
	private static _instance: UserRequestMethods;

	private constructor() {
		if (UserRequestMethods._instance) {
			throw new Error(
				'Instantiation failed: Use UserRequestMethods.getInstance() instead of new.'
			);
		}
	}

	// Verify if a given token id currently valid for a given user
	verifyToken = function (id: string, phone: string, callback: (isTokenValid: boolean) => void) {
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
	};

	public static getInstance(): UserRequestMethods {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new UserRequestMethods();
		return this._instance;
	}

	// Users - Post
	// Required data: firstName, lastName, phone, password, tosAgreement
	// Optional data: none
	post(data: ICallbackData, callback: CallbackFn) {
		// Check that all required fields are filled out

		// Check if first name is provided
		const firstName =
			typeof data.payload?.firstName === 'string' && data.payload.firstName.trim().length > 0
				? data.payload.firstName.trim()
				: false;

		// Check is lastName is provided
		const lastName =
			typeof data.payload?.lastName === 'string' && data.payload.lastName.trim().length > 0
				? data.payload.lastName.trim()
				: false;

		// Check if phone length equals 11
		const phone =
			typeof data.payload?.phone === 'string' && data.payload.phone.trim().length === 11
				? data.payload.phone.trim()
				: false;

		// Check if password length is greater than 8
		const password =
			typeof data.payload?.password === 'string' && data.payload.password.trim().length > 8
				? data.payload.password
				: false;

		// Check tosAgreement
		const tosAgreement =
			typeof data.payload?.tosAgreement === 'boolean' && data.payload.tosAgreement && true
				? true
				: false;

		if (firstName && lastName && phone && password && tosAgreement) {
			// Make sure that the user doesn't already exist
			_data.read!('users', phone, (err, data) => {
				if (err) {
					// Hash the password
					const hashedPassword = helpers.hash!(password);

					if (hashedPassword) {
						// Create the user object
						const userObject = {
							firstName,
							lastName,
							phone,
							hashedPassword,
							tosAgreement,
						};

						// Store the user
						_data.create!('users', phone, userObject, (err) => {
							if (!err) {
								callback(200, { firstName, lastName, phone });
							} else {
								console.log(err);
								callback(500, { Error: 'Could not create the new user' });
							}
						});
					} else {
						callback(500, { Error: "Could not hash the user's password" });
					}
				} else {
					callback(400, { Error: 'A user with that phone number already exists' });
				}
			});
		} else {
			callback(400, { Error: 'missing required fields' });
		}
	}

	/**
	 * User - GET
	 * Required data: phone
	 * Optional data: none
	 */
	get(data: ICallbackData, callback: CallbackFn) {
		// Check that the phone number is valid
		const phone =
			typeof data.queryStringObject?.phone === 'string' &&
			data.queryStringObject.phone.trim().length === 11
				? data.queryStringObject.phone
				: false;

		if (phone) {
			// Get the token from the headers
			const token =
				typeof data.headers?.authorization === 'string' &&
				data.headers.authorization.startsWith('Bearer')
					? data.headers.authorization.split(' ')[1]
					: false;

			// Verify that the given token is valid for the phone number
			if (token) {
				this.verifyToken(token, phone, (tokenIsValid) => {
					if (tokenIsValid) {
						// Lookup the user
						_data.read!('users', phone, (err, data) => {
							if (!err && data) {
								// Remove the hashed password from the user object
								delete (data as IUserDataObject).hashedPassword;
								callback(200, data);
							} else {
								callback(404, { Error: 'Not Found' });
							}
						});
					} else {
						callback(403, { Error: 'Token is invalid' });
					}
				});
			} else {
				callback(403, { Error: 'Missing Bearer token in Authorization header' });
			}
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}

	/**
	 * Users - PUT
	 * Required data - phone
	 * Optional data - firstName, lastName, Password (at least one must be provided)
	 */
	put(data: ICallbackData, callback: CallbackFn) {
		const { firstName, lastName, password } = data.payload as IUserDataObject;

		const phone =
			typeof data.queryStringObject?.phone === 'string' &&
			data.queryStringObject.phone.trim().length === 11
				? data.queryStringObject.phone
				: false;

		if (phone) {
			// Get the token from the headers
			const token =
				typeof data.headers?.authorization === 'string' &&
				data.headers.authorization.startsWith('Bearer')
					? data.headers.authorization.split(' ')[1]
					: false;
			if (token) {
				this.verifyToken(token, phone, (tokenIsValid) => {
					if (tokenIsValid) {
						const payloadObject: IUserDataObject = {};

						// Check for the optional fields
						if (firstName) {
							payloadObject.firstName = firstName;
						}

						if (lastName) {
							payloadObject.lastName = lastName;
						}

						if (password) {
							const hashedPassword = helpers.hash(password);
							if (typeof hashedPassword === 'string') {
								payloadObject.hashedPassword = hashedPassword;
							} else {
								callback(400, { Error: 'Something went wrong' });
							}
						}

						// Error if nothing is sent to update
						if (Object.keys(payloadObject).length === 0) {
							callback(400, { Error: 'No data provided to update' });
							return;
						}

						// Update the user data if it exists on the fs DB
						_data.update!('users', phone, payloadObject, (err) => {
							if (!err) {
								delete payloadObject.hashedPassword;
								callback(200, { status: 'Success', ...payloadObject });
							} else {
								if ((err as TFsError).code === 'ENOENT') {
									callback(404, { Error: 'No user found with the phone number' });
								} else {
									callback(500, { Error: 'Something went wrong' });
								}
							}
						});
					} else {
						callback(403, { Error: 'Token is invalid' });
					}
				});
			} else {
				callback(403, { Error: 'Missing Bearer token in Authorization header' });
			}
		} else {
			// Error if phone is invalid
			callback(400, { Error: 'Missing required field' });
		}
	}

	/**
	 * Users - DELETE
	 * Required field: phone
	 * Optional: none
	 * TODO: Cleanup (delete) any other data files associated with this user
	 */
	delete(data: ICallbackData, callback: CallbackFn) {
		// Check that the phone number is valid
		const phone =
			typeof data.queryStringObject?.phone === 'string' &&
			data.queryStringObject.phone.trim().length === 11
				? data.queryStringObject.phone
				: false;

		if (phone) {
			// Get the token from the headers
			const token =
				typeof data.headers?.authorization === 'string' &&
				data.headers.authorization.startsWith('Bearer')
					? data.headers.authorization.split(' ')[1]
					: false;
			if (token) {
				this.verifyToken(token, phone, (tokenIsValid) => {
					if (tokenIsValid) {
						// Lookup the user
						_data.delete!('users', phone, (err) => {
							if (!err) {
								callback(200, {
									status: 'Success',
									message: 'User successfully deleted',
								});
							} else {
								if ((err as TFsError).code === 'ENOENT') {
									callback(404, { Error: 'No user with the phone number' });
								} else {
									callback(500, {
										Error: 'Something went wrong, could not delete the specified user',
									});
								}
							}
						});
					} else {
						callback(403, { Error: 'Token is invalid' });
					}
				});
			} else {
				callback(403, { Error: 'Missing Bearer token in Authorization header' });
			}
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}
}

class TokenRequestMethods implements Record<RequestMethods, HandlersFunction> {
	private static _instance: TokenRequestMethods;

	private constructor() {
		if (TokenRequestMethods._instance) {
			throw new Error(
				'Instantiation failed. User TokenRequestMethods.getInstance() instead of new.'
			);
		}
	}

	public static getInstance(): TokenRequestMethods {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new TokenRequestMethods();
		return this._instance;
	}

	/**
	 * Tokens - POST
	 * Required data: phone, password
	 * @param data
	 * @param callback
	 */
	post(data: ICallbackData, callback: CallbackFn) {
		const phone =
			typeof data.payload?.phone === 'string' && data.payload.phone.trim().length === 11
				? data.payload.phone.trim()
				: false;

		const password =
			typeof data.payload?.password === 'string' && data.payload.password.trim().length > 8
				? data.payload.password
				: false;

		if (phone && password) {
			// Look up the user who matches the phone number
			_data.read!('users', phone, (err, data) => {
				const userData = data as IUserDataObject;
				if (!err && data) {
					// Hash the sent password and compare it to the password stored in the usr object
					const hashedPassword = helpers.hash!(password);
					if (hashedPassword === userData.hashedPassword!) {
						// If valid, create a new token with a random name. Set expiration dare 1 hour in the future
						const tokenId = helpers.createRandomString(20);

						const expires = Date.now() + 1000 * 60 * 60;
						const tokenObject = {
							phone,
							expires,
							id: tokenId,
						};
						// Store the token
						_data.create!('tokens', tokenId as string, tokenObject, (err) => {
							if (!err) {
								callback(200, tokenObject);
							} else {
								callback(500, { Error: 'Could not create the new token' });
							}
						});
					} else {
						callback(400, {
							Error: "Password did not match the specified user's stored password",
						});
					}
				} else {
					if ((err as TFsError).code === 'ENOENT') {
						callback(404, { Error: 'No user found with the phone number' });
					} else {
						callback(500, { Error: 'Something went wrong' });
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required field(s)!' });
		}
	}

	/**
	 * Token - GET
	 * Required data: id
	 * Optional data: none
	 * @param data
	 * @param callback
	 */
	get(data: ICallbackData, callback: CallbackFn) {
		// Check that the id is valid
		// Check that the phone number is valid
		const id =
			typeof data.queryStringObject?.id === 'string' &&
			data.queryStringObject.id.trim().length === 20
				? data.queryStringObject.id
				: false;

		if (id) {
			// Lookup the token
			_data.read!('tokens', id, (err, data) => {
				if (!err && data) {
					callback(200, data);
				} else {
					if ((err as TFsError).code === 'ENOENT') {
						callback(404, { Error: 'Not Found' });
					} else {
						callback(500, { Error: 'Something went wrong' });
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}

	/**
	 * Tokens - PUT
	 * Required data : id, extend
	 * Optional data : none
	 * @param data
	 * @param callback
	 */
	put(data: ICallbackData, callback: CallbackFn) {
		const id =
			typeof data.payload?.id === 'string' && data.payload.id.length === 20
				? data.payload.id
				: false;
		const extend =
			typeof data.payload?.extend === 'boolean' && data.payload.extend === true
				? true
				: false;

		if (id && extend) {
			// Look up the token
			_data.read!('tokens', id, (err, data) => {
				if (!err) {
					// Check to make sure the token isn't already expired
					if ((data as ITokenDataObject).expires > Date.now()) {
						// Set the expiration an hour from now
						const expires = Date.now() + 1000 * 60 * 60;

						// Store the new updates
						_data.update!('tokens', id, { expires }, (err) => {
							if (!err) {
								callback(200);
							} else {
								if ((err as TFsError).code === 'ENOENT') {
									callback(404, { Error: 'Not Found' });
								} else {
									callback(500, {
										Error: "Could not update the token's expiration",
									});
								}
							}
						});
					} else {
						callback(400, { Error: 'The token has expired, and cannot be extended' });
					}
				} else {
					if ((err as TFsError).code === 'ENOENT') {
						callback(404, { Error: 'Specified token does not exist' });
					} else {
						callback(500, { Error: 'Something went wrong' });
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required field(s) or field(s) are invalid' });
		}
	}

	/**
	 * Token - DELETE
	 * Required data: id
	 * Optional data : none
	 * @param data
	 * @param callback
	 */
	delete(data: ICallbackData, callback: CallbackFn) {
		// Check that the phone number is valid
		const id =
			typeof data.queryStringObject?.id === 'string' &&
			data.queryStringObject.id.trim().length === 20
				? data.queryStringObject.id
				: false;

		if (id) {
			// Lookup the user
			_data.delete!('tokens', id, (err) => {
				if (!err) {
					callback(200, { status: 'Success', message: 'Token successfully deleted' });
				} else {
					if ((err as TFsError).code === 'ENOENT') {
						callback(404, { Error: 'Not Found' });
					} else {
						callback(500, {
							Error: 'Something went wrong, could not delete the specified token',
						});
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}
}

// Tokens handler
handlers.tokens = function (data, callback) {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method!) > -1) {
		handlers._tokens![data.method as RequestMethods](data, callback);
	} else {
		callback(405);
	}
};

export default Handlers.getInstance();

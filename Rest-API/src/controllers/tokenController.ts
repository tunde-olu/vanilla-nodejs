import _data from '../lib/data.js';
import helpers from '../lib/helpers.js';

import type {
	CallbackFn,
	HandlersFunction,
	ICallbackData,
	RequestMethods,
} from '../types/index.js';
import type { ITokenDataObject, IUserDataObject, TFsError } from '../types/lib.js';

class TokenController implements Record<RequestMethods, HandlersFunction> {
	private static _instance: TokenController;

	private constructor() {
		if (TokenController._instance) {
			throw new Error(
				'Instantiation failed. User TokenController.getInstance() instead of new.'
			);
		}
	}

	public static getInstance(): TokenController {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new TokenController();
		return this._instance;
	}

	/**
	 * Tokens - POST
	 * Required data: phone, password
	 * @param data
	 * @param callback
	 */
	public post(data: ICallbackData, callback: CallbackFn) {
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
					const hashedPassword = helpers.hash(password);
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
	public get(data: ICallbackData, callback: CallbackFn) {
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
	public put(data: ICallbackData, callback: CallbackFn) {
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
	public delete(data: ICallbackData, callback: CallbackFn) {
		// Check that the id is valid
		const id =
			typeof data.queryStringObject?.id === 'string' &&
			data.queryStringObject.id.trim().length === 20
				? data.queryStringObject.id
				: false;

		if (id) {
			// Delete the token data
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

export default TokenController.getInstance();

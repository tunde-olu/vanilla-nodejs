import _data from '../lib/data.js';
import helpers from '../lib/helpers.js';

import type {
	CallbackFn,
	HandlersFunction,
	ICallbackData,
	RequestMethods,
} from '../types/index.js';
import type { ITokenDataObject, IUserDataObject, TFsError } from '../types/lib.js';

class UserController implements Record<RequestMethods, HandlersFunction> {
	private static _instance: UserController;

	private constructor() {
		if (UserController._instance) {
			throw new Error(
				'Instantiation failed: Use UserController.getInstance() instead of new.'
			);
		}
	}

	public static getInstance(): UserController {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new UserController();
		return this._instance;
	}

	// Users - Post
	// Required data: firstName, lastName, phone, password, tosAgreement
	// Optional data: none
	public post(data: ICallbackData, callback: CallbackFn) {
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

	// User - GET
	// Required data: phone
	// Optional data: none
	public get(data: ICallbackData, callback: CallbackFn) {
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
				helpers.verifyToken(token, phone, (tokenIsValid) => {
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
	public put(data: ICallbackData, callback: CallbackFn) {
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
				helpers.verifyToken(token, phone, (tokenIsValid) => {
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

	// Users - DELETE
	// Required field: phone
	// Optional: none
	// TODO: Cleanup (delete) any other data files associated with this user
	public delete(data: ICallbackData, callback: CallbackFn) {
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
				helpers.verifyToken(token, phone, (tokenIsValid) => {
					if (tokenIsValid) {
						// Lookup the user
						_data.read('users', phone, (err, _userData) => {
							const userData = _userData as IUserDataObject;
							if (!err && userData) {
								_data.delete!('users', phone, (err) => {
									if (!err) {
										// Delete each of the checks associated with the user
										const userChecks =
											typeof userData?.checks === 'object' &&
											userData.checks instanceof Array
												? userData.checks
												: [];
										const checksToDelete = userChecks.length;
										if (checksToDelete > 0) {
											let checksDeleted: number = 0;
											let deletionErrors: boolean = false;

											// Loop through the checks
											userChecks.forEach((checkId) => {
												_data.delete('checks', checkId, (err) => {
													if (err) {
														deletionErrors = deletionErrors
															? true
															: !!err;
													}
													checksDeleted++;
													if (checksDeleted === checksToDelete) {
														if (deletionErrors) {
															callback(500, {
																Error: "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully",
															});
														}
													}
												});
											});
										}
										callback(200, {
											status: 'Success',
											message: 'User successfully deleted',
										});
									} else {
										callback(500, {
											Error: 'Something went wrong, could not delete the specified user',
										});
									}
								});
							} else {
								if ((err as TFsError).code === 'ENOENT') {
									callback(404, { Error: 'No user with the phone number' });
								} else {
									callback(500, {
										Error: 'Something went wrong, try again',
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

export default UserController.getInstance();

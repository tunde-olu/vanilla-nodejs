import config from '../lib/config.js';
import _data from '../lib/data.js';
import helpers from '../lib/helpers.js';
import dns from 'node:dns';

import type {
	CallbackFn,
	HandlersFunction,
	ICallbackData,
	RequestMethods,
} from '../types/index.js';
import type {
	IChecksDataObject,
	ITokenDataObject,
	IUserDataObject,
	TFsError,
} from '../types/lib.js';

class ChecksController implements Record<RequestMethods, HandlersFunction> {
	private static _instance: ChecksController;

	private constructor() {
		if (ChecksController._instance) {
			throw new Error(
				'Instantiation failed: Use ChecksController.getInstance() instead of new.'
			);
		}
	}

	public static getInstance() {
		if (ChecksController._instance) {
			return ChecksController._instance;
		}

		ChecksController._instance = new ChecksController();
		return ChecksController._instance;
	}

	/**
	 * Checks - POST
	 * Required data: protocol, url, method, successCodes, timeoutSeconds
	 * Optional data: none
	 * @access private
	 */
	post(data: ICallbackData, callback: CallbackFn) {
		// Validate inputs

		const protocol =
			typeof data.payload?.protocol === 'string' &&
			['http', 'https'].indexOf(data.payload.protocol) > -1
				? data.payload.protocol
				: false;

		const url =
			typeof data.payload?.url === 'string' && data.payload.url.trim().length > 0
				? data.payload.url
				: false;

		const method =
			typeof data.payload?.method === 'string' &&
			['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1
				? data.payload.method
				: false;

		const successCodes =
			typeof data.payload.successCodes === 'object' &&
			data.payload.successCodes instanceof Array &&
			data.payload.successCodes.length > 0
				? data.payload.successCodes
				: false;

		const timeoutSeconds =
			typeof data.payload?.timeoutSeconds === 'number' &&
			data.payload.timeoutSeconds >= 1 &&
			data.payload.timeoutSeconds <= 5
				? data.payload.timeoutSeconds
				: false;

		if (protocol && url && method && successCodes && timeoutSeconds) {
			// Get the token from the headers
			const token =
				typeof data.headers?.authorization === 'string' &&
				data.headers.authorization.startsWith('Bearer')
					? data.headers.authorization.split(' ')[1]
					: false;

			// TODO: verify user token before proceeding

			// Lookup the user by reading the token
			_data.read('tokens', token as string, (err, data) => {
				const tokenData = data as ITokenDataObject;
				if (!err) {
					const phone = tokenData.phone;

					// Lookup the user tokenData
					_data.read('users', phone as string, (err, data) => {
						const userData: IUserDataObject = data as IUserDataObject;
						if (!err) {
							const userChecks =
								typeof userData?.checks === 'object' &&
								userData.checks instanceof Array
									? userData.checks
									: [];

							// Verify that the user has less than the number of max-checks-per-user
							if (userChecks.length < config.maxChecks) {
								// Verify that the URL given has DNS entries (and therefore can resolve)
								const parseUrl = new URL(protocol + '://' + url);
								const hostname =
									typeof parseUrl.hostname === 'string' ? parseUrl.hostname : '';

								dns.resolve(hostname, (err, records) => {
									if (!err && records) {
										// Create a random id for the check
										const checkId = helpers.createRandomString(20) as string;

										// Create the check object and include the user phone
										const checkObject = {
											id: checkId,
											phone,
											protocol,
											url,
											method,
											successCodes,
											timeoutSeconds,
										};

										// Save the object
										_data.create(
											'checks',
											checkId as string,
											checkObject,
											(err) => {
												if (!err) {
													// Add the checkId to the user's object
													userData.checks = userChecks;
													userData.checks.push(checkId);
													_data.update(
														'users',
														phone as string,
														{ checks: userData.checks },
														(err) => {
															if (!err) {
																callback(200, checkObject);
															} else {
																callback(500, {
																	Error: 'Could not update the user with the new check',
																});
															}
														}
													);
												} else {
													if ((err as TFsError).code === 'ENOENT') {
														callback(404, {
															Error: 'Not storage found',
														});
													} else {
														callback(500, {
															Error: 'Could not create the new check',
														});
													}
												}
											}
										);
									} else {
										callback(400, {
											Error: 'The hostname of the URL entered did not resolve to any DNS entries',
										});
									}
								});
							} else {
								callback(400, {
									Error: `The user already has the maximum number of checks (${config.maxChecks})`,
								});
							}
						} else {
							if ((err as TFsError).code === 'ENOENT') {
								callback(404, { Error: 'No user with the phone number' });
							} else {
								callback(403, {
									Error: "You're not authorized to access the requested data",
								});
							}
						}
					});
				} else {
					if ((err as TFsError).code === 'ENOENT') {
						callback(404, { Error: 'Token no valid' });
					} else {
						callback(500, { Error: 'Something went wrong' });
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required inputs, or inputs are invalid' });
		}
	}

	/**
	 * Checks - GET
	 * Required data : id
	 * Optional data : none
	 * @access private
	 */
	get(data: ICallbackData, callback: CallbackFn) {
		// Check that the id is valid
		const id =
			typeof data.queryStringObject?.id === 'string' &&
			data.queryStringObject.id.trim().length === 20
				? data.queryStringObject.id
				: false;

		if (id) {
			// Lookup the check
			_data.read('checks', id, (err, checkData) => {
				if (!err && checkData) {
					// Get the token from the headers
					const token =
						typeof data.headers?.authorization === 'string' &&
						data.headers.authorization.startsWith('Bearer')
							? data.headers.authorization.split(' ')[1]
							: false;

					// Verify that the given token is valid and belongs to the user who created the check
					if (token) {
						helpers.verifyToken(
							token,
							(checkData as IChecksDataObject).phone as string,
							(isTokenValid) => {
								if (isTokenValid) {
									// Return the check data
									callback(200, checkData);
								} else {
									callback(403, { Error: 'Token is invalid' });
								}
							}
						);
					} else {
						callback(403, { Error: 'Missing Bearer token in Authorization header' });
					}
				} else {
					callback(404, { Error: 'No check object found for the id provided' });
				}
			});
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}

	/**
	 * Checks - PUT
	 * Required data : id
	 * Optional data : protocol, url, method, successCodes, timeoutSeconds (at least one must be sent)
	 * @access private
	 */
	put(data: ICallbackData, callback: CallbackFn) {
		// Check for required field
		const id =
			typeof data.queryStringObject?.id === 'string' &&
			data.queryStringObject.id.trim().length === 20
				? data.queryStringObject.id
				: false;

		// Check for optional field
		const protocol =
			typeof data.payload?.protocol === 'string' &&
			['http', 'https'].indexOf(data.payload.protocol) > -1
				? data.payload.protocol
				: false;

		const url =
			typeof data.payload?.url === 'string' && data.payload.url.trim().length > 0
				? data.payload.url
				: false;

		const method =
			typeof data.payload?.method === 'string' &&
			['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1
				? data.payload.method
				: false;

		const successCodes =
			typeof data.payload.successCodes === 'object' &&
			data.payload.successCodes instanceof Array &&
			data.payload.successCodes.length > 0
				? data.payload.successCodes
				: false;

		const timeoutSeconds =
			typeof data.payload?.timeoutSeconds === 'number' &&
			data.payload.timeoutSeconds >= 1 &&
			data.payload.timeoutSeconds <= 5
				? data.payload.timeoutSeconds
				: false;

		// Check to make sure id is valid
		if (id) {
			if (protocol || url || method || successCodes || timeoutSeconds) {
				// Lookup the check
				_data.read('checks', id, (err, _checkData) => {
					const checkData = _checkData as IChecksDataObject;
					if (!err && checkData) {
						// Get the token from the headers
						const token =
							typeof data.headers?.authorization === 'string' &&
							data.headers.authorization.startsWith('Bearer')
								? data.headers.authorization.split(' ')[1]
								: false;

						// Verify that the given token is valid and belongs to the user who created the check
						if (token) {
							helpers.verifyToken(
								token,
								checkData.phone as string,
								(isTokenValid) => {
									if (isTokenValid) {
										checkData.method = method || checkData.method;
										checkData.url = url || checkData.url;
										checkData.protocol = protocol || checkData.protocol;
										checkData.successCodes =
											successCodes || checkData.successCodes;
										checkData.timeoutSeconds =
											timeoutSeconds || checkData.timeoutSeconds;

										// Store the new updated data
										_data.update('checks', id, checkData, (err) => {
											if (!err) {
												callback(200, checkData);
											} else {
												callback(500, {
													Error: 'Something went wrong, could not update the check',
												});
											}
										});
									} else {
										callback(403, { Error: 'Token is invalid' });
									}
								}
							);
						} else {
							callback(403, {
								Error: 'Missing Bearer token in Authorization header',
							});
						}
					} else {
						if ((err as TFsError).code === 'ENOENT') {
							callback(404, { Error: 'Check ID did not exist' });
						} else {
							callback(500, { Error: 'Something went wrong' });
						}
					}
				});
			} else {
				callback(400, { Error: 'Missing fields to update' });
			}
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}

	/**
	 * Checks - DELETE
	 * Required data : id
	 * Optional data : none
	 * @access private
	 */
	delete(data: ICallbackData, callback: CallbackFn) {
		// Check that the id is valid
		const id =
			typeof data.queryStringObject?.id === 'string' &&
			data.queryStringObject.id.trim().length === 20
				? data.queryStringObject.id
				: false;

		if (id) {
			// Lookup the check
			_data.read('checks', id, (err, _checkData) => {
				const checkData = _checkData as IChecksDataObject;
				if (!err && checkData) {
					// Get the token from the headers
					const token =
						typeof data.headers?.authorization === 'string' &&
						data.headers.authorization.startsWith('Bearer')
							? data.headers.authorization.split(' ')[1]
							: false;

					const phone = checkData.phone as string;

					if (token) {
						helpers.verifyToken(token, phone, (tokenIsValid) => {
							if (tokenIsValid) {
								// Delete the check data
								_data.delete!('checks', id, (err) => {
									if (!err) {
										// Lookup the user
										_data.read!('users', phone, (err, _userData) => {
											const userData = _userData as IUserDataObject;
											if (!err && userData) {
												const userChecks =
													typeof userData?.checks === 'object' &&
													userData.checks instanceof Array
														? userData.checks
														: [];

												// Remove the deleted check from their list of checks
												const checkPosition = userChecks.indexOf(id);
												if (checkPosition > -1) {
													userChecks.splice(checkPosition, 1);

													// Re-save the user data
													_data.update(
														'users',
														phone,
														userData,
														(err) => {
															if (!err) {
																delete userData.hashedPassword;
																callback(200, userData);
															} else {
																callback(500, {
																	Error: 'Could not update the user',
																});
															}
														}
													);
												} else {
													callback(500, {
														Error: 'Could not find the check on the users object, so could not remove it',
													});
												}
											} else {
												callback(500, {
													Error: 'Could not find the user who created the check, so could not remove the check from the list of checks on the user object',
												});
											}
										});

										// callback(200, {
										// 	status: 'Success',
										// 	message: 'Check successfully deleted',
										// });
									} else {
										if ((err as TFsError).code === 'ENOENT') {
											callback(404, {
												Error: 'The specified check ID does not exist',
											});
										} else {
											callback(500, {
												Error: 'Something went wrong, could not delete the specified check',
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
					if ((err as TFsError).code === 'ENOENT') {
						callback(404, { Error: 'The specified check ID does not exist' });
					} else {
						callback(500, {
							Error: 'Something went wrong, could not delete the specified check',
						});
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required field' });
		}
	}
}

export default ChecksController.getInstance();

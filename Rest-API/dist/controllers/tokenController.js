import _data from '../lib/data.js';
import helpers from '../lib/helpers.js';
import { performance } from 'node:perf_hooks';
import util from 'node:util';
const debug = util.debuglog('performance');
class TokenController {
    static _instance;
    constructor() {
        if (TokenController._instance) {
            throw new Error('Instantiation failed. User TokenController.getInstance() instead of new.');
        }
    }
    static getInstance() {
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
    post(data, callback) {
        performance.mark('entered function');
        const phone = typeof data.payload?.phone === 'string' && data.payload.phone.trim().length === 11
            ? data.payload.phone.trim()
            : false;
        const password = typeof data.payload?.password === 'string' && data.payload.password.trim().length > 8
            ? data.payload.password
            : false;
        performance.mark('input validated');
        if (phone && password) {
            // Look up the user who matches the phone number
            performance.mark('beginning user lookup');
            _data.read('users', phone, (err, data) => {
                performance.mark('user lookup complete');
                const userData = data;
                if (!err && data) {
                    // Hash the sent password and compare it to the password stored in the usr object
                    performance.mark('beginning password hashing');
                    const hashedPassword = helpers.hash(password);
                    performance.mark('password hashing complete');
                    if (hashedPassword === userData.hashedPassword) {
                        // If valid, create a new token with a random name. Set expiration dare 1 hour in the future
                        performance.mark('creating data for token');
                        const tokenId = helpers.createRandomString(20);
                        const expires = Date.now() + 1000 * 60 * 60;
                        const tokenObject = {
                            phone,
                            expires,
                            id: tokenId,
                        };
                        // Store the token
                        performance.mark('beginning storing token');
                        _data.create('tokens', tokenId, tokenObject, (err) => {
                            performance.mark('storing token complete');
                            // Gather all the measurements
                            performance.measure('Beginning to end', 'entered function', 'storing token complete');
                            performance.measure('Validating user input', 'entered function', 'input validated');
                            performance.measure('User lookup', 'beginning user lookup', 'user lookup complete');
                            performance.measure('Password hashing', 'beginning password hashing', 'password hashing complete');
                            performance.measure('Token data creation', 'creating data for token', 'beginning storing token');
                            performance.measure('Token storing', 'beginning storing token', 'storing token complete');
                            // Log out all the measurements
                            const measurements = performance.getEntriesByType('measure');
                            measurements.forEach((measurement) => {
                                debug('\x1b[33m%s\x1b[0m', `${measurement.name} ${measurement.duration}`);
                            });
                            if (!err) {
                                callback(200, tokenObject);
                            }
                            else {
                                callback(500, { Error: 'Could not create the new token' });
                            }
                        });
                    }
                    else {
                        callback(400, {
                            Error: "Password did not match the specified user's stored password",
                        });
                    }
                }
                else {
                    if (err.code === 'ENOENT') {
                        callback(404, { Error: 'No user found with the phone number' });
                    }
                    else {
                        callback(500, { Error: 'Something went wrong' });
                    }
                }
            });
        }
        else {
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
    get(data, callback) {
        // Check that the id is valid
        // Check that the phone number is valid
        const id = typeof data.queryStringObject?.id === 'string' &&
            data.queryStringObject.id.trim().length === 20
            ? data.queryStringObject.id
            : false;
        if (id) {
            // Lookup the token
            _data.read('tokens', id, (err, data) => {
                if (!err && data) {
                    callback(200, data);
                }
                else {
                    if (err.code === 'ENOENT') {
                        callback(404, { Error: 'Not Found' });
                    }
                    else {
                        callback(500, { Error: 'Something went wrong' });
                    }
                }
            });
        }
        else {
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
    put(data, callback) {
        const id = typeof data.payload?.id === 'string' && data.payload.id.length === 20
            ? data.payload.id
            : false;
        const extend = typeof data.payload?.extend === 'boolean' && data.payload.extend === true
            ? true
            : false;
        if (id && extend) {
            // Look up the token
            _data.read('tokens', id, (err, data) => {
                if (!err) {
                    // Check to make sure the token isn't already expired
                    if (data.expires > Date.now()) {
                        // Set the expiration an hour from now
                        const expires = Date.now() + 1000 * 60 * 60;
                        // Store the new updates
                        _data.update('tokens', id, { expires }, (err) => {
                            if (!err) {
                                callback(200);
                            }
                            else {
                                if (err.code === 'ENOENT') {
                                    callback(404, { Error: 'Not Found' });
                                }
                                else {
                                    callback(500, {
                                        Error: "Could not update the token's expiration",
                                    });
                                }
                            }
                        });
                    }
                    else {
                        callback(400, { Error: 'The token has expired, and cannot be extended' });
                    }
                }
                else {
                    if (err.code === 'ENOENT') {
                        callback(404, { Error: 'Specified token does not exist' });
                    }
                    else {
                        callback(500, { Error: 'Something went wrong' });
                    }
                }
            });
        }
        else {
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
    delete(data, callback) {
        // Check that the id is valid
        const id = typeof data.queryStringObject?.id === 'string' &&
            data.queryStringObject.id.trim().length === 20
            ? data.queryStringObject.id
            : false;
        if (id) {
            // Delete the token data
            _data.delete('tokens', id, (err) => {
                if (!err) {
                    callback(200, { status: 'Success', message: 'Token successfully deleted' });
                }
                else {
                    if (err.code === 'ENOENT') {
                        callback(404, { Error: 'Not Found' });
                    }
                    else {
                        callback(500, {
                            Error: 'Something went wrong, could not delete the specified token',
                        });
                    }
                }
            });
        }
        else {
            callback(400, { Error: 'Missing required field' });
        }
    }
}
export default TokenController.getInstance();

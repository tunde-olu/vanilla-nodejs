/**
 * Primary file for the API
 */

// Dependencies
import { createServer } from 'http';
import https from 'https';
import { parse, fileURLToPath } from 'url';
import { StringDecoder } from 'string_decoder';
import config from './lib/config.js';
import fs from 'fs';
import path from 'path';
import type {
	ICallbackData,
	IHandlers,
	CallbackFn,
	HandlersFunction,
	RouteHandlers,
} from './types/index.js';
import { Server } from 'http';
import { RequestListener } from 'http';
import { ServerOptions } from 'https';
import handlers from './lib/handlers.js';
import helpers from './lib/helpers.js';

// import _data from './lib/data.js';

// TESTING
// TODO: delete this
// _data.create!('test', 'new_file', { foo: 'bar' }, (err) => {
// 	console.log(`Error: $`);
// });

// _data.read!('test', 'new_fil', (err, data) => {
// 	console.log({ error: err, data });
// });

// _data.update!('test', 'new_file', { shsgdgghdh: 'buzz' }, (err) => {
// 	console.log(err);
// });

// _data.delete!('test', 'new_file', (err) => {
// 	console.log(err);
// });

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Instantiate the HTTP server
const httpServer = createServer((req, res) => {
	unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
	console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`);
});

// Instantiate the HTTPS server
const httpsServerOptions: ServerOptions = {
	key: fs.readFileSync(path.join(__dirname, './https/key.pem')),
	cert: fs.readFileSync(path.join(__dirname, './https/cert.pem')),
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
	console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`);
});

// All the server logic for both http and https
const unifiedServer: RequestListener = (req, res) => {
	// Get the URL and parse it
	const parsedUrl = parse(req.url as string, true);

	// Get the path
	const path = parsedUrl.pathname;
	const trimmedPath = path!.replace(/^\/+|\/+$/g, '');

	// Get the query string as an object
	const queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	const method = req.method?.toLowerCase();

	// Get the headers as an object
	const headers = req.headers;

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8');

	let buffer = '';
	req.on('data', (data: Buffer) => {
		buffer += decoder.write(data);
	});

	req.on('end', () => {
		buffer += decoder.end();

		// Choose an handler this request should go to
		// If one is not found, choose the notFound handler
		const chosenHandler: HandlersFunction | undefined =
			typeof router[trimmedPath as keyof Pick<IHandlers, RouteHandlers>] !== 'undefined'
				? router[trimmedPath as keyof Pick<IHandlers, RouteHandlers>]
				: router.notFound;

		// Construct the data object to send to the handler
		const data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: helpers.parseJsonToObject!(buffer),
		};

		// Route the request to the handler specified in the router
		chosenHandler!(data, (statusCode, payload) => {
			// Use the status code callback by the handler, or default to 200
			statusCode = typeof statusCode === 'number' ? statusCode : 200;

			// Use the payload callback by the handler, or default to an empty object;
			payload = typeof payload === 'object' ? payload : {};

			// Convert the payload to a string
			const payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the request path
			console.dir({ statusCode, path: trimmedPath, payload: payloadString });
			// console.log(`Returning this response:`, statusCode, payloadString);
		});
	});
};

// Define a request router
const router: IHandlers = {
	ping: handlers.ping,
	notFound: handlers.notFound,
	users: handlers.users,
	tokens: handlers.tokens,
	checks: handlers.checks,
};

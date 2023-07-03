/**
 * Primary file for the API
 */

// Dependencies
import { createServer } from 'http';
import { parse, fileURLToPath } from 'url';
import { StringDecoder } from 'string_decoder';
import config from './lib/config.js';
import fs from 'fs';
import path from 'path';
import handlers from './lib/handlers.js';
import helpers from './lib/helpers.js';

import type { IHandlers, HandlersFunction, RouteHandlers, IHttpServer } from './types/index.js';
import type { ServerOptions } from 'https';
import type { IRuntime } from './types/config.js';
import type { IncomingMessage, ServerResponse, Server, RequestListener } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HttpServer implements IHttpServer {
	private static _instance: HttpServer;

	router: IHandlers;
	public httpServer: Server<typeof IncomingMessage, typeof ServerResponse>;
	public httpServers: Server<typeof IncomingMessage, typeof ServerResponse>;

	public httpsServerOptions: ServerOptions;

	private constructor() {
		if (HttpServer._instance) {
			throw new Error('Instantiation failed. Use HttpServer.getInstance instead of new.');
		}

		this.router = {
			ping: handlers.ping,
			notFound: handlers.notFound,
			users: handlers.users,
			tokens: handlers.tokens,
		};

		this.httpServer = createServer((req, res) => {
			this.unifiedServer(req, res);
		});

		this.httpsServerOptions = {
			key: fs.readFileSync(path.join(__dirname, './https/key.pem')),
			cert: fs.readFileSync(path.join(__dirname, './https/cert.pem')),
		};

		this.httpServers = createServer(this.httpsServerOptions, (req, res) => {
			this.unifiedServer(req, res);
		});
	}

	public static getInstance(): HttpServer {
		if (HttpServer._instance) {
			return HttpServer._instance;
		}

		HttpServer._instance = new HttpServer();
		return HttpServer._instance;
	}

	unifiedServer(req: IncomingMessage, res: ServerResponse) {
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
				typeof this.router[trimmedPath as keyof Pick<IHandlers, RouteHandlers>] !==
				'undefined'
					? this.router[trimmedPath as keyof Pick<IHandlers, RouteHandlers>]
					: this.router.notFound;

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
	}

	// Start the HTTP server
	listen(config: IRuntime) {
		this.httpServer.listen(config.httpPort, () => {
			console.log(
				`The server is listening on port ${config.httpPort} in ${config.envName} mode`
			);
		});
	}
}

const server = HttpServer.getInstance();
server.listen(config);

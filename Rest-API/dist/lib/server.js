/**
 * Server-related tasks
 */
// Dependencies
import { createServer } from 'http';
import { parse, fileURLToPath } from 'url';
import { StringDecoder } from 'string_decoder';
import config from './config.js';
import fs from 'fs';
import path from 'path';
import handlers from './handlers.js';
import helpers from './helpers.js';
import { debuglog } from 'node:util';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// HTTPS keys and cert
const key = fs.readFileSync(path.join(__dirname, '../https/key.pem'));
const cert = fs.readFileSync(path.join(__dirname, '../https/cert.pem'));
const debug = debuglog('server');
class HttpServer {
    static _instance;
    router;
    httpServer;
    httpsServer;
    httpsServerOptions;
    constructor() {
        if (HttpServer._instance) {
            throw new Error('Instantiation failed. Use HttpServer.getInstance instead of new.');
        }
        this.router = {
            '': handlers.index,
            ping: handlers.ping,
            notFound: handlers.notFound,
            'api/users': handlers.users,
            'api/tokens': handlers.tokens,
            'api/checks': handlers.checks,
            'account/create': handlers.accountCreate,
            'account/edit': handlers.accountEdit,
            'account/deleted': handlers.accountDeleted,
            'session/create': handlers.sessionCreate,
            'session/deleted': handlers.sessionDeleted,
            'checks/all': handlers.checksList,
            'checks/create': handlers.checkCreate,
            'checks/edit': handlers.checksEdit,
            'favicon.ico': handlers.favicon,
            // Error example
            'examples/error': handlers.exampleError,
            // public: handlers.public,
            // @ts-ignore
            public: handlers.public,
        };
        this.httpServer = createServer((req, res) => {
            this.unifiedServer(req, res);
        });
        this.httpsServerOptions = {
            key,
            cert,
        };
        this.httpsServer = createServer(this.httpsServerOptions, (req, res) => {
            this.unifiedServer(req, res);
        });
    }
    static getInstance() {
        if (HttpServer._instance) {
            return HttpServer._instance;
        }
        HttpServer._instance = new HttpServer();
        return HttpServer._instance;
    }
    unifiedServer(req, res) {
        // Get the URL and parse it
        const parsedUrl = parse(req.url, true);
        // Get the path
        const path = parsedUrl.pathname;
        const trimmedPath = path?.replace(/^\/+|\/+$/g, '');
        // Get the query string as an object
        const queryStringObject = parsedUrl.query;
        // Get the HTTP Method
        const method = req.method?.toLowerCase();
        // Get the headers as an object
        const headers = req.headers;
        // Get the payload, if any
        const decoder = new StringDecoder('utf-8');
        let buffer = '';
        req.on('data', (data) => {
            buffer += decoder.write(data);
        });
        req.on('end', () => {
            // TODO: check if buffer += is needed
            buffer += decoder.end();
            // Choose an handler this request should go to
            // If one is not found, choose the notFound handler
            let chosenHandler = typeof this.router[trimmedPath] !==
                'undefined'
                ? this.router[trimmedPath]
                : this.router.notFound;
            // If the request is within the public, use the public handler instead
            chosenHandler = trimmedPath?.startsWith('public/') ? handlers.public : chosenHandler;
            // Construct the data object to send to the handler
            const data = {
                trimmedPath,
                queryStringObject,
                method,
                headers,
                payload: helpers.parseJsonToObject(buffer),
            };
            // Route the request to the handler specified in the router
            try {
                chosenHandler(data, (statusCode, payload, contentType) => {
                    this.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);
                });
            }
            catch (error) {
                debug(error);
                this.processHandlerResponse(res, method, trimmedPath, 500, { Error: 'An unknown error has ocurred' }, 'json');
            }
        });
    }
    // Process the response from the handler
    processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType) {
        // Determine the type of response (fallback to JSON)
        contentType = typeof contentType === 'string' ? contentType : 'json';
        // Use the status code callback by the handler, or default to 200
        statusCode = typeof statusCode === 'number' ? statusCode : 200;
        // Return the response parts that are content-specific
        let payloadString = '';
        // Return the response-parts that are common to all content-types
        if (contentType === 'json') {
            res.setHeader('Content-Type', 'application/json');
            // Use the payload callback by the handler, or default to an empty object;
            payload = typeof payload === 'object' ? payload : {};
            // Convert the payload to a string
            payloadString = JSON.stringify(payload);
        }
        if (contentType === 'html') {
            res.setHeader('Content-Type', 'text/html');
            payloadString = typeof payload === 'string' ? payload : '';
        }
        if (contentType === 'favicon') {
            res.setHeader('Content-Type', 'image/x-icon');
            payloadString = typeof payload === 'string' ? payload : '';
        }
        if (contentType === 'css') {
            res.setHeader('Content-Type', 'text/css');
            payloadString = typeof payload !== 'undefined' ? payload : '';
        }
        if (contentType === 'png') {
            res.setHeader('Content-Type', 'image/png');
            payloadString = typeof payload !== 'undefined' ? payload : '';
        }
        if (contentType === 'jpg') {
            res.setHeader('Content-Type', 'image/jpeg');
            payloadString = typeof payload !== 'undefined' ? payload : '';
        }
        if (contentType === 'plain') {
            res.setHeader('Content-Type', 'text/plain');
            payloadString = typeof payload !== 'undefined' ? payload : '';
        }
        res.writeHead(statusCode);
        res.write(payloadString);
        res.end();
        // Log the request path
        // debug('\x1b[32m%s\x1b[0m', {
        // 	statusCode,
        // 	path: trimmedPath,
        // 	payload: payloadString,
        // });
        // If the response is 200, print green otherwise print red
        if (statusCode === 200 || statusCode === 201) {
            debug('\x1b[32m%s\x1b[0m', method?.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
        }
        else {
            debug('\x1b[31m%s\x1b[0m', method?.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
        }
    }
    // Server Listening
    listen(config) {
        this.httpServer.listen(config.httpPort, () => {
            console.log('\x1b[35m%s\x1b[0m', `The server is listening on port ${config.httpPort} in ${config.envName} mode`);
        });
    }
    // Start the HTTP server
    init() {
        this.listen(config);
    }
}
export default HttpServer.getInstance();

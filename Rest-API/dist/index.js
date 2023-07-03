/**
 * Primary file for the API
 */
// Dependencies
import { createServer } from 'http';
import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import config from './config.js';
// Start the server
const server = createServer((req, res) => {
    // Get the URL and parse it
    const parsedUrl = parse(req.url, true);
    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    // Get the query string as an object
    const queryStringObject = parsedUrl.query;
    // Get the HTTP Method
    const method = req.method;
    // Get the headers as an object
    const headers = req.headers;
    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        // Choose an handler this request should go to
        // If one is not found, choose the notFound handler
        const chosenHandler = typeof router[trimmedPath] !== 'undefined'
            ? router[trimmedPath]
            : router.notFound;
        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: buffer,
        };
        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
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
            console.log(`Returning this response:`, statusCode, payloadString);
        });
    });
});
// Start the server, and have it listen on port 8000
server.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port} in ${config.envName} mode`);
});
// Define the handlers
const handlers = {};
// Sample handler
handlers.sample = function (data, callback) {
    // Callback a http status code, and a payload object
    callback(406, { name: 'sample handler' });
};
// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};
// Define a request router
const router = {
    sample: handlers.sample,
    notFound: handlers.notFound,
};

/**
 * Example http2 client
 */

import http2 from 'node:http2';

// Create client
const client = http2.connect('http://localhost:6000');

const { HTTP2_HEADER_PATH, HTTP2_HEADER_STATUS } = http2.constants;

//Create a request
const req = client.request({
	[HTTP2_HEADER_PATH]: '/',
});

// When a message is received, add the pieces of it together until you reach the end
let str = '';
// req.on('data', (chunk) => {
// 	str += chunk;
// });

// When the message ends, log it out
// req.on('end', () => {
// 	console.log(str);
// });

req.on('response', (headers) => {
	req.on('data', (chunk) => {
		str += chunk;
	});
	req.on('end', () => {
		console.log('request end');
	});
});

// End the request
req.end();

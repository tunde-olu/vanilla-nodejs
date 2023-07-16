/**
 * Example HTTP2 Server
 */

import http2 from 'node:http2';

// Init the server
const server = http2.createServer();

// On a stream , send back hello world html
server.on('stream', (stream, headers) => {
	stream.respond({
		status: 200,
		'Content-Type': 'text/html',
	});

	stream.end('<html><body><p>Hello world</p></body></html>');
});

// Listen on 6000
server.listen(6000, () => {
	console.log(`Server is listening on port ${6000}`);
});

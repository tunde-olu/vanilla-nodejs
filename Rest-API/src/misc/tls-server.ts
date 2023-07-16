/**
 * Example TLSServer
 * Listens to port 6000 and sends the word "pong" to client
 */

import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server options
const options = {
	cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
	key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
};

// Create the server
const server = tls.createServer(options, (socket) => {
	// Send the word "pong"
	const outboundMsg = 'pong';
	socket.write(outboundMsg);

	// When the client writes something, log it out
	socket.on('data', (inboundMsg) => {
		const msgString = inboundMsg.toString();
		console.log(`I wrote ${outboundMsg} and they sent ${msgString}`);
	});
});

server.listen(6000, () => {
	console.log(`Server is listening on port ${6000}`);
});

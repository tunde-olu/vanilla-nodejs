/**
 * Example TCP (NET) Server
 * Listens to port 6000 and sends the word "pong" to client
 */

import net from 'node:net';

// Create the server
const server = net.createServer((socket) => {
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

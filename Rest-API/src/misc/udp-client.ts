/**
 * Example UDP client
 * Sending a message to a UDP server on port 6000
 */

import dgram from 'node:dgram';

// Create client
const client = dgram.createSocket('udp4');

// Define the message and pull it into a Buffer
const msgString = 'This is a message';
const msgBuffer = Buffer.from(msgString);

// Send of the message
client.send(msgBuffer, 6000, 'localhost', (err) => {
	client.close();
});

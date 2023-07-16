/**
 * Example TCP (Net) Client
 * Connects to port 6000 and sends the word "ping" to server
 */
import net from 'node:net';
// Define the message to send
const outboundMsg = 'ping';
// Create the client
const client = net.createConnection({ port: 6000, host: 'localhost' }, () => {
    // Send the message
    client.write(outboundMsg);
});
// When the server writes back, log what it's says then kill the client
client.on('data', (inboundMsg) => {
    const msgString = inboundMsg.toString();
    console.log(`I wrote ${outboundMsg} and they sent ${msgString}`);
    client.end();
});

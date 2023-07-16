/**
 * Example TLS Client
 * Connects to port 6000 and sends the word "ping" to server
 */
import path from 'node:path';
import fs from 'node:fs';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Server options
const options = {
    ca: fs.readFileSync(path.join(__dirname, '../https/cert.pem')), // Only required because we are using s self signed certificate
};
// Define the message to send
const outboundMsg = 'ping';
// Create the client
const client = tls.connect(6000, options, () => {
    // Send the message
    client.write(outboundMsg);
});
// When the server writes back, log what it's says then kill the client
client.on('data', (inboundMsg) => {
    const msgString = inboundMsg.toString();
    console.log(`I wrote ${outboundMsg} and they sent ${msgString}`);
    client.end();
});

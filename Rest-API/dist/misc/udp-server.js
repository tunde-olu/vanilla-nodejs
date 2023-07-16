/**
 * Example UDP Server
 * Creating a UDP datagram server listening on 6000
 */
import dgram from 'node:dgram';
// Create a server
const server = dgram.createSocket('udp4');
server.on('message', (msgBuffer, rinfo) => {
    // Do something with an incoming message or do something with the sender
    const msgString = msgBuffer.toString();
    console.log(msgString);
    console.log(rinfo);
});
// Bind to 6000
server.bind(6000, () => {
    console.log(`Server is binding on port 6000`);
});

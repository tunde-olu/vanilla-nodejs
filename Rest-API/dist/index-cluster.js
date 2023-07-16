/**
 * Primary file for the API
 */
import server from './lib/server.js';
import workers from './lib/workers.js';
import cli from './lib/cli.js';
import { pathToFileURL } from 'url';
import cluster from 'node:cluster';
import os from 'node:os';
class App {
    static _instance;
    constructor() { }
    static getInstance() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new App();
        return this._instance;
    }
    init() {
        try {
            // If we're on the primary thread, start the background workers and the cli
            if (cluster.isPrimary) {
                // Start the workers
                workers.init();
                // Start the CLI (last)
                setImmediate(() => {
                    cli.init();
                });
                // Fork the process
                for (let i = 0; i < os.cpus().length; i++) {
                    cluster.fork();
                }
            }
            else {
                // If we are not on the primary thread, start the server
                server.init();
            }
        }
        catch (error) {
            throw error;
        }
    }
}
const app = new App();
// Self invoking only if required directly
if (pathToFileURL(process.argv[1]).href === import.meta.url) {
    app.init();
}
export default App.getInstance();

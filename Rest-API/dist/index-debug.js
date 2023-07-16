/**
 * Primary file for the API
 */
import cli from './lib/cli.js';
import exampleDebuggingProblem from './lib/exampleDebuggingProblem.js';
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
    async init() {
        // Start the server
        // server.init();
        // Start the workers
        // workers.init();
        // Start the CLI (last)
        setImmediate(() => {
            cli.init();
            debugger;
        });
        // Custom
        debugger;
        // @ts-ignore
        const testRun = err;
        debugger;
        // Custom
        debugger;
        // @ts-ignore
        const test = err;
        // Set foo at 1
        debugger;
        let foo = 1;
        console.log('Just assigned 1 to foo');
        debugger;
        // Increment foo
        foo++;
        console.log('Just incremented foo');
        debugger;
        // Square foo
        foo = foo * foo;
        console.log('Just squared foo');
        debugger;
        // Convert foo to a string
        foo = foo.toString(foo);
        console.log('Just converted foo to string');
        debugger;
        // Call the function with will throw error
        debugger;
        console.log('Just called the library');
        exampleDebuggingProblem.init();
        debugger;
    }
}
const app = new App();
app.init();

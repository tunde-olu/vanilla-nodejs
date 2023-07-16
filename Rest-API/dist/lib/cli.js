/**
 *
 * CLI - Related Tasks
 *
 */
// Dependencies
import readline from 'node:readline';
import util from 'node:util';
import { EventEmitter } from 'node:events';
import config from './config.js';
import helpers from './helpers.js';
import responders from './responders.js';
const colors = helpers.colors;
const debug = util.debuglog('cli');
const eventEmitter = new EventEmitter();
// eventEmitter.on('man', responders.moreLogInfo);
class Cli {
    static _instance;
    responders;
    closeReadline;
    constructor() {
        // Responders
        this.responders = responders;
        this.closeReadline = undefined;
    }
    static getInstance() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new Cli();
        return this._instance;
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////	Input handlers	////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    inputHandlers() {
        const inputStringToHandler = {
            man: 'help',
            help: 'help',
            exit: 'exit',
            stats: 'stats',
            'list users': 'listUsers',
            'more user info': 'moreUserInfo',
            'list checks': 'listChecks',
            'more check info': 'moreCheckInfo',
            'list logs': 'listLogs',
            'more log info': 'moreLogInfo',
        };
        // eventEmitter.on('exit', () => {
        // 	this.closeReadline!();
        // });
        for (const input in inputStringToHandler) {
            const value = inputStringToHandler[input];
            // if (value === 'exit') {
            // 	eventEmitter.on('exit', () => {
            // 		this.closeReadline!();
            // 	});
            // } else {
            // 	eventEmitter.on(input, this.responders[value as keyof Responders]);
            // }
            eventEmitter.on(input, this.responders[value]);
        }
    }
    /**
     * Input Processor
     */
    processInput(str) {
        str = typeof str === 'string' && str.trim().length > 0 ? str : '';
        // Only process the input if the user actually wrote something. Otherwise,ignore it
        if (str.length > 0) {
            // Codify the unique strings that identify the unique questions allowed to asked
            const uniqueInput = [
                'man',
                'help',
                'exit',
                'stats',
                'list users',
                'more user info',
                'list checks',
                'more check info',
                'list logs',
                'more log info',
            ];
            // Go through the possible's inputs, emit an event when a match is found
            let matchFound = false;
            let count = 0;
            uniqueInput.some((input) => {
                if (str.toLowerCase().includes(input.toLowerCase())) {
                    matchFound = true;
                    // Emit event matching the unique input, and include the full string given
                    eventEmitter.emit(input, str);
                    return true;
                }
            });
            // If no match is found, tell the user to try again
            if (!matchFound) {
                console.log('\x1b[35m%s\x1b[0m', 'Sorry, try again!'); // In yellow
            }
        }
    }
    /**
     * Init script
     */
    init() {
        // Send the start message to the console, in dark blue
        console.log(
        // `${colors.fg.blue}%s${colors.reset}`,
        '\x1b[34m%s\x1b[0m', `The CLI is listening on ${config.httpPort}`);
        // Bind the event handlers
        this.inputHandlers();
        // Start the interface
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> ',
        });
        // Create and initial prompt
        rl.prompt();
        // Handle each line of input separately
        rl.on('line', (str) => {
            // Send to the input processor
            this.processInput(str);
            // Re-initialize the prompt afterwards
            setTimeout(() => {
                rl.prompt();
            }, 100);
        });
        // If the user stops the CLI, kill the associated process
        rl.on('close', () => {
            process.exitCode = 0;
            console.log('\x1b[34m%s\x1b[0m', 'CLI interface exited successfully.'); // In blue
        });
        this.closeReadline = rl.close.bind(rl);
    }
}
export default Cli.getInstance();

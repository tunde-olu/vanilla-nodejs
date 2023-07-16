import os from 'node:os';
import v8 from 'node:v8';
import _data from './data.js';
import _logs from './logs.js';
import helpers from './helpers.js';
import childProcess from 'node:child_process';
import { IChecksDataObject } from '../types/lib.js';

/**
 * Responder class
 */
class Responders {
	private static _instance: Responders;

	private constructor() {}

	public static getInstance(): Responders {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new Responders();
		return this._instance;
	}

	/**
	 * Help / Man
	 */
	public help() {
		// console.log('You asked for help');

		// Codify the commands and their explanations
		const commands = {
			exit: 'Kill the CLI (and the rest of the application)',
			man: 'Show this help page',
			help: 'Alias of the "man" command',
			stats: 'Get statistics on the underlying operating system and resource utilization',
			'List users': 'Show a list of all the registered (undeleted) users in the system',
			'More user info --{userId}': 'Show details of a specified user',
			'List checks --up --down':
				'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
			'More check info --{checkId}': 'Show details of a specified check',
			'List logs': 'Show a list of all the log files available to be read (compressed only)',
			'More log info --{logFileName}': 'Show details of a specified log file',
		};

		// Show a header for the help page that is as wide as the screen
		formatConsole.horizontalLine();
		formatConsole.centered('CLI MANUAL');
		formatConsole.horizontalLine();
		formatConsole.verticalSpace(2);

		// Show each command, followed by its explanations, in white and yellow respectively
		for (const key in commands) {
			const value = commands[key as keyof typeof commands];
			let line = '\x1b[33m' + key + '\x1b[0m';

			const padding = 50 - line.length;

			for (let i = 0; i < padding; i++) {
				line += ' ';
			}

			line += value;
			console.log(line);
			formatConsole.verticalSpace(1);
		}

		formatConsole.verticalSpace(1);

		// End with another horizontal line
		formatConsole.horizontalLine();
	}

	/**
	 * Exit
	 */
	public exit() {
		process.exit(0);
	}

	/**
	 * Stats
	 */
	public stats() {
		// Compile an object of stats
		const stats = {
			'Load Average': os.loadavg().join(' '),
			'CPU Count': os.cpus().length,
			'CPU Model': os.cpus()[0]?.model,
			'Free Memory': os.freemem(),
			'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
			'Peak Malloc Memory': v8.getHeapStatistics().peak_malloced_memory,
			'Allocated Heap Used (%)': Math.round(
				(v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) *
					100
			),
			'Available Heap Allocated (%)': Math.round(
				(v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) *
					100
			),
			Uptime: os.uptime() + 'seconds',
		};

		// Create a header for the stats
		formatConsole.horizontalLine();
		formatConsole.centered('SYSTEM STATISTICS');
		formatConsole.horizontalLine();
		formatConsole.verticalSpace(2);

		// Log out each stats
		for (const key in stats) {
			const value = stats[key as keyof typeof stats];
			let line = '\x1b[33m' + key + '\x1b[0m';

			const padding = 60 - line.length;

			for (let i = 0; i < padding; i++) {
				line += ' ';
			}

			line += value;
			console.log(line);
			formatConsole.verticalSpace();
		}

		formatConsole.verticalSpace();

		// End with another horizontal line
		formatConsole.horizontalLine();
	}

	/**
	 * List users
	 */
	public async listUsers(flag: string) {
		try {
			const userIds = await _data.list('users');

			formatConsole.verticalSpace();

			for (const userId of userIds) {
				const userData = await _data.read('users', userId, () => {});

				if (!userData) throw 'Error fetch the users';

				const numOfChecks =
					typeof userData.checks === 'object' && userData.checks instanceof Array
						? userData.checks.length
						: 0;

				const line = `Name: ${userData.firstName} ${userData.lastName}  Phone: ${userData.phone}  Checks: ${numOfChecks}`;

				console.log(line);
				formatConsole.verticalSpace();
			}
		} catch (error) {
			console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
			formatConsole.verticalSpace();
		}
	}

	/**
	 * More user info
	 */
	public async moreUserInfo(str: string) {
		// Get the userId from the str string
		try {
			const userId = str.split('--')[1]?.trim();

			if (!userId) {
				console.log(
					'\x1b[33m%s\x1b[0m',
					'You need to provide a flag with --{userId} to look up a user'
				);
				return;
				// throw 'You need to provide a flag with --{userId} to look up a user';
			}

			const userData = await _data.read('users', userId, () => {});

			if (!userData) throw `No user exist with the id: ${userId}`;

			// Remove the hashed password
			delete userData.hashedPassword;

			// Print the JSON object of the user with text highlighting
			formatConsole.verticalSpace();

			console.dir(userData, { colors: true });

			formatConsole.verticalSpace();
		} catch (error) {
			console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
			formatConsole.verticalSpace();
		}
	}

	/**
	 * List checks
	 */
	public async listChecks(str: string) {
		try {
			// Get the state of the, default to down
			const flag = str.toLowerCase().split('--')[1]?.trim();

			if (typeof flag === 'string' && !(flag === 'up' || flag === 'down')) {
				throw 'Only one of {--up} {--down} flags are allowed';
			}

			const checkIds = await _data.list('checks');

			formatConsole.verticalSpace();

			for (const checkId of checkIds) {
				const checkData = (await _data.read(
					'checks',
					checkId,
					() => {}
				)) as IChecksDataObject;

				// Get the state, default to down
				const state = typeof checkData.state === 'string' ? checkData.state : 'down';

				// Get the state, default to unknown
				const checkOrUnknown =
					typeof checkData.state === 'string' ? checkData.state : 'unknown';

				// If the user has specified the state, or hasn't specified any state, include the current check accordingly

				if (!flag || flag.includes(state)) {
					let line = `ID: ${checkData.id} ${checkData.method?.toUpperCase()} ${
						checkData.protocol
					}://${checkData.url} State: ${checkOrUnknown}`;

					console.log(line);
					formatConsole.verticalSpace();
				}
			}
		} catch (error) {
			console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
			formatConsole.verticalSpace();
		}
	}

	/**
	 * More check info
	 */
	public async moreCheckInfo(str: string) {
		// Get the checkId from the str string
		try {
			const checkId = str.split('--')[1]?.trim();

			if (!checkId) {
				console.log(
					'\x1b[33m%s\x1b[0m',
					'You need to provide a flag with --{checkId} to look up a user'
				);
				return;
				// throw 'You need to provide a flag with --{checkId} to look up a user';
			}

			const checkData = await _data.read('checks', checkId, () => {});

			if (!checkData) throw `No check exist with the id: ${checkId}`;

			// Print the JSON object of the check with text highlighting
			formatConsole.verticalSpace();

			console.dir(checkData, { colors: true });

			formatConsole.verticalSpace();
		} catch (error) {
			console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
			formatConsole.verticalSpace();
		}
	}

	/**
	 * List logs
	 */
	// public async listLogs(str: string) {
	// 	try {
	// 		const logFileNames = await _logs.list(true);

	// 		if (logFileNames.length === 0) {
	// 			throw 'The system log directory is empty';
	// 		}

	// 		for (const logFileName of logFileNames) {
	// 			if (logFileName.includes('-')) {
	// 				console.log('\x1b[36m%s\x1b[0m', logFileName); // In color cyan
	// 				formatConsole.verticalSpace();
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
	// 		formatConsole.verticalSpace();
	// 	}
	// }

	public async listLogs(str: string) {
		try {
			const ls = childProcess.spawn('ls', ['./src/.logs']);

			let logFileNames: string[] = [];

			ls.stdout.on('data', (dataObject) => {
				// Explode into separate lines
				const dataString: string = dataObject.toString();

				logFileNames = dataString.split('\n');
			});

			ls.stdout.on('end', () => {
				if (logFileNames.length === 0) {
					console.log('\x1b[31m%s\x1b[0m', 'The system log directory is empty');
				}

				for (const logFileName of logFileNames) {
					if (typeof logFileName === 'string' && logFileName.includes('-')) {
						console.log('\x1b[36m%s\x1b[0m', logFileName.trim()?.split('.')[0]); // In color cyan
						formatConsole.verticalSpace();
					}
				}
			});
		} catch (error) {
			console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
			formatConsole.verticalSpace();
		}
	}

	/**
	 * More log info
	 */
	public async moreLogInfo(str: string, testing: string) {
		// Get the checkId from the str string
		try {
			const logFileName = str.split('--')[1]?.trim();

			if (!logFileName) {
				console.log(
					'\x1b[36m%s\x1b[0m',
					'You need to provide a flag with --{filename} of the log you want to read'
				);
				return;
				// throw 'You need to provide a flag with --{filename} of the log you want to read';
			}

			formatConsole.verticalSpace();
			// Decompressed the log
			const decompressedLog = await _logs.decompress(logFileName);

			// Split into lines
			const arr = decompressedLog.split('\n');

			arr.forEach((jsonString) => {
				const logObject = helpers.parseJsonToObject(jsonString);
				if (logObject && JSON.stringify(logObject) !== '{}') {
					console.dir(logObject, { colors: true });
					formatConsole.verticalSpace();
				}
			});
		} catch (error) {
			console.log('\x1b[31m%s\x1b[0m', (error as Error).message || error);
			formatConsole.verticalSpace();
		}
	}
}
/**
 * Util for the console screen
 */
class FormatConsole {
	private static _instance: FormatConsole;

	private constructor() {}

	public static getInstance(): FormatConsole {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new FormatConsole();
		return this._instance;
	}

	/**
	 * Create a vertical space in the console
	 * @param space
	 */
	public verticalSpace(lines: number = 1) {
		for (let i = 0; i < lines; i++) {
			console.log('');
		}
	}

	/**
	 * Create a horizontal line across the screen
	 */
	public horizontalLine() {
		// Get the available screen size
		const width = process.stdout.columns;

		let line = '';

		for (let i = 0; i < width; i++) {
			line += '-';
		}

		console.log(line);
	}

	/**
	 * Create centered text on the screen
	 * @param str
	 */
	public centered(str: string) {
		str = str.trim();

		// Get the available screen size
		const width = process.stdout.columns;

		// Calculate the left padding there should be
		const leftPadding = Math.floor((width - str.length) / 2);

		// Put in left padding spaces before the string itself
		let line = '';

		for (let i = 0; i < leftPadding; i++) {
			line += ' ';
		}

		line += str;

		console.log(line);
	}
}

const formatConsole = FormatConsole.getInstance();

export { Responders };
export default Responders.getInstance();

import type { IEnvironments, IRuntime } from '../types/config.js';

/**
 * Create and export configuration variables
 */

// Container for all the environments

class Environments implements IEnvironments {
	private static _instance: Environments;

	public environment: Record<'staging' | 'production' | 'testing', IRuntime>;

	public templateGlobals: object;

	public envToExport: IRuntime;

	private constructor() {
		if (Environments._instance) {
			throw new Error('Instantiation failed. Use Environment.getInstance() instead of new.');
		}

		this.environment = {
			staging: {
				httpPort: 8000,
				httpsPort: 8001,
				envName: 'staging',
				hashingSecret: 'PapadevThisIsASecret',
				maxChecks: 5,
				twilio: {
					accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
					authToken: '9455e3eb3109edc12e3d8c92768f7a67',
					fromPhone: '+15005550006',
				},
				templateGlobals: {
					appName: 'UptimeChecker',
					companyName: 'NotARealCompany, Inc.',
					yearCreated: '2023',
					baseUrl: 'http://localhost:8000/',
				},
			},
			production: {
				httpPort: 4000,
				httpsPort: 4001,
				envName: 'production',
				hashingSecret: 'PapadevThisIsASecret',
				maxChecks: 5,
				twilio: {
					accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
					authToken: '9455e3eb3109edc12e3d8c92768f7a67',
					fromPhone: '+15005550006',
				},
				templateGlobals: {
					appName: 'UptimeChecker',
					companyName: 'NotARealCompany, Inc.',
					yearCreated: '2023',
					baseUrl: 'http://localhost:4000/',
				},
			},

			testing: {
				httpPort: 4000,
				httpsPort: 4001,
				envName: 'testing',
				hashingSecret: 'PapadevThisIsASecret',
				maxChecks: 5,
				twilio: {
					accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
					authToken: '9455e3eb3109edc12e3d8c92768f7a67',
					fromPhone: '+15005550006',
				},
				templateGlobals: {
					appName: 'UptimeChecker',
					companyName: 'NotARealCompany, Inc.',
					yearCreated: '2023',
					baseUrl: 'http://localhost:4000/',
				},
			},
		};

		const NODE_ENV = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

		this.envToExport =
			typeof this.environment[
				NODE_ENV as keyof Record<'staging' | 'production', IRuntime>
			] === 'object'
				? this.environment[NODE_ENV as keyof Record<'staging' | 'production', IRuntime>]
				: this.environment.staging;

		this.templateGlobals = {};
	}

	public static getInstance(): Environments {
		if (Environments._instance) {
			return Environments._instance;
		}

		Environments._instance = new Environments();
		return Environments._instance;
	}
}

export default Environments.getInstance().envToExport;

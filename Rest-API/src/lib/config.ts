import type { IEnvironments, IRuntime } from '../types/config.js';

/**
 * Create and export configuration variables
 */

// Container for all the environments

class Environments implements IEnvironments {
	private static _instance: Environments;

	public environment: Record<'staging' | 'production', IRuntime>;

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
			},
			production: {
				httpPort: 4000,
				httpsPort: 4001,
				envName: 'production',
				hashingSecret: 'PapadevThisIsASecret',
			},
		};

		const NODE_ENV = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

		this.envToExport =
			typeof this.environment[
				NODE_ENV as keyof Record<'staging' | 'production', IRuntime>
			] === 'object'
				? this.environment[NODE_ENV as keyof Record<'staging' | 'production', IRuntime>]
				: this.environment.staging;
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

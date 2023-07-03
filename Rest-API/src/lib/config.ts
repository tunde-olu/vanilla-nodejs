import type { IEnvironments, IRuntime } from '../types/config.js';

/**
 * Create and export configuration variables
 */

// Container for all the environments
const environments: IEnvironments = {};

// Staging [default] environment
environments.staging = {
	httpPort: 8000,
	httpsPort: 8001,
	envName: 'staging',
	hashingSecret: 'PapadevThisIsASecret',
};

// Production environment
environments.production = {
	httpPort: 4000,
	httpsPort: 4001,
	envName: 'production',
	hashingSecret: 'PapadevThisIsASecret',
};

// Determine which environment was passed as a command-line argument
const currEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment is one of the environments above, if not, default to staging
const envToExport =
	typeof environments[currEnv as keyof IEnvironments] === 'object'
		? environments[currEnv as keyof IEnvironments]
		: environments.staging;

// Export the module
export default envToExport as IRuntime;

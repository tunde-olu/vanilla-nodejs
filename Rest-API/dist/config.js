/**
 * Create and export configuration variables
 */
// Container for all the environments
const environments = {};
// Staging [default] environment
environments.staging = {
    port: 8000,
    envName: 'staging',
};
// Production environment
environments.production = {
    port: 4000,
    envName: 'production',
};
// Determine which environment was passed as a command-line argument
const currEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// Check that current environment is one of the environments above, if not, default to staging
const envToExport = typeof environments[currEnv] === 'object'
    ? environments[currEnv]
    : environments.staging;
// Export the module
export default envToExport;

export interface IRuntime {
	httpPort: number;
	httpsPort: number;
	envName: string;
	hashingSecret: string;
}

export interface IEnvironments {
	environment: Record<'staging' | 'production', IRuntime>;
	envToExport: IRuntime;
}

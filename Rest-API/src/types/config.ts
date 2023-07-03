export interface IRuntime {
	httpPort: number;
	httpsPort: number;
	envName: string;
	hashingSecret: string;
}

export interface IEnvironments {
	staging?: IRuntime;
	production?: IRuntime;
}

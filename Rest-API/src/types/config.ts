export interface IRuntime {
	httpPort: number;
	httpsPort: number;
	envName: string;
	hashingSecret: string;
	maxChecks: number;
	templateGlobals: {
		[index: string]: string;
	};
	twilio: {
		fromPhone: string;
		accountSid: string;
		authToken: string;
	};
}

export interface IEnvironments {
	environment: Record<'staging' | 'production', IRuntime>;
	envToExport: IRuntime;
}

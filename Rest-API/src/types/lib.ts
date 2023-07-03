export type TFsError = { code: 'ENOENT' };

export interface IUserDataObject {
	firstName?: string;
	lastName?: string;
	phone?: string;
	hashedPassword?: string;
	password?: string;
	tosAgreement?: boolean;
}

export interface ITokenDataObject {
	phone: string;
	id: string;
	expires: number;
}

type TCreateFn = (
	dir: string,
	file: string,
	data: any,
	callback: (err: string | boolean | TFsError) => void
) => void;

type TReadFn = (
	dir: string,
	file: string,
	callback: (err: string | boolean | TFsError, data?: IUserDataObject | ITokenDataObject) => void
) => void;

type TUpdateFn = (
	dir: string,
	file: string,
	data: any,
	callback: (err: string | boolean | TFsError, data?: string) => void
) => void;

type TDeleteFn = (
	dir: string,
	file: string,
	callback: (err: string | boolean | TFsError) => void
) => void;

export interface ILib {
	baseDir?: string;
	create?: TCreateFn;
	read?: TReadFn;
	update?: TUpdateFn;
	delete?: TDeleteFn;
}

export interface IHelpers {
	hash?: (str: string) => boolean | string;
	parseJsonToObject?: (str: string) => any;
	createRandomString?: (str: number | boolean) => boolean | string;
}

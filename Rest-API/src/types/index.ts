import {
	IncomingHttpHeaders,
	IncomingMessage,
	RequestListener,
	Server,
	ServerResponse,
} from 'http';
import { ServerOptions } from 'https';
import { ParsedUrlQuery } from 'querystring';

interface IPayloadData {
	firstName?: string;
	lastName?: string;
	phone?: string;
	password?: string;
	id?: string;
	extend?: boolean;
	url?: string;
	method?: RequestMethods;
	successCodes: number[];
	timeoutSeconds: number;
	protocol: 'http' | 'https';
	tosAgreement?: boolean;
}

export interface ICallbackData {
	name?: string;
	trimmedPath?: string;
	queryStringObject?: ParsedUrlQuery;
	method?: string;
	headers?: IncomingHttpHeaders;
	payload: IPayloadData & string;
	Error?: string;
}

export type contentType = 'html' | 'json' | 'favicon' | 'css' | 'plain' | 'ico' | 'jpg' | 'png';

export type CallbackFn = (
	statusCode?: number,
	payload?: string | ICallbackData | object,
	contentType?: contentType
) => void;

export type HandlersFunction = (data: ICallbackData, callback: CallbackFn) => void;

export type RequestMethods = 'post' | 'get' | 'put' | 'delete';

type VerifyToken = (id: string, phone: string, callback: (err: string | boolean) => void) => void;

export type RouteHandlers =
	| ''
	| 'ping'
	| 'notFound'
	| 'account/create'
	| 'account/edit'
	| 'account/deleted'
	| 'session/create'
	| 'session/deleted'
	| 'checks/all'
	| 'checks/create'
	| 'checks/edit'
	| 'api/users'
	| 'api/tokens'
	| 'api/checks'
	| 'favicon.ico'
	| 'public';

export interface IRoutes {
	''?: HandlersFunction; // index
	ping?: HandlersFunction;
	notFound?: HandlersFunction;
	'account/create'?: HandlersFunction; // accountCreate
	'account/edit'?: HandlersFunction; // accountEdit
	'account/deleted'?: HandlersFunction; // accountDeleted
	'session/create'?: HandlersFunction; // sessionCreate
	'session/deleted'?: HandlersFunction; // sessionDeleted
	'checks/all'?: HandlersFunction; // checkList
	'checks/create'?: HandlersFunction; // checkCreate
	'checks/edit'?: HandlersFunction; // checkEdit
	'api/users'?: HandlersFunction;
	'api/tokens'?: HandlersFunction;
	'api/checks'?: HandlersFunction;
	'favicon.ico'?: HandlersFunction;
	public?: HandlersFunction;
}

export interface IHandlers {
	index?: HandlersFunction; // index
	ping?: HandlersFunction;
	notFound?: HandlersFunction;
	accountCreate?: HandlersFunction; // accountCreate
	accountEdit?: HandlersFunction; // accountEdit
	accountDeleted?: HandlersFunction; // accountDeleted
	sessionCreate?: HandlersFunction; // sessionCreate
	sessionDeleted?: HandlersFunction; // sessionDeleted
	checksList?: HandlersFunction; // checkList
	checksCreate?: HandlersFunction; // checkCreate
	checksEdit?: HandlersFunction; // checkEdit
	users?: HandlersFunction;
	tokens?: HandlersFunction;
	checks?: HandlersFunction;
}

export interface IHttpServer {
	httpsServerOptions: ServerOptions;
	httpServer: Server<typeof IncomingMessage, typeof ServerResponse>;
	httpsServer: Server<typeof IncomingMessage, typeof ServerResponse>;
	unifiedServer: RequestListener;
	router: IHandlers;
}

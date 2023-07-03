import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';

interface IPayloadData {
	firstName?: string;
	lastName?: string;
	phone?: string;
	password?: string;
	id?: string;
	extend?: boolean;
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

export type CallbackFn = (statusCode?: number, payload?: ICallbackData | object) => void;

export type HandlersFunction = (data: ICallbackData, callback: CallbackFn) => void;

export type RequestMethods = 'post' | 'get' | 'put' | 'delete';

type VerifyToken = (id: string, phone: string, callback: (err: string | boolean) => void) => void;

export type RouteHandlers = 'ping' | 'notFound' | 'users';

export interface IHandlers {
	ping?: HandlersFunction;
	notFound?: HandlersFunction;
	users?: HandlersFunction;
	tokens?: HandlersFunction;
	checks?: HandlersFunction;
	_users?: Record<RequestMethods, HandlersFunction>;
	_checks?: Record<RequestMethods, HandlersFunction>;
	_tokens?: Record<RequestMethods, HandlersFunction>;
	_verifyToken?: VerifyToken;
}

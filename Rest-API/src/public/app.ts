/*
 * Frontend Logic for application
 *
 */

// AutoBind decorator
// function autoBind(target: any, key: string, descriptor: PropertyDescriptor) {
// 	const originalMethod = descriptor.value;

// 	return {
// 		configurable: true,
// 		get() {
// 			const bindFn = originalMethod.bind(this);
// 			return bindFn;
// 		},
// 	};
// }
interface IConfig {
	sessionToken: IToken | false;
}

interface IToken {
	id: string;
	phone: string;
}

// Container for the frontend application
class App {
	// Config
	public config: {
		sessionToken: IToken | false;
	} = {
		sessionToken: false,
	};

	client: Client;
	form: HTMLFormElement;
	request: typeof this.client.request;

	constructor() {
		this.client = new Client(this.config);
		this.form = document.querySelector('form') as HTMLFormElement;
		this.request = this.client.request.bind(this);
	}

	/**
	 * Request
	 */
	// public async request(
	// 	headers: object,
	// 	path: string,
	// 	method: string,
	// 	queryStringObject: object,
	// 	payload?: {}
	// ) {
	// 	try {
	// 		return await this.client.request(headers, path, method, queryStringObject, payload);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	/**
	 * Bind the forms
	 */
	private bindForms() {
		let self = this;

		if (this.form) {
			const allForms = document.querySelectorAll('form');

			for (let i = 0; i < allForms.length; i++) {
				allForms[i].addEventListener('submit', async function (e) {
					// Stop the form from submitting
					e.preventDefault();
					const formId = this.id;
					const path = this.action;
					let method: string | number | boolean = this.method.toUpperCase();

					// Hide the error message (if it's currently shown due to a previous error)
					(
						document.querySelector('#' + formId + ' .formError') as HTMLFormElement
					).style.display = 'none';

					// Hide the success message (if it's currently shown due to a previous error)
					if (document.querySelector('#' + formId + ' .formSuccess')) {
						(
							document.querySelector(
								'#' + formId + ' .formSuccess'
							) as HTMLFormElement
						).style.display = 'none';
					}

					// Turn the inputs into a payload
					const payload: { [key: string]: string[] | {} } = {};
					const elements = this.elements;

					for (let i = 0; i < elements.length; i++) {
						const inputElement = elements[i] as HTMLInputElement;

						if (inputElement.type !== 'submit') {
							// Determine class of element and set value accordingly
							const classOfElement =
								typeof inputElement.classList.value == 'string' &&
								inputElement.classList.value.length > 0
									? inputElement.classList.value
									: '';

							const valueOfElement =
								inputElement.type == 'checkbox' &&
								!classOfElement.includes('multiselect')
									? inputElement.checked
									: !classOfElement.includes('intval')
									? inputElement.value
									: parseInt(inputElement.value);

							const elementIsChecked = inputElement.checked;

							// Override the method of the form if the input's name is _method
							let nameOfElement = inputElement.name;
							if (nameOfElement === '_method') {
								method = valueOfElement;
							} else {
								// Create an payload field named "method" if the elements name is actually http method
								if (nameOfElement == 'httpmethod') {
									nameOfElement = 'method';
								}
								// Create an payload field named "id" if the elements name is actually uid
								if (nameOfElement == 'uid') {
									nameOfElement = 'id';
								}
								// If the element has the class "multiselect" add its value(s) as array elements
								if (classOfElement.includes('multiselect')) {
									if (elementIsChecked) {
										payload[nameOfElement] =
											typeof payload[nameOfElement] == 'object' &&
											payload[nameOfElement] instanceof Array
												? payload[nameOfElement]
												: [];
										(payload[nameOfElement] as string[]).push(
											valueOfElement as string
										);
									}
								} else {
									payload[nameOfElement] = valueOfElement;
								}
							}
						}
					}

					// If the method is DELETE, the payload should be a queryStringObject instead
					const queryStringObject = method == 'DELETE' ? payload : {};

					// Call the API
					try {
						const responsePayload = await self.client.request(
							undefined,
							path,
							method as string,
							queryStringObject,
							payload
						);

						// If successful, send to form response processor
						self.formResponseProcessor(formId, payload as {}, responsePayload);
					} catch (error) {
						// Try to get the error from the api, or set a default error message
						const errorMessage =
							typeof (error as Error).message == 'string'
								? (error as Error).message
								: 'An error has occurred, please try again';

						const formErrorElement = document.querySelector(
							'#' + formId + ' .formError'
						) as HTMLFormElement;

						// Set the formError field with the error text
						formErrorElement.innerHTML = errorMessage;

						// Show (unhide) the form error field on the form
						formErrorElement.style.display = 'block';
					}
				});
			}
		}
	}

	/**
	 * Form response processor
	 */
	private async formResponseProcessor(
		formId: string,
		requestPayload: { [key: string]: string },
		responsePayload: IToken | false
	) {
		let functionToCall = false;
		// If account creation was successful, try to immediately log the user in
		if (formId == 'accountCreate') {
			// Take the phone and password, and use it to log the user in
			const newPayload = {
				phone: requestPayload.phone,
				password: requestPayload.password,
			};

			try {
				const newResponsePayload = await this.client.request(
					undefined,
					'api/tokens',
					'POST',
					undefined,
					newPayload
				);
				// If successful, set the token and redirect the user
				this.setSessionToken(newResponsePayload);
				window.location.href = '/checks/all';
			} catch (error) {
				// Set the formError field with the error text
				const formErrorElement = document.querySelector(
					'#' + formId + ' .formError'
				) as HTMLFormElement;

				formErrorElement.innerHTML = 'Sorry, an error has ocurred. Please try again.';

				// Show (unhide) the form error field on the form
				formErrorElement.style.display = 'block';
			}
		}

		// If login was successful, set the token in localStorage and redirect the user
		if (formId == 'sessionCreate') {
			this.setSessionToken(responsePayload);
			window.location.href = '/checks/all';
		}

		// If forms saved successfully and they have success messages, show them
		const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2', 'checksEdit1'];
		if (formsWithSuccessMessages.indexOf(formId) > -1) {
			(
				document.querySelector('#' + formId + ' .formSuccess') as HTMLFormElement
			).style.display = 'block';
		}

		// If the user just deleted their account, redirect them to the account-delete page
		if (formId == 'accountEdit3') {
			this.logUserOut(false);
			window.location.href = '/account/deleted';
		}

		// If the user just created a new check successfully, redirect back to the dashboard
		if (formId == 'checksCreate') {
			window.location.href = '/checks/all';
		}

		// If the user just deleted a check, redirect them to the dashboard
		if (formId == 'checksEdit2') {
			window.location.href = '/checks/all';
		}
	}

	/**
	 * Get the session token from localStorage and set it in the config object
	 */
	private getSessionToken() {
		const tokenString = localStorage.getItem('token');
		if (typeof tokenString == 'string') {
			try {
				const token = JSON.parse(tokenString);
				this.config.sessionToken = token;
				if (typeof token == 'object') {
					this.setLoggedInClass(true);
				} else {
					this.setLoggedInClass(false);
				}
			} catch (error) {
				this.config.sessionToken = false;
				this.setLoggedInClass(false);
			}
		}
	}

	/**
	 * Set (or remove) the loggedIn class from the body
	 */
	private setLoggedInClass(add: boolean) {
		const target = document.querySelector('body') as HTMLBodyElement;
		if (add) {
			target.classList.add('loggedIn');
		} else {
			target.classList.remove('loggedIn');
		}
	}

	/**
	 *  Set the session token in the config object as well as localStorage
	 * @param payload
	 */
	private setSessionToken(token: IToken | false) {
		this.config.sessionToken = token;
		const tokenString = JSON.stringify(token);
		localStorage.setItem('token', tokenString);
		if (typeof token == 'object') {
			this.setLoggedInClass(true);
		} else {
			this.setLoggedInClass(false);
		}
	}

	/**
	 * Renew the token
	 */
	private async renewToken() {
		const currentToken =
			typeof this.config.sessionToken == 'object' ? this.config.sessionToken : false;

		try {
			if (currentToken) {
				// Update the token with a new expiration
				const payload = {
					id: currentToken.id,
					extend: true,
				};
				await this.client.request(undefined, 'api/tokens', 'PUT', undefined, payload);

				// Get the new token details
				const queryStringObject = { id: currentToken.id };

				const responsePayload = await this.client.request(
					undefined,
					'api/tokens',
					'GET',
					queryStringObject,
					undefined
				);

				this.setSessionToken(responsePayload);
			} else {
				this.setSessionToken(false);
				throw 'clientError';
			}
		} catch (error) {
			this.setSessionToken(false);
			throw error;
		}
	}

	/**
	 * Load data on the page
	 */
	private loadDataOnPage() {
		// Get the current page from the body class
		const bodyClasses = document.querySelector('body')!.classList;
		const primaryClass = typeof bodyClasses[0] == 'string' ? bodyClasses[0] : false;

		// Logic for account settings page
		if (primaryClass == 'accountEdit') {
			this.loadAccountEditPage();
		}

		// Logic for dashboard page
		if (primaryClass == 'checksList') {
			this.loadChecksListPage();
		}

		// Logic for check details page
		if (primaryClass == 'checksEdit') {
			this.loadChecksEditPage();
		}
	}

	/**
	 * Load the account edit page specifically
	 */
	private async loadAccountEditPage() {
		// Get the phone number from the current token, or log the user out if none is there
		const phone =
			this.config.sessionToken && typeof this.config.sessionToken.phone == 'string'
				? this.config.sessionToken.phone
				: false;
		if (phone) {
			// Fetch the user data
			const queryStringObject = {
				phone: phone,
			};

			try {
				const responsePayload = await this.client.request(
					undefined,
					'api/users',
					'GET',
					queryStringObject,
					undefined
				);

				// Put the data into the forms as values where needed
				document.querySelector<HTMLInputElement>('#accountEdit1 .firstNameInput')!.value =
					responsePayload.firstName;
				document.querySelector<HTMLInputElement>('#accountEdit1 .lastNameInput')!.value =
					responsePayload.lastName;
				document.querySelector<HTMLInputElement>(
					'#accountEdit1 .displayPhoneInput'
				)!.value = responsePayload.phone;

				// Put the hidden phone field into both forms
				const hiddenPhoneInputs = document.querySelectorAll<HTMLInputElement>(
					'input.hiddenPhoneNumberInput'
				);
				for (let i = 0; i < hiddenPhoneInputs.length; i++) {
					hiddenPhoneInputs[i].value = responsePayload.phone;
				}
			} catch (error) {
				// If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
				this.logUserOut();
			}
		} else {
			this.logUserOut();
		}
	}

	/**
	 * Load the dashboard page specifically
	 */
	private async loadChecksListPage() {
		// Get the phone number from the current token, or log the user out if none is there
		const phone =
			this.config.sessionToken && typeof this.config.sessionToken.phone == 'string'
				? this.config.sessionToken.phone
				: false;
		if (phone) {
			// Fetch the user data
			const queryStringObject = {
				phone: phone,
			};

			try {
				const responsePayload = await this.client.request(
					undefined,
					'api/users',
					'GET',
					queryStringObject,
					undefined
				);

				// Determine how many checks the user has
				const allChecks =
					typeof responsePayload.checks == 'object' &&
					responsePayload.checks instanceof Array &&
					responsePayload.checks.length > 0
						? responsePayload.checks
						: [];

				for await (const checkId of allChecks) {
					// Get the data for the check
					const newQueryStringObject = {
						id: checkId,
					};

					try {
						const responsePayload = await this.client.request(
							undefined,
							'api/checks',
							'GET',
							newQueryStringObject,
							undefined
						);

						const checkData = responsePayload;
						// Make the check data into a table row
						const table = document.getElementById(
							'checksListTable'
						) as HTMLTableElement;
						const tr = table.insertRow(-1);
						tr.classList.add('checkRow');
						const td0 = tr.insertCell(0);
						const td1 = tr.insertCell(1);
						const td2 = tr.insertCell(2);
						const td3 = tr.insertCell(3);
						const td4 = tr.insertCell(4);
						td0.innerHTML = responsePayload.method.toUpperCase();
						td1.innerHTML = responsePayload.protocol + '://';
						td2.innerHTML = responsePayload.url;
						const state =
							typeof responsePayload.state == 'string'
								? responsePayload.state
								: 'unknown';
						td3.innerHTML = state;
						td4.innerHTML =
							'<a href="/checks/edit?id=' +
							responsePayload.id +
							'">View / Edit / Delete</a>';
					} catch (error) {
						console.log('Error trying to load check ID: ', checkId);
					}
				}

				if (allChecks.length < 5) {
					// Show the createCheck CTA
					(document.getElementById('createCheckCTA') as HTMLDivElement).style.display =
						'block';
				} else {
					// Show 'you have no checks' message
					(
						document.getElementById('noChecksMessage') as HTMLTableRowElement
					).style.display = 'table-row';

					// Show the createCheck CTA
					(document.getElementById('createCheckCTA') as HTMLDivElement).style.display =
						'block';
				}
			} catch (error) {
				// If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
				this.logUserOut();
			}
		} else {
			this.logUserOut();
		}
	}

	/**
	 * Bind the logout button
	 */
	private bindLogoutButton() {
		// Bind the class instance to constiable self
		let self = this;
		const logoutButton = document.getElementById('logoutButton') as HTMLLinkElement;
		logoutButton.addEventListener('click', async function (e) {
			// Stop it from redirecting anywhere
			e.preventDefault();

			// Log the user out
			await self.logUserOut();
		});
	}

	/**
	 * Load the checks edit page specifically
	 */
	private async loadChecksEditPage() {
		// Get the check id from the query string, if none is found then redirect back to dashboard
		const id =
			typeof window.location.href.split('=')[1] == 'string' &&
			window.location.href.split('=')[1].length > 0
				? window.location.href.split('=')[1]
				: false;
		if (id) {
			// Fetch the check data
			const queryStringObject = {
				id: id,
			};

			try {
				const responsePayload = await this.client.request(
					undefined,
					'api/checks',
					'GET',
					queryStringObject,
					undefined
				);

				// Put the hidden id field into both forms
				const hiddenIdInputs =
					document.querySelectorAll<HTMLInputElement>('input.hiddenIdInput');
				for (let i = 0; i < hiddenIdInputs.length; i++) {
					hiddenIdInputs[i].value = responsePayload.id;
				}

				// Put the data into the top form as values where needed
				document.querySelector<HTMLInputElement>('#checksEdit1 .displayIdInput')!.value =
					responsePayload.id;
				document.querySelector<HTMLInputElement>('#checksEdit1 .displayStateInput')!.value =
					responsePayload.state;
				document.querySelector<HTMLInputElement>('#checksEdit1 .protocolInput')!.value =
					responsePayload.protocol;
				document.querySelector<HTMLInputElement>('#checksEdit1 .urlInput')!.value =
					responsePayload.url;
				document.querySelector<HTMLInputElement>('#checksEdit1 .methodInput')!.value =
					responsePayload.method;
				document.querySelector<HTMLInputElement>('#checksEdit1 .timeoutInput')!.value =
					responsePayload.timeoutSeconds;
				const successCodeCheckboxes = document.querySelectorAll<HTMLInputElement>(
					'#checksEdit1 input.successCodesInput'
				);
				for (let i = 0; i < successCodeCheckboxes.length; i++) {
					if (
						responsePayload.successCodes.indexOf(
							parseInt(successCodeCheckboxes[i].value)
						) > -1
					) {
						successCodeCheckboxes[i].checked = true;
					}
				}
			} catch (error) {
				// If the request comes back as something other than 200, redirect back to dashboard
				window.location.href = '/checks/all';
			}
		} else {
			window.location.href = '/checks/all';
		}
	}

	/**
	 * Log the user out then redirect them
	 */
	private async logUserOut(redirectUser?: boolean) {
		// Set redirectUser to default to true
		redirectUser = typeof redirectUser == 'boolean' ? redirectUser : true;

		// Get the current token id
		const tokenId =
			this.config.sessionToken && typeof this.config.sessionToken.id == 'string'
				? this.config.sessionToken.id
				: false;

		// Send the current token to the tokens endpoint to delete it
		const queryStringObject = {
			id: tokenId,
		};

		try {
			await this.client.request(
				undefined,
				'api/tokens',
				'DELETE',
				queryStringObject,
				undefined
			);

			// Set the config token as false
			this.setSessionToken(false);

			// Send the user to the logged out page
			if (redirectUser) {
				window.location.href = '/session/deleted';
			}
		} catch (error) {}
	}

	/**
	 * Loop to renew token often
	 */
	private tokenRenewalLoop() {
		setInterval(async () => {
			try {
				await this.renewToken();
				console.log('Token renewed successfully @ ' + Date.now());
			} catch (error) {}
		}, 1000 * 60);
	}

	// Init (bootstrapping)
	public init() {
		// Bind all form submissions
		this.bindForms();

		// Bind logout logout button
		this.bindLogoutButton();

		// Get the token from localStorage
		this.getSessionToken();

		// Renew token
		this.tokenRenewalLoop();

		// Load data on page
		this.loadDataOnPage();
	}
}

// Fetch Client (for the restful API)
class Client {
	constructor(public config: IConfig) {}
	/**
	 * request
	 * Interface for making API calls
	 */

	public async request(
		headers: object | undefined,
		path: string,
		method: string,
		queryStringObject: object | undefined,
		payload?: {}
	) {
		// Set defaults
		headers = typeof headers === 'object' && headers !== null ? headers : {};
		path = typeof path === 'string' ? path : '/';
		method =
			typeof method === 'string' &&
			['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1
				? method
				: 'GET';
		queryStringObject =
			typeof queryStringObject === 'object' && queryStringObject !== null
				? queryStringObject
				: {};
		payload = typeof payload === 'object' && payload !== null ? payload : {};
		// callback = typeof callback === 'function' ? callback : false;

		// For each querystring parameter sent, add it to the path
		let requestUrl: string = path + '?';
		let counter: number = 0;
		for (const queryKey in queryStringObject) {
			counter++;
			// If at least one query string parameter has already been added, prepend new ones with ampersand
			if (counter > 1) {
				requestUrl += '&';
			}

			requestUrl +=
				queryKey + '=' + queryStringObject[queryKey as keyof typeof queryStringObject];
		}

		const requestInit: RequestInit = {};

		// Form the http request as a JSON type
		requestInit.headers = {};
		requestInit.headers['Content-Type'] = 'application/json';

		// Set the method
		requestInit.method = method;

		// For each header sent, add it to the request
		if (Object.keys(headers).length > 0) {
			for (const headerKey in headers) {
				requestInit.headers[headerKey] = headers[headerKey as keyof typeof headers];
			}
		}

		// If there is a current session token set, add that as a header
		if (this.config.sessionToken) {
			requestInit.headers['Authorization'] = `Bearer ${this.config.sessionToken.id}`;
		}

		// Send the payload as JSON if payload exit and request method is not GET
		if (Object.keys(payload).length > 0 && method.toUpperCase() !== 'GET') {
			const payloadString = JSON.stringify(payload);
			requestInit.body = payloadString;
		}

		try {
			const res = await fetch(requestUrl, requestInit);

			if (res.status > 201) {
				const errorMessage = await res.json();
				throw new Error(errorMessage.Error || errorMessage);
			}

			const data = await res.json();
			return data;
		} catch (error) {
			throw error;
		}
	}
}

const app = new App();
app.init();

// app.client.request(undefined, '/ping', 'GET', undefined, undefined, function(statusCode, payload){
// 	console.log(statusCode, payload)
// })
// client.request(undefined, '/ping', 'GET', undefined, undefined)

/*
// AJAX Client (for the restful API)
class Client extends App {
	constructor() {
		super();
	}
	/**
	 * request
	 * Interface for making API calls
	 * /
	public async request(
		headers: object,
		path: string,
		method: string,
		queryStringObject: object,
		payload?: {},
		callback?: Function
	) {
		// Set defaults
		headers = typeof headers === 'object' && headers !== null ? headers : {};
		path = typeof path === 'string' ? path : '/';
		method =
			typeof method === 'string' &&
			['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1
				? method
				: 'GET';
		queryStringObject =
			typeof queryStringObject === 'object' && queryStringObject !== null
				? queryStringObject
				: {};
		payload = typeof payload === 'object' && payload !== null ? payload : {};
		// callback = typeof callback === 'function' ? callback : false;

		// For each querystring parameter sent, add it to the path
		let requestUrl: string = path + '?';
		let counter: number = 0;
		for (const queryKey in queryStringObject) {
			if (Object.hasOwnProperty(queryKey)) {
				counter++;
				// If at least one query string parameter has already been added, prepend new ones with ampersand
				if (counter > 1) {
					requestUrl += '&';
				}

				requestUrl +=
					queryKey + '=' + queryStringObject[queryKey as keyof typeof queryStringObject];
			}
		}

		// Form the http request as a JSON type
		const xhr = new XMLHttpRequest();
		xhr.open(method, requestUrl, true);
		xhr.setRequestHeader('Content-Type', 'application/json');

		// For each header sent, add it to the request
		for (const headerKey in headers) {
			if (Object.hasOwnProperty(headerKey)) {
				xhr.setRequestHeader(headerKey, headers[headerKey as keyof typeof headers]);
			}
		}

		// If there is a current session token set, add that as a header
		if (this.config.sessionToken) {
			xhr.setRequestHeader('Authorization', `Bearer ${this.config.sessionToken.id}`);
		}

		// When the request comes back, handle the response
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				const statusCode = xhr.status;
				const responseReturned = xhr.responseText;

				// Callback if requested
				if (callback) {
					try {
						const parseResponse = JSON.parse(responseReturned);
						callback(statusCode, parseResponse);
					} catch (error) {
						callback(statusCode, false);
					}
				}
			}
		};

		// Send the payload as JSON
		const payloadString = JSON.stringify(payload);
		xhr.send(payloadString);
	}
}
*/

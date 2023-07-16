/*
 * Frontend Logic for application
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
// Container for the frontend application
var App = /** @class */ (function () {
    function App() {
        // Config
        this.config = {
            sessionToken: false,
        };
        this.client = new Client(this.config);
        this.form = document.querySelector('form');
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
    App.prototype.bindForms = function () {
        var self = this;
        if (this.form) {
            var allForms = document.querySelectorAll('form');
            for (var i = 0; i < allForms.length; i++) {
                allForms[i].addEventListener('submit', function (e) {
                    return __awaiter(this, void 0, void 0, function () {
                        var formId, path, method, payload, elements, i_1, inputElement, classOfElement, valueOfElement, elementIsChecked, nameOfElement, queryStringObject, responsePayload, error_1, errorMessage, formErrorElement;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    // Stop the form from submitting
                                    e.preventDefault();
                                    formId = this.id;
                                    path = this.action;
                                    method = this.method.toUpperCase();
                                    // Hide the error message (if it's currently shown due to a previous error)
                                    document.querySelector('#' + formId + ' .formError').style.display = 'none';
                                    // Hide the success message (if it's currently shown due to a previous error)
                                    if (document.querySelector('#' + formId + ' .formSuccess')) {
                                        document.querySelector('#' + formId + ' .formSuccess').style.display = 'none';
                                    }
                                    payload = {};
                                    elements = this.elements;
                                    for (i_1 = 0; i_1 < elements.length; i_1++) {
                                        inputElement = elements[i_1];
                                        if (inputElement.type !== 'submit') {
                                            classOfElement = typeof inputElement.classList.value == 'string' &&
                                                inputElement.classList.value.length > 0
                                                ? inputElement.classList.value
                                                : '';
                                            valueOfElement = inputElement.type == 'checkbox' &&
                                                !classOfElement.includes('multiselect')
                                                ? inputElement.checked
                                                : !classOfElement.includes('intval')
                                                    ? inputElement.value
                                                    : parseInt(inputElement.value);
                                            elementIsChecked = inputElement.checked;
                                            nameOfElement = inputElement.name;
                                            if (nameOfElement === '_method') {
                                                method = valueOfElement;
                                            }
                                            else {
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
                                                        payload[nameOfElement].push(valueOfElement);
                                                    }
                                                }
                                                else {
                                                    payload[nameOfElement] = valueOfElement;
                                                }
                                            }
                                        }
                                    }
                                    queryStringObject = method == 'DELETE' ? payload : {};
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, self.client.request(undefined, path, method, queryStringObject, payload)];
                                case 2:
                                    responsePayload = _a.sent();
                                    // If successful, send to form response processor
                                    self.formResponseProcessor(formId, payload, responsePayload);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    errorMessage = typeof error_1.message == 'string'
                                        ? error_1.message
                                        : 'An error has occurred, please try again';
                                    formErrorElement = document.querySelector('#' + formId + ' .formError');
                                    // Set the formError field with the error text
                                    formErrorElement.innerHTML = errorMessage;
                                    // Show (unhide) the form error field on the form
                                    formErrorElement.style.display = 'block';
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                });
            }
        }
    };
    /**
     * Form response processor
     */
    App.prototype.formResponseProcessor = function (formId, requestPayload, responsePayload) {
        return __awaiter(this, void 0, void 0, function () {
            var functionToCall, newPayload, newResponsePayload, error_2, formErrorElement, formsWithSuccessMessages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        functionToCall = false;
                        if (!(formId == 'accountCreate')) return [3 /*break*/, 4];
                        newPayload = {
                            phone: requestPayload.phone,
                            password: requestPayload.password,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload)];
                    case 2:
                        newResponsePayload = _a.sent();
                        // If successful, set the token and redirect the user
                        this.setSessionToken(newResponsePayload);
                        window.location.href = '/checks/all';
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        formErrorElement = document.querySelector('#' + formId + ' .formError');
                        formErrorElement.innerHTML = 'Sorry, an error has ocurred. Please try again.';
                        // Show (unhide) the form error field on the form
                        formErrorElement.style.display = 'block';
                        return [3 /*break*/, 4];
                    case 4:
                        // If login was successful, set the token in localStorage and redirect the user
                        if (formId == 'sessionCreate') {
                            this.setSessionToken(responsePayload);
                            window.location.href = '/checks/all';
                        }
                        formsWithSuccessMessages = ['accountEdit1', 'accountEdit2', 'checksEdit1'];
                        if (formsWithSuccessMessages.indexOf(formId) > -1) {
                            document.querySelector('#' + formId + ' .formSuccess').style.display = 'block';
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
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the session token from localStorage and set it in the config object
     */
    App.prototype.getSessionToken = function () {
        var tokenString = localStorage.getItem('token');
        if (typeof tokenString == 'string') {
            try {
                var token = JSON.parse(tokenString);
                this.config.sessionToken = token;
                if (typeof token == 'object') {
                    this.setLoggedInClass(true);
                }
                else {
                    this.setLoggedInClass(false);
                }
            }
            catch (error) {
                this.config.sessionToken = false;
                this.setLoggedInClass(false);
            }
        }
    };
    /**
     * Set (or remove) the loggedIn class from the body
     */
    App.prototype.setLoggedInClass = function (add) {
        var target = document.querySelector('body');
        if (add) {
            target.classList.add('loggedIn');
        }
        else {
            target.classList.remove('loggedIn');
        }
    };
    /**
     *  Set the session token in the config object as well as localStorage
     * @param payload
     */
    App.prototype.setSessionToken = function (token) {
        this.config.sessionToken = token;
        var tokenString = JSON.stringify(token);
        localStorage.setItem('token', tokenString);
        if (typeof token == 'object') {
            this.setLoggedInClass(true);
        }
        else {
            this.setLoggedInClass(false);
        }
    };
    /**
     * Renew the token
     */
    App.prototype.renewToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentToken, payload, queryStringObject, responsePayload, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentToken = typeof this.config.sessionToken == 'object' ? this.config.sessionToken : false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!currentToken) return [3 /*break*/, 4];
                        payload = {
                            id: currentToken.id,
                            extend: true,
                        };
                        return [4 /*yield*/, this.client.request(undefined, 'api/tokens', 'PUT', undefined, payload)];
                    case 2:
                        _a.sent();
                        queryStringObject = { id: currentToken.id };
                        return [4 /*yield*/, this.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined)];
                    case 3:
                        responsePayload = _a.sent();
                        this.setSessionToken(responsePayload);
                        return [3 /*break*/, 5];
                    case 4:
                        this.setSessionToken(false);
                        throw 'clientError';
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        this.setSessionToken(false);
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load data on the page
     */
    App.prototype.loadDataOnPage = function () {
        // Get the current page from the body class
        var bodyClasses = document.querySelector('body').classList;
        var primaryClass = typeof bodyClasses[0] == 'string' ? bodyClasses[0] : false;
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
    };
    /**
     * Load the account edit page specifically
     */
    App.prototype.loadAccountEditPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var phone, queryStringObject, responsePayload, hiddenPhoneInputs, i, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phone = this.config.sessionToken && typeof this.config.sessionToken.phone == 'string'
                            ? this.config.sessionToken.phone
                            : false;
                        if (!phone) return [3 /*break*/, 5];
                        queryStringObject = {
                            phone: phone,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined)];
                    case 2:
                        responsePayload = _a.sent();
                        // Put the data into the forms as values where needed
                        document.querySelector('#accountEdit1 .firstNameInput').value =
                            responsePayload.firstName;
                        document.querySelector('#accountEdit1 .lastNameInput').value =
                            responsePayload.lastName;
                        document.querySelector('#accountEdit1 .displayPhoneInput').value = responsePayload.phone;
                        hiddenPhoneInputs = document.querySelectorAll('input.hiddenPhoneNumberInput');
                        for (i = 0; i < hiddenPhoneInputs.length; i++) {
                            hiddenPhoneInputs[i].value = responsePayload.phone;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                        this.logUserOut();
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        this.logUserOut();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load the dashboard page specifically
     */
    App.prototype.loadChecksListPage = function () {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var phone, queryStringObject, responsePayload, allChecks, _d, allChecks_1, allChecks_1_1, checkId, newQueryStringObject, responsePayload_1, checkData, table, tr, td0, td1, td2, td3, td4, state, error_5, e_1_1, error_6;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        phone = this.config.sessionToken && typeof this.config.sessionToken.phone == 'string'
                            ? this.config.sessionToken.phone
                            : false;
                        if (!phone) return [3 /*break*/, 20];
                        queryStringObject = {
                            phone: phone,
                        };
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 18, , 19]);
                        return [4 /*yield*/, this.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined)];
                    case 2:
                        responsePayload = _e.sent();
                        allChecks = typeof responsePayload.checks == 'object' &&
                            responsePayload.checks instanceof Array &&
                            responsePayload.checks.length > 0
                            ? responsePayload.checks
                            : [];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 11, 12, 17]);
                        _d = true, allChecks_1 = __asyncValues(allChecks);
                        _e.label = 4;
                    case 4: return [4 /*yield*/, allChecks_1.next()];
                    case 5:
                        if (!(allChecks_1_1 = _e.sent(), _a = allChecks_1_1.done, !_a)) return [3 /*break*/, 10];
                        _c = allChecks_1_1.value;
                        _d = false;
                        checkId = _c;
                        newQueryStringObject = {
                            id: checkId,
                        };
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.client.request(undefined, 'api/checks', 'GET', newQueryStringObject, undefined)];
                    case 7:
                        responsePayload_1 = _e.sent();
                        checkData = responsePayload_1;
                        table = document.getElementById('checksListTable');
                        tr = table.insertRow(-1);
                        tr.classList.add('checkRow');
                        td0 = tr.insertCell(0);
                        td1 = tr.insertCell(1);
                        td2 = tr.insertCell(2);
                        td3 = tr.insertCell(3);
                        td4 = tr.insertCell(4);
                        td0.innerHTML = responsePayload_1.method.toUpperCase();
                        td1.innerHTML = responsePayload_1.protocol + '://';
                        td2.innerHTML = responsePayload_1.url;
                        state = typeof responsePayload_1.state == 'string'
                            ? responsePayload_1.state
                            : 'unknown';
                        td3.innerHTML = state;
                        td4.innerHTML =
                            '<a href="/checks/edit?id=' +
                                responsePayload_1.id +
                                '">View / Edit / Delete</a>';
                        return [3 /*break*/, 9];
                    case 8:
                        error_5 = _e.sent();
                        console.log('Error trying to load check ID: ', checkId);
                        return [3 /*break*/, 9];
                    case 9:
                        _d = true;
                        return [3 /*break*/, 4];
                    case 10: return [3 /*break*/, 17];
                    case 11:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 17];
                    case 12:
                        _e.trys.push([12, , 15, 16]);
                        if (!(!_d && !_a && (_b = allChecks_1.return))) return [3 /*break*/, 14];
                        return [4 /*yield*/, _b.call(allChecks_1)];
                    case 13:
                        _e.sent();
                        _e.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 16: return [7 /*endfinally*/];
                    case 17:
                        if (allChecks.length < 5) {
                            // Show the createCheck CTA
                            document.getElementById('createCheckCTA').style.display =
                                'block';
                        }
                        else {
                            // Show 'you have no checks' message
                            document.getElementById('noChecksMessage').style.display = 'table-row';
                            // Show the createCheck CTA
                            document.getElementById('createCheckCTA').style.display =
                                'block';
                        }
                        return [3 /*break*/, 19];
                    case 18:
                        error_6 = _e.sent();
                        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                        this.logUserOut();
                        return [3 /*break*/, 19];
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        this.logUserOut();
                        _e.label = 21;
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bind the logout button
     */
    App.prototype.bindLogoutButton = function () {
        // Bind the class instance to constiable self
        var self = this;
        var logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', function (e) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Stop it from redirecting anywhere
                            e.preventDefault();
                            // Log the user out
                            return [4 /*yield*/, self.logUserOut()];
                        case 1:
                            // Log the user out
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    };
    /**
     * Load the checks edit page specifically
     */
    App.prototype.loadChecksEditPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var id, queryStringObject, responsePayload, hiddenIdInputs, i, successCodeCheckboxes, i, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = typeof window.location.href.split('=')[1] == 'string' &&
                            window.location.href.split('=')[1].length > 0
                            ? window.location.href.split('=')[1]
                            : false;
                        if (!id) return [3 /*break*/, 5];
                        queryStringObject = {
                            id: id,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.request(undefined, 'api/checks', 'GET', queryStringObject, undefined)];
                    case 2:
                        responsePayload = _a.sent();
                        hiddenIdInputs = document.querySelectorAll('input.hiddenIdInput');
                        for (i = 0; i < hiddenIdInputs.length; i++) {
                            hiddenIdInputs[i].value = responsePayload.id;
                        }
                        // Put the data into the top form as values where needed
                        document.querySelector('#checksEdit1 .displayIdInput').value =
                            responsePayload.id;
                        document.querySelector('#checksEdit1 .displayStateInput').value =
                            responsePayload.state;
                        document.querySelector('#checksEdit1 .protocolInput').value =
                            responsePayload.protocol;
                        document.querySelector('#checksEdit1 .urlInput').value =
                            responsePayload.url;
                        document.querySelector('#checksEdit1 .methodInput').value =
                            responsePayload.method;
                        document.querySelector('#checksEdit1 .timeoutInput').value =
                            responsePayload.timeoutSeconds;
                        successCodeCheckboxes = document.querySelectorAll('#checksEdit1 input.successCodesInput');
                        for (i = 0; i < successCodeCheckboxes.length; i++) {
                            if (responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1) {
                                successCodeCheckboxes[i].checked = true;
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        // If the request comes back as something other than 200, redirect back to dashboard
                        window.location.href = '/checks/all';
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        window.location.href = '/checks/all';
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log the user out then redirect them
     */
    App.prototype.logUserOut = function (redirectUser) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenId, queryStringObject, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set redirectUser to default to true
                        redirectUser = typeof redirectUser == 'boolean' ? redirectUser : true;
                        tokenId = this.config.sessionToken && typeof this.config.sessionToken.id == 'string'
                            ? this.config.sessionToken.id
                            : false;
                        queryStringObject = {
                            id: tokenId,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined)];
                    case 2:
                        _a.sent();
                        // Set the config token as false
                        this.setSessionToken(false);
                        // Send the user to the logged out page
                        if (redirectUser) {
                            window.location.href = '/session/deleted';
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loop to renew token often
     */
    App.prototype.tokenRenewalLoop = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.renewToken()];
                    case 1:
                        _a.sent();
                        console.log('Token renewed successfully @ ' + Date.now());
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.log(error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, 1000 * 60);
    };
    // Init (bootstrapping)
    App.prototype.init = function () {
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
    };
    return App;
}());
// Fetch Client (for the restful API)
var Client = /** @class */ (function () {
    function Client(config) {
        this.config = config;
    }
    /**
     * request
     * Interface for making API calls
     */
    Client.prototype.request = function (headers, path, method, queryStringObject, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var requestUrl, counter, queryKey, requestInit, headerKey, payloadString, res, errorMessage, data, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        requestUrl = path + '?';
                        counter = 0;
                        for (queryKey in queryStringObject) {
                            counter++;
                            // If at least one query string parameter has already been added, prepend new ones with ampersand
                            if (counter > 1) {
                                requestUrl += '&';
                            }
                            requestUrl +=
                                queryKey + '=' + queryStringObject[queryKey];
                        }
                        requestInit = {};
                        // Form the http request as a JSON type
                        requestInit.headers = {};
                        requestInit.headers['Content-Type'] = 'application/json';
                        // Set the method
                        requestInit.method = method;
                        // For each header sent, add it to the request
                        if (Object.keys(headers).length > 0) {
                            for (headerKey in headers) {
                                requestInit.headers[headerKey] = headers[headerKey];
                            }
                        }
                        // If there is a current session token set, add that as a header
                        if (this.config.sessionToken) {
                            requestInit.headers['Authorization'] = "Bearer ".concat(this.config.sessionToken.id);
                        }
                        // Send the payload as JSON if payload exit and request method is not GET
                        if (Object.keys(payload).length > 0 && method.toUpperCase() !== 'GET') {
                            payloadString = JSON.stringify(payload);
                            requestInit.body = payloadString;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(requestUrl, requestInit)];
                    case 2:
                        res = _a.sent();
                        if (!(res.status > 201)) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.json()];
                    case 3:
                        errorMessage = _a.sent();
                        throw new Error(errorMessage.Error || errorMessage);
                    case 4: return [4 /*yield*/, res.json()];
                    case 5:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 6:
                        error_10 = _a.sent();
                        throw error_10;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return Client;
}());
var app = new App();
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

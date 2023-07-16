/**
 * Test runner
 */
import unit_test from './unit_test.js';
import api_test from './api_test.js';
// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';
// Application logic for the test runner
class App {
    static _instance;
    tests;
    constructor() {
        if (App._instance) {
            throw new Error('Instantiation failed: Use App.getInstance() instead of new');
        }
        this.tests = {
            unit: unit_test,
            api: api_test,
        };
    }
    static getInstance() {
        if (App._instance) {
            return App._instance;
        }
        App._instance = new App();
        return App._instance;
    }
    // Count all the test
    countTests() {
        let counter = 0;
        for (const key in this.tests) {
            // Check if this.tests is a object
            if (!this.tests.hasOwnProperty(key) && isNaN(parseInt(key))) {
                continue;
            }
            const subTests = this.tests[key];
            for (const testName in subTests) {
                // Check if subTests is a object
                if (!subTests.hasOwnProperty(testName) && isNaN(parseInt(testName))) {
                    continue;
                }
                counter++;
            }
        }
        return counter;
    }
    // Run all the tests, collecting the error and successes
    runTest() {
        let self = this;
        const errors = [];
        let successes = 0;
        const limit = this.countTests();
        let counter = 0;
        for (const key in this.tests) {
            // Check if this.tests is a object
            if (!this.tests.hasOwnProperty(key) && isNaN(parseInt(key))) {
                continue;
            }
            const subTests = this.tests[key];
            for (const testName in subTests) {
                // Check if subTests is a object
                if (!subTests.hasOwnProperty(testName) && isNaN(parseInt(testName))) {
                    continue;
                }
                (async function () {
                    const tempTestName = testName;
                    const testValue = subTests[testName];
                    // Call the test
                    try {
                        testValue();
                        // If the test pass without throwing, then it succeeded, so log it in green
                        console.log('\x1b[32m%s\x1b[0m', tempTestName);
                        counter++;
                        successes++;
                        if (counter === limit) {
                            self.productTestReport(limit, successes, errors);
                        }
                    }
                    catch (error) {
                        // If it throws, then it failed, so capture the error thrown and log it in red
                        errors.push({
                            name: testName,
                            error: error,
                        });
                        console.log('\x1b[31m%s\x1b[0m', tempTestName);
                        counter++;
                        if (counter === limit) {
                            self.productTestReport(limit, successes, errors);
                        }
                    }
                })();
            }
        }
    }
    // Product a test outcome report
    productTestReport(limit, successes, errors) {
        console.log('');
        console.log('----------BEGIN TEST REPORT----------');
        console.log('');
        console.log('Total Tests: ', limit);
        console.log('Pass: ', successes);
        console.log('Fail: ', errors.length);
        console.log('');
        // If there are errors, print them in details
        if (errors.length > 0) {
            console.log('----------BEGIN ERROR DETAILS----------');
            console.log('');
            errors.forEach((testError) => {
                console.log('\x1b[31m%s\x1b[0m', testError.name);
                console.log(testError.error);
                console.log('');
            });
            console.log('----------END ERROR DETAILS');
        }
        console.log('');
        console.log('----------END TEST REPORT----------');
        // process.exit(0);
    }
}
// Run the App
const app = new App();
app.runTest();
export default App.getInstance();

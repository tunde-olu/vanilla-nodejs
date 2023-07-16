import assert from 'assert/strict';
import helpers from '../lib/helpers.js';
import _logs from '../lib/logs.js';
import exampleDebuggingProblem from '../lib/exampleDebuggingProblem.js';
class UnitTest {
    static _instance;
    unitTest;
    constructor() {
        if (UnitTest._instance) {
            throw new Error('Instantiation failed: Use UnitTest.getInstance() instead of new');
        }
        this.unitTest = {
            'helpers.getANumber should return a number': this.returnNumber,
            'helpers.getANumber should return 1': this.return1,
            'helpers.getANumber should return 2': this.return2,
            'logs.list should callback a false error and an array of log names': this.logsList,
            'logs.truncate should not throw if the logId does not exist, should callback an error instead': this.logTruncate,
            'exampleDebuggingProblem.init should not throw when called': this.exampleDebuggingProblemTest,
        };
    }
    static getInstance() {
        if (UnitTest._instance) {
            return UnitTest._instance;
        }
        UnitTest._instance = new UnitTest();
        return UnitTest._instance;
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////	UNIT TEST	/////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    // Assert that the getANumber function is returning a number
    returnNumber() {
        const val = helpers.getANumber();
        try {
            assert.equal(typeof val, 'number');
        }
        catch (error) {
            throw error;
        }
    }
    // Assert that the getNumber function is returning 1
    return1() {
        const val = helpers.getANumber();
        try {
            assert.equal(val, 1);
        }
        catch (error) {
            throw error;
        }
    }
    // Assert that the getNumber function is returning 2
    return2() {
        const val = helpers.getANumber();
        try {
            assert.equal(val, 2);
        }
        catch (error) {
            throw error;
        }
    }
    // Logs.list should callback an array and a false error
    async logsList() {
        try {
            const logFilenames = await _logs.list(true);
            assert.ok(logFilenames instanceof Array);
            assert.ok(logFilenames.length > 0);
        }
        catch (error) {
            throw error;
        }
    }
    // Logs.truncate should not throw if the logId doesn't exist
    // await _logs.truncate('3nurro9vvoidlhzteu82');
    async logTruncate() {
        try {
            await _logs.truncate('I do not exit');
        }
        catch (error) {
            assert.fail(error);
        }
    }
    // exampleDebuggingProblem.init should not throw (but it does)
    exampleDebuggingProblemTest() {
        assert.doesNotThrow(() => {
            exampleDebuggingProblem.init();
        }, TypeError);
    }
}
export { UnitTest };
export default UnitTest.getInstance().unitTest;

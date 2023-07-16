/**
 * A Library that demonstrates something throwing when it's init() is called
 */
class Example {
    static _instance;
    constructor() {
        if (Example._instance) {
            throw new Error('Instantiation failed: Use Example.getInstance() instead of new');
        }
    }
    static getInstance() {
        if (Example._instance) {
            return Example._instance;
        }
        Example._instance = new Example();
        return Example._instance;
    }
    // Init function
    init() {
        // This is an error created intentionally, (bar not defined)
        // @ts-ignore
        const foo = bar;
    }
}
export default Example.getInstance();

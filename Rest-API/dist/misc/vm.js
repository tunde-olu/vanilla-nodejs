/**
 * Example VM
 * Running some arbitrary commands
 */
import vm from 'vm';
// Define a context for the script to run in
const context = {
    foo: 25,
};
// Define the script
const script = new vm.Script(`
	foo = foo * 2;
	const bar = foo + 1;
	const fizz = 52;
	console.log('hello');
`);
// Run the script
script.runInNewContext(context);
console.log(context);

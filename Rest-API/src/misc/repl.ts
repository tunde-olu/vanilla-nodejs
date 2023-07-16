/**
 * Example REPL Server
 * Take in the word "fizz" and log out "buzz"
 */

import repl from 'node:repl';

// Start the reply
repl.start({
	prompt: '>',
	useColors: true,
	eval: (str) => {
		// Evaluation function for incoming inputs
		console.log(`We are at the evaluation stage: ${str}`);

		// If the user said "fizz", say "buzz"back to them
		if (str === 'fizz\n') {
			console.log('buzz');
		}
	},
});

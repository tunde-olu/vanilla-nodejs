import data from './lib/data.js';

const func = async () => {
	try {
		const result = await data.list('checks');
		console.log(result);
		return result;
	} catch (error) {
		// @ts-ignore
		console.log(error);
	}
};

func();

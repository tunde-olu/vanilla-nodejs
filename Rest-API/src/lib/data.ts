/**
 * Library for storing and editing data
 */

import fs from 'fs';
import fsPromises, { FileHandle } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ILib, IUserDataObject } from '../types/lib.js';
import helpers from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Container for the module (to be exported)
const lib: ILib = {};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (dir, file, data, callback) => {
	// Open the file for writing;
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			// Convert data to string
			const stringData = JSON.stringify(data);

			// Write to file and close it
			fs.writeFile(fileDescriptor, stringData, 'utf-8', (err) => {
				if (!err) {
					fs.close(fileDescriptor, (err) => {
						if (!err) {
							callback(false);
						} else {
							callback('Error closing new file');
						}
					});
				} else {
					callback('Error writing to new file');
				}
			});
		} else {
			console.log(err);
			callback('Could not create new file, it may already exist');
		}
	});
};

lib.read = async (dir, file, callback) => {
	try {
		const fileToRead = await fsPromises.readFile(
			lib.baseDir + dir + '/' + file + '.json',
			'utf-8'
		);

		const fileToReadObject = helpers.parseJsonToObject(fileToRead) as IUserDataObject;

		if (fileToRead && fileToRead.length > 0) {
			callback(false, fileToReadObject);
		} else {
			callback(false, {});
		}
	} catch (error) {
		callback(error as string);
	}
};

/**
lib.update = async (dir, file, data, callback) => {
	let fileToUpdate: FileHandle = null!;
	try {
		fileToUpdate = await fsPromises.open(lib.baseDir + dir + '/' + file + '.json', 'r+');
		console.log(fileToUpdate);

		const fileToRead = await fileToUpdate.readFile({ encoding: 'utf-8', flag: 'r' });
		console.log(fileToRead);
		// console.log(fileToRead);
		// const stringFileToRead = JSON.stringify(fileToRead as unknown as string);
		const fileToObject = fileToRead.length > 0 ? JSON.parse(fileToRead) : '';
		// console.log(typeof fileToObject);
		const updatedFileToWrite =
			typeof fileToObject === 'object' ? Object.assign(fileToObject, data) : data;

		await fileToUpdate.writeFile(JSON.stringify(updatedFileToWrite), {
			flag: 'w+',
			encoding: 'utf-8',
		});

		callback(false);
	} catch (error) {
		callback(error as string);
	} finally {
		await fileToUpdate?.close();
	}
};

 */

lib.update = async (dir, file, data, callback) => {
	try {
		const fileContent = await fsPromises.readFile(lib.baseDir + dir + '/' + file + '.json', {
			encoding: 'utf-8',
			flag: 'r+',
		});

		const fileContentParsed = fileContent.length > 0 ? JSON.parse(fileContent) : '';

		const dataToWrite =
			typeof fileContentParsed === 'object' ? Object.assign(fileContentParsed, data) : data;

		await fsPromises.writeFile(
			lib.baseDir + dir + '/' + file + '.json',
			JSON.stringify(dataToWrite),
			{ encoding: 'utf-8' }
		);

		callback(false);
	} catch (error) {
		callback(error as string);
	}
};

lib.delete = async (dir, file, callback) => {
	try {
		await fsPromises.unlink(lib.baseDir + dir + '/' + file + '.json');
		callback(false);
	} catch (error) {
		callback(error as string);
	}
};

export default lib;

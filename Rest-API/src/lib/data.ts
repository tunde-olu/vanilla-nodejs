/**
 * Library for storing and editing data
 */

import fs from 'fs';
import fsPromises, { FileHandle } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ILib, ITokenDataObject, IUserDataObject, TFsError } from '../types/lib.js';
import helpers from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Container for the module (to be exported)

const baseDir = path.join(__dirname, '../.data/');

export class Lib implements ILib {
	private static _instance: Lib;

	private constructor(public baseDir: string) {
		if (Lib._instance) {
			throw new Error('Instantiation failed. Use Lib.getInstance() instead of use.');
		}

		this.baseDir = baseDir;
	}

	public static getInstance(baseDir: string): Lib {
		if (Lib._instance) {
			return Lib._instance;
		}

		Lib._instance = new Lib(baseDir);
		return Lib._instance;
	}

	create(
		dir: string,
		file: string,
		data: any,
		callback: (err: string | boolean | TFsError) => void
	) {
		// Open the file for writing;
		fs.open(this.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
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
	}

	async read(
		dir: string,
		file: string,
		callback: (
			err: string | boolean | TFsError,
			data?: IUserDataObject | ITokenDataObject | undefined
		) => void
	) {
		try {
			const fileToRead = await fsPromises.readFile(
				this.baseDir + dir + '/' + file + '.json',
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
	}

	async update(
		dir: string,
		file: string,
		data: any,
		callback: (err: string | boolean | TFsError, data?: string | undefined) => void
	) {
		try {
			const fileContent = await fsPromises.readFile(
				this.baseDir + dir + '/' + file + '.json',
				{
					encoding: 'utf-8',
					flag: 'r+',
				}
			);

			const fileContentParsed = fileContent.length > 0 ? JSON.parse(fileContent) : '';

			const dataToWrite =
				typeof fileContentParsed === 'object'
					? Object.assign(fileContentParsed, data)
					: data;

			await fsPromises.writeFile(
				this.baseDir + dir + '/' + file + '.json',
				JSON.stringify(dataToWrite),
				{ encoding: 'utf-8' }
			);

			callback(false);
		} catch (error) {
			callback(error as string);
		}
	}

	async delete(dir: string, file: string, callback: (err: string | boolean | TFsError) => void) {
		try {
			await fsPromises.unlink(this.baseDir + dir + '/' + file + '.json');
			callback(false);
		} catch (error) {
			callback(error as string);
		}
	}
}

export default Lib.getInstance(baseDir);

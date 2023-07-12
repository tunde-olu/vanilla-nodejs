import fsPromises, { FileHandle } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import FileSystemError from '../error/fileSystemError.js';
import { promisify } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gzip_promisify = promisify(zlib.gzip);
const unzip_promisify = promisify(zlib.unzip);

/**
 * Library for storing and rotating logs
 */
class Logs {
	private static _instance: Logs;
	public baseDir: string;

	private constructor() {
		this.baseDir = path.resolve(__dirname, '../.logs');
	}

	public static getInstance(): Logs {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new Logs();
		return this._instance;
	}

	// Append a string to a file. Create the file if it does not exist
	public async append(file: string, string: string): Promise<void> {
		try {
			const fileHandle = await fsPromises.open(this.baseDir + '/' + file + '.log', 'a');
			await fsPromises.appendFile(fileHandle, string + '\n', 'utf-8');
			await fileHandle.close();
		} catch (err) {
			const error = err as FileSystemError;
			if (error.code === 'ENOENT') {
				throw 'Error: Could not open file for appending';
			} else {
				throw error.message || error;
			}
		}
	}

	// List all the logs, and optionally include the compressed logs
	public async list(includeCompressedLogs: boolean): Promise<string[]> {
		try {
			const folderList = await fsPromises.readdir(this.baseDir, 'utf-8');

			const trimmedFilesName: string[] = [];

			for (const fileName of folderList) {
				// Add the .log files
				if (fileName.indexOf('.log') > -1) {
					trimmedFilesName.push(fileName.replace('.log', ''));
				}

				// Add on the .gz files
				if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
					trimmedFilesName.push(fileName.replace('.gz.b64', ''));
				}
			}

			return trimmedFilesName;
		} catch (err) {
			const error = err as FileSystemError;
			if (error.code === 'ENOENT') {
				throw 'Error: Invalid folder path';
			} else {
				throw error.message || error;
			}
		}
	}

	// Compress the contents of one .log file into a .gz.b64 file within the same director
	public async compress(logId: string, newFileId: string): Promise<void> {
		const sourceFile = logId + '.log';
		const destFile = newFileId + '.gz.b64';

		try {
			// Read the source file
			const inputString = await fsPromises.readFile(this.baseDir + '/' + sourceFile, 'utf-8');

			if (!inputString.trim()) {
				throw `Warning: Could not compress ${sourceFile}. File content is empty`;
			}

			// Compress the data using gzip
			const buffer = await gzip_promisify(inputString);
			// Send the data to the destination file
			const fileHandle = await fsPromises.open(this.baseDir + '/' + destFile, 'wx');
			// Write to the destination file
			await fsPromises.writeFile(fileHandle, buffer.toString('base64'));
			await fileHandle.close();
		} catch (err) {
			const error = err as FileSystemError;
			if (error.code === 'ENOENT') {
				throw 'Error: Invalid file path';
			} else {
				throw `Error compressing one of the log files ${error.message || ''}`;
			}
		}
	}

	// Decompress the contents of a .gz.b64 file into a string variable
	public async decompress(fileId: string): Promise<string> {
		const fileName = fileId + '.gz.b64';
		try {
			const fileData = await fsPromises.readFile(this.baseDir + '/' + fileName, 'utf-8');
			const inputBuffer = Buffer.from(fileData, 'base64');
			const outputBuffer = await unzip_promisify(inputBuffer);
			return outputBuffer.toString('utf-8');
		} catch (err) {
			const error = err as FileSystemError;
			if (error.code === 'ENOENT') {
				throw `Error: No log file found with the name ${fileId}`;
			} else {
				throw `Error decompressing one of the log files: ${error.message || ''}`;
			}
		}
	}

	// Truncating a log file
	public async truncate(logId: string) {
		const fileName = logId + '.log';
		try {
			await fsPromises.truncate(this.baseDir + '/' + fileName, 0);
		} catch (err) {
			const error = err as FileSystemError;
			if (error.code === 'ENOENT') {
				throw 'Error: File does not exist in the specified path';
			} else {
				throw `Error truncating file: ${error.message || ''}`;
			}
		}
	}
}

export default Logs.getInstance();

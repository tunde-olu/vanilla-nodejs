/**
 * Library for storing and editing data
 */
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import helpers from './helpers.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Container for the module (to be exported)
const baseDir = path.join(__dirname, '../.data/');
export class Lib {
    baseDir;
    static _instance;
    constructor(baseDir) {
        this.baseDir = baseDir;
        if (Lib._instance) {
            throw new Error('Instantiation failed. Use Lib.getInstance() instead of use.');
        }
        this.baseDir = baseDir;
    }
    static getInstance(baseDir) {
        if (Lib._instance) {
            return Lib._instance;
        }
        Lib._instance = new Lib(baseDir);
        return Lib._instance;
    }
    create(dir, file, data, callback) {
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
                            }
                            else {
                                callback('Error closing new file');
                            }
                        });
                    }
                    else {
                        callback('Error writing to new file');
                    }
                });
            }
            else {
                console.log(err);
                callback('Could not create new file, it may already exist');
            }
        });
    }
    async read(dir, file, callback) {
        try {
            const fileToRead = await fsPromises.readFile(this.baseDir + dir + '/' + file + '.json', 'utf-8');
            const fileToReadObject = helpers.parseJsonToObject(fileToRead);
            if (fileToRead && fileToRead.length > 0) {
                callback(false, fileToReadObject);
            }
            else {
                callback(false, {});
            }
            return fileToReadObject;
        }
        catch (error) {
            callback(error);
            // throw (error as Error).message || error;
        }
    }
    async update(dir, file, data, callback) {
        try {
            const fileContent = await fsPromises.readFile(this.baseDir + dir + '/' + file + '.json', {
                encoding: 'utf-8',
                flag: 'r+',
            });
            const fileContentParsed = fileContent.length > 0 ? JSON.parse(fileContent) : '';
            const dataToWrite = typeof fileContentParsed === 'object'
                ? Object.assign(fileContentParsed, data)
                : data;
            await fsPromises.writeFile(this.baseDir + dir + '/' + file + '.json', JSON.stringify(dataToWrite), { encoding: 'utf-8' });
            callback(false);
        }
        catch (error) {
            callback(error);
        }
    }
    async delete(dir, file, callback) {
        try {
            await fsPromises.unlink(this.baseDir + dir + '/' + file + '.json');
            callback(false);
        }
        catch (error) {
            callback(true);
        }
    }
    /**
     * List all the items in a director
     */
    async list(dir) {
        let self = this;
        try {
            const folder = await fsPromises.readdir(self.baseDir + '/' + dir);
            const trimmedFilesName = [];
            folder.forEach((file) => {
                trimmedFilesName.push(file.replace('.json', ''));
            });
            return trimmedFilesName;
        }
        catch (error) {
            const err = error;
            if (err.code === 'ENOENT') {
                throw `Directory "${dir}" does not exit`;
            }
            throw error.message || error;
        }
    }
}
export default Lib.getInstance(baseDir);

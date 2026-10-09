import log4js from 'log4js';
import type { SupportBank } from '../models/SupportBank.js';
import { fromCsv } from './parsers.js';
import { fromJson } from './parsers.js';
import { fromXml } from './parsers.js';

const logger = log4js.getLogger();

export const loadDataFromFile = (supportBank: SupportBank, filePath: string): Promise<void> => {
    const extension = filePath.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
        return fromJson(supportBank, filePath);
    } else if (extension === 'csv') {
        return fromCsv(supportBank, filePath);
    } else if (extension === 'xml') {
        return fromXml(supportBank, filePath);
    } else {
        logger.error(`Unsupported file format: ${extension}`);
        return Promise.reject(new Error(`Unsupported file format: ${extension}`));
    }
}

export const loadDataFromFiles = async (supportBank: SupportBank, filePaths: string[]): Promise<void> => {
    logger.info(`Loading ${filePaths.length} files`);
    return Promise.all(filePaths.map(path => loadDataFromFile(supportBank, path))).then(() => {});
}

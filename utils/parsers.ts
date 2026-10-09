import fs from 'fs';
import { parse } from 'csv-parse';
import log4js from 'log4js';
import xml2js from 'xml2js';
import { parse as parseDate, format, isValid } from 'date-fns';
import type { RowData } from "../models/RowData.js";
import type { SupportBank } from '../models/SupportBank.js';
import type { TransactionList } from '../models/TransactionList.js';

const logger = log4js.getLogger();

export const fromCsv = (supportBank : SupportBank, csvPath: string): Promise<void> => {
        logger.info(`Loading CSV from: ${csvPath}`);
        return new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
            .pipe(parse({ columns: true, trim: true }))
            .on('data', (row: RowData) => {
                try {
                    supportBank.addTransaction(row.Date, row.From, row.To, row.Narrative, parseFloat(row.Amount));
                    supportBank.addUser(row.From);
                    supportBank.addUser(row.To);
                } catch (err) {
                    logger.error(`Error parsing row: ${JSON.stringify(row)}. Error: ${err}`);
                }
            })
            .on('error', (err) => {
                logger.error('Error parsing CSV:', err.message);
                console.error('Error parsing CSV:', err.message);
                reject(err);
            })
            .on('end', () => {
                logger.info(`CSV parsing completed. Loaded ${supportBank.transactions.length} transactions and ${supportBank.users.length} users.`);
                console.log('CSV parsing completed.');
                resolve();
            });
        });
    }

export const fromJson = (supportBank : SupportBank, jsonPath: string): Promise<void> => {
        logger.info(`Loading JSON from: ${jsonPath}`);
        return new Promise((resolve, reject) => {
            fs.readFile(jsonPath, 'utf8', (err, data) => {
                if (err) {
                    logger.error('Error reading JSON file:', err.message);
                    console.error('Error reading JSON file:', err.message);
                    reject(err);
                    return;
                }

                try {
                    const jsonData = JSON.parse(data);
                    const transactions = Array.isArray(jsonData) ? jsonData : [jsonData];

                    for (const row of transactions) {
                        try {
                            supportBank.addTransaction(row.Date, row.From, row.To, row.Narrative, parseFloat(row.Amount));
                            supportBank.addUser(row.From);
                            supportBank.addUser(row.To);
                        } catch (err) {
                            logger.error(`Error parsing row: ${JSON.stringify(row)}. Error: ${err}`);
                        }
                    }

                    logger.info(`JSON parsing completed. Loaded ${supportBank.transactions.length} transactions and ${supportBank.users.length} users.`);
                    console.log('JSON parsing completed.');
                    resolve();
                } catch (err) {
                    logger.error('Error parsing JSON:', err);
                    console.error('Error parsing JSON:', err);
                    reject(err);
                }
            });
        });
    }

const excelSerialToDate = (serial: string): string => {
    const serialNum = parseInt(serial);
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = serialNum - 2; // Excel has a bug where it treats 1900 as a leap year
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return format(date, 'dd/MM/yyyy');
}

export const fromXml = (supportBank : SupportBank, xmlPath: string): Promise<void> => {
    logger.info(`Loading XML from: ${xmlPath}`);
    return new Promise((resolve, reject) => {
        fs.readFile(xmlPath, 'utf-8', (err, data) => {
            if (err) {
                logger.error('Error reading XML file:', err.message);
                console.error('Error reading XML file:', err.message);
                reject(err);
                return;
            }

            const parser = new xml2js.Parser({ explicitArray: false });
            parser.parseString(data, (err, result: TransactionList) => {
                if (err) {
                    logger.error('Error parsing XML:', err);
                    console.error('Error parsing XML:', err);
                    reject(err);
                    return;
                }

                try {
                    const transactions = result.TransactionList.SupportTransaction || [];

                    for (const row of transactions) {
                        try {
                            const date = excelSerialToDate(row.$.Date);
                            supportBank.addTransaction(
                                date,
                                row.Parties.From,
                                row.Parties.To,
                                row.Description,
                                parseFloat(row.Value)
                            );
                            supportBank.addUser(row.Parties.From);
                            supportBank.addUser(row.Parties.To);
                        } catch (err) {
                            logger.error(`Error parsing row: ${JSON.stringify(row)}. Error: ${err}`);
                        }
                    }

                    logger.info(`XML parsing completed. Loaded ${supportBank.transactions.length} transactions and ${supportBank.users.length} users.`);
                    console.log('XML parsing completed.');
                    resolve();
                } catch (err) {
                    logger.error('Error processing XML data:', err);
                    console.error('Error processing XML data:', err);
                    reject(err);
                }
            });
        });
    });
}
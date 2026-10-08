import fs from 'fs';
import { parse } from 'csv-parse';
import log4js from 'log4js';
import { parse as parseDate, format, isValid } from 'date-fns';
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import type { RowData } from "../models/RowData.js";
import type { SupportBank } from '../models/SupportBank.js';

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
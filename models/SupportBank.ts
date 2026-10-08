import log4js from 'log4js';
import { parse as parseDate, isValid } from 'date-fns';
import { Transaction } from "./Transaction.js";
import { User } from "./User.js";

const logger = log4js.getLogger();

export class SupportBank {
    users: User[]
    transactions: Transaction[]

    constructor(users: User[], transactions: Transaction[]) {
        this.users = users
        this.transactions = transactions
    }

    addUser(name: string): void {
        if (!this.users.some(user => user.name === name)) {
            this.users.push(new User(name));
            logger.debug(`Created user: ${name}`);
        } else {
            logger.debug(`User already exists: ${name}`);
        }
    }

    addTransaction(date: string, from: string, to: string, narrative: string, amount: number): void {
        const transaction = new Transaction(date, from, to, narrative, amount);

        if (!isValid(transaction.date)) {
            logger.error(`Invalid date format: ${date}`);
            throw new Error(`Invalid date format: ${date}`);
        }

        this.transactions.push(transaction);
        logger.debug(`Added transaction: ${from} -> ${to}, Amount: ${amount}`);
    }
}
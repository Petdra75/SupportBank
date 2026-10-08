import log4js from 'log4js';
import { parse as parseDate, format } from 'date-fns';
import type { SupportBank } from '../models/SupportBank.js';

const logger = log4js.getLogger();

export const listAll = (supportBank: SupportBank): void => {
    logger.info('Listing all users and their balances');
    for (const user of supportBank.users) {

        const moneyToGive = supportBank.transactions
            .filter((trans) => trans.from === user.name)
            .map((trans) => trans.amount)
            .reduce((acc, amount) => acc + amount, 0);

        const moneyToGet = supportBank.transactions
            .filter((trans) => trans.to === user.name)
            .map((trans) => trans.amount)
            .reduce((acc, amount) => acc + amount, 0);

        logger.debug(`${user.name}: owes ${moneyToGive}, to receive ${moneyToGet}`);
        console.log(`${user.name} has to pay ${moneyToGive} and has to recieve ${moneyToGet}`);
    }
}

export const list = (supportBank: SupportBank, name: string): void => {
    logger.info(`Listing transactions for user: ${name}`);
    const filteredTransactions = supportBank.transactions.filter((trans) => trans.from == name || trans.to == name);
    logger.debug(`Found ${filteredTransactions.length} transactions for ${name}`);

    if (filteredTransactions.length === 0) {
        console.log("No transactions found");
        return;
    }

    for (const transaction of filteredTransactions) {
        console.log(transaction.toString());
    }
}

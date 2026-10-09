import * as readline from 'readline';
import log4js from 'log4js';
import { SupportBank } from './models/SupportBank.js';
import { loadDataFromFiles } from './utils/files.js';
import { listAll, list } from './utils/list.js';

const logger = log4js.getLogger();

export async function main() {
    logger.info('Starting Support Bank application');
    const bank = new SupportBank([], []);
    await loadDataFromFiles(bank, ["Transactions2014.csv", "DodgyTransactions2015.csv", "Transactions.json", "Transactions2012.xml"]);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (question: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    };

    while (true) {
        console.log('\nSupport Bank Menu:');
        console.log('1. List All Users');
        console.log('2. List Transactions for User');
        console.log('3. Exit');

        const choice = await askQuestion('Enter your choice (1-3): ');
        logger.debug(`User selected choice: ${choice}`);

        if (choice === '1') {
            listAll(bank);
        } else if (choice === '2') {
            const name = await askQuestion('Enter user name: ');
            list(bank, name);
        } else if (choice === '3') {
            logger.info('User chose to exit');
            rl.close();
            break;
        } else {
            logger.warn(`Invalid choice selected: ${choice}`);
            console.log('Invalid choice. Please try again.');
        }
    }
}

import fs from 'fs';
import { parse } from 'csv-parse';
import * as readline from 'readline';
import log4js from 'log4js';
import { parse as parseDate, format, isValid } from 'date-fns';

const logger = log4js.getLogger();

interface RowData {
    Date: string;
    From: string;
    To: string;
    Narrative: string;
    Amount: string;
}

class User {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class Transaction {
    date: Date;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor(date: string, from: string, to: string, narrative: string, amount: number) {
        this.date = parseDate(date, 'dd/MM/yyyy', new Date());
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = amount;
    }
}

class SupportBank {
    users: User[]
    transactions: Transaction[]

    constructor(users: User[], transactions: Transaction[]) {
        this.users = users
        this.transactions = transactions
    }

    add_user(name: string): void {
        if (!this.users.some(user => user.name === name)) {
            this.users.push(new User(name));
            logger.debug(`Created user: ${name}`);
        } else {
            logger.debug(`User already exists: ${name}`);
        }
    }
    
    from_csv(csv_path: string): Promise<void> {
        logger.info(`Loading CSV from: ${csv_path}`);
        return new Promise((resolve, reject) => {
            fs.createReadStream(csv_path)
            .pipe(parse({ columns: true, trim: true }))
            .on('data', (row: RowData) => {
                try {
                    const transaction = new Transaction(row.Date, row.From, row.To, row.Narrative, parseFloat(row.Amount));

                    if (!isValid(transaction.date)) {
                        logger.error(`Invalid date format in row: ${JSON.stringify(row)}. Date: ${row.Date}`);
                        return;
                    }

                    this.transactions.push(transaction);
                    logger.debug(`Parsed transaction: ${row.From} -> ${row.To}, Amount: ${row.Amount}`);

                    this.add_user(row.From);
                    this.add_user(row.To);
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
                logger.info(`CSV parsing completed. Loaded ${this.transactions.length} transactions and ${this.users.length} users.`);
                console.log('CSV parsing completed.');
                resolve();
            });
        });
    }

    from_json(json_path: string): Promise<void> {
        logger.info(`Loading JSON from: ${json_path}`);
        return new Promise((resolve, reject) => {
            fs.readFile(json_path, 'utf8', (err, data) => {
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
                            const transaction = new Transaction(row.Date, row.From, row.To, row.Narrative, parseFloat(row.Amount));

                            if (!isValid(transaction.date)) {
                                logger.error(`Invalid date format in row: ${JSON.stringify(row)}. Date: ${row.Date}`);
                                continue;
                            }

                            this.transactions.push(transaction);
                            logger.debug(`Parsed transaction: ${row.From} -> ${row.To}, Amount: ${row.Amount}`);

                            this.add_user(row.From);
                            this.add_user(row.To);
                        } catch (err) {
                            logger.error(`Error parsing row: ${JSON.stringify(row)}. Error: ${err}`);
                        }
                    }

                    logger.info(`JSON parsing completed. Loaded ${this.transactions.length} transactions and ${this.users.length} users.`);
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

    from_file(file_path: string): Promise<void> {
        const extension = file_path.split('.').pop()?.toLowerCase();

        if (extension === 'json') {
            return this.from_json(file_path);
        } else if (extension === 'csv') {
            return this.from_csv(file_path);
        } else {
            logger.error(`Unsupported file format: ${extension}`);
            return Promise.reject(new Error(`Unsupported file format: ${extension}`));
        }
    }

    async from_files(file_paths: string[]): Promise<void> {
        logger.info(`Loading ${file_paths.length} files`);
        return Promise.all(file_paths.map(path => this.from_file(path))).then(() => {});
    }

    list_all() {
        logger.info('Listing all users and their balances');
        for (const user of this.users) {

            const moneyToGive = this.transactions
                .filter((trans) => trans.from === user.name)
                .map((trans) => trans.amount)
                .reduce((acc, amount) => acc + amount, 0);

            const moneyToGet = this.transactions
                .filter((trans) => trans.to === user.name)
                .map((trans) => trans.amount)
                .reduce((acc, amount) => acc + amount, 0);

            logger.debug(`${user.name}: owes ${moneyToGive}, to receive ${moneyToGet}`);
            console.log(`${user.name} has to pay ${moneyToGive} and has to recieve ${moneyToGet}`);
        }
    }

    list(name: string) {
        logger.info(`Listing transactions for user: ${name}`);
        const filteredTransactions = this.transactions.filter((trans) => trans.from == name || trans.to == name);
        logger.debug(`Found ${filteredTransactions.length} transactions for ${name}`);

        for (const transaction of filteredTransactions) {
            console.log(`Transaction: date(${format(transaction.date, 'dd/MM/yyyy')}), detail(${transaction.narrative}), ammount(${transaction.amount})`);
        }
    }
}

async function main() {
    logger.info('Starting Support Bank application');
    const bank = new SupportBank([], []);
    await bank.from_files(["Transactions2014.csv", "DodgyTransactions2015.csv"]);

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
            bank.list_all();
        } else if (choice === '2') {
            const name = await askQuestion('Enter user name: ');
            bank.list(name);
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

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' },
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ['file', 'console'], level: 'debug'}
    }
});
main();

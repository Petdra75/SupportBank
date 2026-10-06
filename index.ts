import fs from 'fs';
import { parse } from 'csv-parse';
import * as readline from 'readline';
import { parse as parseDate, format } from 'date-fns';

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
    
    from_csv(csv_path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const userMap = new Map<string, User>();
            fs.createReadStream(csv_path)
            .pipe(parse({ columns: true, trim: true }))
            .on('data', (row: RowData) => {
                const transaction = new Transaction(row.Date, row.From, row.To, row.Narrative, parseFloat(row.Amount));
                this.transactions.push(transaction);

                if (!userMap.has(row.From)) {
                    userMap.set(row.From, new User(row.From));
                }
                if (!userMap.has(row.To)) {
                    userMap.set(row.To, new User(row.To));
                }
            })
            .on('error', (err) => {
                console.error('Error parsing CSV:', err.message);
                reject(err);
            })
            .on('end', () => {
                this.users = Array.from(userMap.values());
                console.log('CSV parsing completed.');
                resolve();
            });
        });
    }

    list_all() {
        for (const user of this.users) {

            const moneyToGive = this.transactions
                .filter((trans) => trans.from === user.name)
                .map((trans) => trans.amount)
                .reduce((acc, amount) => acc + amount, 0);

            const moneyToGet = this.transactions
                .filter((trans) => trans.to === user.name)
                .map((trans) => trans.amount)
                .reduce((acc, amount) => acc + amount, 0);

            console.log(`${user.name} has to pay ${moneyToGive} and has to recieve ${moneyToGet}`);
        }
    }
    
    list(name: string) {
        const filteredTransactions = this.transactions.filter((trans) => trans.from == name || trans.to == name);
        
        for (const transaction of filteredTransactions) {
            console.log(`Transaction: date(${format(transaction.date, 'dd/MM/yyyy')}), detail(${transaction.narrative}), ammount(${transaction.amount})`);
        }
    }
}
async function main() {
    const bank = new SupportBank([], []);
    await bank.from_csv("Transactions2014.csv");

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

        if (choice === '1') {
            bank.list_all();
        } else if (choice === '2') {
            const name = await askQuestion('Enter user name: ');
            bank.list(name);
        } else if (choice === '3') {
            rl.close();
            break;
        } else {
            console.log('Invalid choice. Please try again.');
        }
    }
}

main();

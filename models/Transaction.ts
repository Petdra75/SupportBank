import { parse as parseDate, format, isValid } from 'date-fns';

export class Transaction {
    id: number;
    date: Date;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    private static _nextId: number = 1;

    constructor(date: string, from: string, to: string, narrative: string, amount: number) {
        this.id = Transaction._nextId++;
        this.date = parseDate(date, 'dd/MM/yyyy', new Date());
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = amount;
    }

    toString(): string {
        return `Transaction(${this.id}): ${format(this.date, 'dd/MM/yyyy')} - ${this.from} -> ${this.to}, ${this.narrative}, Amount: ${this.amount}`;
    }
}
export class User {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    toString(): string {
        return `User: ${this.name}`;
    }
}
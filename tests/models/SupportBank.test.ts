import { describe, it, expect, beforeEach } from 'vitest';
import { SupportBank } from '../../models/SupportBank.js';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';

describe('SupportBank', () => {
  let bank: SupportBank;

  beforeEach(() => {
    bank = new SupportBank([], []);
  });

  describe('Constructor', () => {
    it('should create a bank with empty users and transactions', () => {
      expect(bank.users).toEqual([]);
      expect(bank.transactions).toEqual([]);
    });

    it('should create a bank with provided users and transactions', () => {
      const user1 = new User('Alice');
      const user2 = new User('Bob');
      const transaction = new Transaction('01/01/2024', 'Alice', 'Bob', 'Test', 10.5);

      const testBank = new SupportBank([user1, user2], [transaction]);

      expect(testBank.users).toHaveLength(2);
      expect(testBank.transactions).toHaveLength(1);
      expect(testBank.users[0]!.name).toBe('Alice');
      expect(testBank.transactions[0]!.amount).toBe(10.5);
    });
  });

  describe('addUser', () => {
    it('should add a new user', () => {
      bank.addUser('Alice');

      expect(bank.users).toHaveLength(1);
      expect(bank.users[0]!.name).toBe('Alice');
    });

    it('should not add duplicate users', () => {
      bank.addUser('Alice');
      bank.addUser('Alice');

      expect(bank.users).toHaveLength(1);
    });

    it('should add multiple different users', () => {
      bank.addUser('Alice');
      bank.addUser('Bob');
      bank.addUser('Charlie');

      expect(bank.users).toHaveLength(3);
    });
  });

  describe('addTransaction', () => {
    it('should add a valid transaction', () => {
      bank.addTransaction('01/01/2024', 'Alice', 'Bob', 'Test', 10.5);

      expect(bank.transactions).toHaveLength(1);
      expect(bank.transactions[0]?.from).toBe('Alice');
      expect(bank.transactions[0]?.to).toBe('Bob');
      expect(bank.transactions[0]?.amount).toBe(10.5);
    });

    it('should throw error for invalid date', () => {
      expect(() => {
        bank.addTransaction('Invalid Date', 'Alice', 'Bob', 'Test', 10.5);
      }).toThrow('Invalid date format');
    });
  });
});

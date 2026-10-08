import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupportBank } from '../models/SupportBank.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { listAll, list } from '../utils/list.js';

describe('list', () => {
  let bank: SupportBank;

  beforeEach(() => {
    bank = new SupportBank([], []);
  });

  describe('listAll', () => {
    it('should handle empty bank', () => {
      expect(() => listAll(bank)).not.toThrow();
    });

    it('should calculate balances correctly', () => {
      const user1 = new User('Alice');
      const user2 = new User('Bob');
      const transaction1 = new Transaction('01/01/2024', 'Alice', 'Bob', 'Test1', 10.0);
      const transaction2 = new Transaction('02/01/2024', 'Bob', 'Alice', 'Test2', 5.0);

      const testBank = new SupportBank([user1, user2], [transaction1, transaction2]);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      listAll(testBank);

      expect(consoleSpy).toHaveBeenCalledWith('Alice has to pay 10 and has to recieve 5');
      expect(consoleSpy).toHaveBeenCalledWith('Bob has to pay 5 and has to recieve 10');
      consoleSpy.mockRestore();
    });
  });

  describe('list', () => {
    it('should handle empty transactions', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      list(bank, 'Alice');

      expect(consoleSpy).toHaveBeenCalledWith('No transactions found');
      consoleSpy.mockRestore();
    });

    it('should filter transactions by user', () => {
      const user1 = new User('Alice');
      const user2 = new User('Bob');
      const transaction1 = new Transaction('01/01/2024', 'Alice', 'Bob', 'Test1', 10.0);
      const transaction2 = new Transaction('02/01/2024', 'Bob', 'Alice', 'Test2', 5.0);

      const testBank = new SupportBank([user1, user2], [transaction1, transaction2]);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      list(testBank, 'Alice');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test1'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test2'));
      consoleSpy.mockRestore();
    });
  });
});

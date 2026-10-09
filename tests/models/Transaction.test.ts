import { describe, it, expect } from 'vitest';
import { Transaction } from '../../models/Transaction.js';

describe('Transaction', () => {
  it('should create a transaction with valid date', () => {
    const transaction = new Transaction('01/01/2024', 'Alice', 'Bob', 'Test', 10.5);
    expect(transaction.from).toBe('Alice');
    expect(transaction.to).toBe('Bob');
    expect(transaction.narrative).toBe('Test');
    expect(transaction.amount).toBe(10.5);
  });

  it('should have a toString method', () => {
    const transaction = new Transaction('01/01/2024', 'Alice', 'Bob', 'Test', 10.5);
    const str = transaction.toString();
    expect(str).toContain('Alice');
    expect(str).toContain('Bob');
    expect(str).toContain('10.5');
  });
});

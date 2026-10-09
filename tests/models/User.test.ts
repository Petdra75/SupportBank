import { describe, it, expect } from 'vitest';
import { User } from '../../models/User.js';

describe('User', () => {
  it('should create a user with a name', () => {
    const user = new User('Alice');
    expect(user.name).toBe('Alice');
  });
});

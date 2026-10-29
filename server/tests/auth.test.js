// server/tests/auth.test.js
import { describe, it, expect } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth Security & Token Validation', () => {
  it('correctly hashes and verifies passwords with bcrypt', async () => {
    const password = 'kampalaFit2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    expect(hash).not.toEqual(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare('wrongPassword', hash)).toBe(false);
  });

  it('signs and verifies JWT tokens with role and user data', () => {
    const secret = 'flexifit-test-secret';
    const payload = {
      id: 'user_123',
      email: 'brian@flexifit.ug',
      role: 'trainer',
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);

    expect(decoded.id).toBe('user_123');
    expect(decoded.role).toBe('trainer');
    expect(decoded.email).toBe('brian@flexifit.ug');
  });

  it('rejects tampered JWT tokens', () => {
    const secret = 'flexifit-test-secret';
    const token = jwt.sign({ id: 'user_1' }, secret);
    expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
  });
});

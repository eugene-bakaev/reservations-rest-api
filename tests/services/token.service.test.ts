import jwt from 'jsonwebtoken';
import { makeJwtSigner } from '@/services/token.service';
import { UnauthorizedError } from '@/utils/errors';

const SECRET = 'test-secret-must-be-long-enough';

describe('makeJwtSigner.verify', () => {
  const signer = makeJwtSigner(SECRET);

  it('round-trips a valid payload', () => {
    const token = signer.sign({ userId: 7, username: 'alice' });
    expect(signer.verify(token)).toEqual({ userId: 7, username: 'alice' });
  });

  it('throws "Invalid or expired token" on a malformed or wrong-secret token', () => {
    expect(() => signer.verify('not-a-token')).toThrow(UnauthorizedError);
    expect(() => signer.verify('not-a-token')).toThrow('Invalid or expired token');

    const wrongSecretToken = jwt.sign({ userId: 1, username: 'alice' }, 'a-different-secret');
    expect(() => signer.verify(wrongSecretToken)).toThrow('Invalid or expired token');
  });

  it('throws "Invalid token payload" when the payload fields are wrong types', () => {
    const badPayloadToken = jwt.sign({ userId: 'not-a-number', username: 42 }, SECRET);
    expect(() => signer.verify(badPayloadToken)).toThrow(UnauthorizedError);
    expect(() => signer.verify(badPayloadToken)).toThrow('Invalid token payload');
  });
});

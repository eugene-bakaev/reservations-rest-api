import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

const TOKEN_TTL = '24h';

export type AuthTokenPayload = { userId: number; username: string };

export type TokenSigner = {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
};

export function makeJwtSigner(secret: string): TokenSigner {
  return {
    sign(payload) {
      return jwt.sign(payload, secret, { expiresIn: TOKEN_TTL });
    },
    verify(token) {
      try {
        const decoded = jwt.verify(token, secret) as jwt.JwtPayload & AuthTokenPayload;
        if (typeof decoded.userId !== 'number' || typeof decoded.username !== 'string') {
          throw new UnauthorizedError('Invalid token payload');
        }
        return { userId: decoded.userId, username: decoded.username };
      } catch {
        throw new UnauthorizedError('Invalid or expired token');
      }
    },
  };
}

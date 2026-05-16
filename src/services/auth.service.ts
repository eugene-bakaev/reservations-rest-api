import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import type { UserQueries } from '../db/queries';
import type { Credentials } from '../schemas/auth.schema';

const BCRYPT_COST = 10;
const TOKEN_TTL = '24h';

export type AuthTokenPayload = { userId: number; username: string };

export type AuthServiceDeps = { userQ: UserQueries; jwtSecret: string };

export async function registerUser(
  credentials: Credentials,
  deps: AuthServiceDeps,
): Promise<{ id: number; username: string }> {
  const existing = await deps.userQ.findByUsername(credentials.username);
  if (existing) {
    throw new ConflictError(`Username "${credentials.username}" is already taken`);
  }
  const passwordHash = await bcrypt.hash(credentials.password, BCRYPT_COST);
  const { id } = await deps.userQ.insert({ username: credentials.username, passwordHash });
  return { id, username: credentials.username };
}

export async function loginUser(
  credentials: Credentials,
  deps: AuthServiceDeps,
): Promise<{ token: string }> {
  const user = await deps.userQ.findByUsername(credentials.username);
  if (!user) throw new UnauthorizedError('Invalid credentials');
  const passwordMatches = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!passwordMatches) throw new UnauthorizedError('Invalid credentials');

  const payload: AuthTokenPayload = { userId: user.id, username: user.username };
  const token = jwt.sign(payload, deps.jwtSecret, { expiresIn: TOKEN_TTL });
  return { token };
}

export function verifyToken(token: string, jwtSecret: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload & AuthTokenPayload;
    if (typeof decoded.userId !== 'number' || typeof decoded.username !== 'string') {
      throw new UnauthorizedError('Invalid token payload');
    }
    return { userId: decoded.userId, username: decoded.username };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

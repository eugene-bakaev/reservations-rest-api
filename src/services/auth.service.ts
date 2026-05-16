import bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import type { UserQueries } from '../db/queries';
import type { Credentials } from '../schemas/auth.schema';
import type { AuthTokenPayload, TokenSigner } from './token.service';

export type { AuthTokenPayload } from './token.service';

const BCRYPT_COST = 10;

export type AuthServiceDeps = { userQ: UserQueries; signer: TokenSigner };

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
  return { token: deps.signer.sign(payload) };
}

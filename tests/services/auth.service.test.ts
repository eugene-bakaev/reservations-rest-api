import { registerUser, loginUser } from '@/services/auth.service';
import { makeJwtSigner } from '@/services/token.service';
import { ConflictError, UnauthorizedError } from '@/utils/errors';
import type { UserQueries } from '@/db/queries';
import type { User } from '@/db/schema';

const signer = makeJwtSigner('test-secret-must-be-long-enough');

function makeUserQ(initial?: User): UserQueries {
  const store = new Map<string, User>();
  if (initial) store.set(initial.username, initial);
  return {
    findById: jest.fn(async (id) => Array.from(store.values()).find((user) => user.id === id)),
    findByUsername: jest.fn(async (username) => store.get(username)),
    insert: jest.fn(async (row) => {
      const id = store.size + 1;
      store.set(row.username, {
        id,
        username: row.username,
        passwordHash: row.passwordHash,
        createdAt: new Date(),
      });
      return { id };
    }),
    countAll: jest.fn(async () => store.size),
    insertManyWithIds: jest.fn(),
  };
}

describe('registerUser', () => {
  it('creates a user and returns id + username', async () => {
    const userQ = makeUserQ();
    const result = await registerUser({ username: 'alice', password: 'hunter2!' }, { userQ, signer });
    expect(result).toEqual({ id: 1, username: 'alice' });
    expect(userQ.insert).toHaveBeenCalledTimes(1);
    const insertArg = (userQ.insert as jest.Mock).mock.calls[0][0];
    expect(insertArg.passwordHash).not.toBe('hunter2!');
    expect(insertArg.passwordHash.length).toBeGreaterThan(20);
  });

  it('throws ConflictError when username already exists', async () => {
    const userQ = makeUserQ({ id: 1, username: 'alice', passwordHash: 'h', createdAt: new Date() });
    await expect(
      registerUser({ username: 'alice', password: 'pw_long' }, { userQ, signer }),
    ).rejects.toThrow(ConflictError);
  });
});

describe('loginUser', () => {
  it('returns a JWT for valid credentials', async () => {
    const userQ = makeUserQ();
    await registerUser({ username: 'alice', password: 'hunter2!' }, { userQ, signer });
    const { token } = await loginUser({ username: 'alice', password: 'hunter2!' }, { userQ, signer });
    expect(typeof token).toBe('string');
    const payload = signer.verify(token);
    expect(payload.username).toBe('alice');
    expect(payload.userId).toBe(1);
  });

  it('throws UnauthorizedError for unknown username', async () => {
    const userQ = makeUserQ();
    await expect(
      loginUser({ username: 'nobody', password: 'whatever' }, { userQ, signer }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for wrong password', async () => {
    const userQ = makeUserQ();
    await registerUser({ username: 'alice', password: 'hunter2!' }, { userQ, signer });
    await expect(
      loginUser({ username: 'alice', password: 'wrong000' }, { userQ, signer }),
    ).rejects.toThrow(UnauthorizedError);
  });
});

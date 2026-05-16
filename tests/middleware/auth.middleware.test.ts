import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { makeAuthGuard } from '@/middleware/auth.middleware';
import { UnauthorizedError } from '@/utils/errors';

const JWT_SECRET = 'test-secret-must-be-long-enough';

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function makeRes(): Response {
  return { locals: {} } as unknown as Response;
}

describe('makeAuthGuard', () => {
  const guard = makeAuthGuard({ jwtSecret: JWT_SECRET });

  it('passes a valid Bearer token and stores the payload on res.locals.user', () => {
    const token = jwt.sign({ userId: 1, username: 'alice' }, JWT_SECRET, { expiresIn: '1h' });
    const req = makeReq({ authorization: `Bearer ${token}` });
    const res = makeRes();
    const next = jest.fn() as unknown as NextFunction;
    guard(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.locals.user).toEqual({ userId: 1, username: 'alice' });
  });

  it('calls next with UnauthorizedError when the Authorization header is missing', () => {
    const req = makeReq({});
    const res = makeRes();
    const next = jest.fn() as unknown as NextFunction;
    guard(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with UnauthorizedError when the token is invalid', () => {
    const req = makeReq({ authorization: 'Bearer not-a-token' });
    const res = makeRes();
    const next = jest.fn() as unknown as NextFunction;
    guard(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with UnauthorizedError when the scheme is not Bearer', () => {
    const req = makeReq({ authorization: 'Basic abc' });
    const res = makeRes();
    const next = jest.fn() as unknown as NextFunction;
    guard(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

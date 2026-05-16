import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { validate } from '@/middleware/validate.middleware';
import { ValidationError } from '@/utils/errors';

function makeReq(overrides: Partial<Request> = {}): Request {
  return { body: {}, params: {}, query: {}, ...overrides } as Request;
}

describe('validate', () => {
  const schema = z.object({ id: z.coerce.number().int().positive() });

  it('parses params and assigns parsed values back to req[source]', () => {
    const req = makeReq({ params: { id: '42' } });
    const next = jest.fn() as unknown as NextFunction;
    validate(schema, 'params')(req, {} as Response, next);
    expect(req.params).toEqual({ id: 42 });
    expect(next).toHaveBeenCalledWith();
  });

  it('passes a ValidationError to next on invalid input', () => {
    const req = makeReq({ params: { id: 'not-a-number' } });
    const next = jest.fn() as unknown as NextFunction;
    validate(schema, 'params')(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('validates body source', () => {
    const bodySchema = z.object({ name: z.string().min(1) });
    const req = makeReq({ body: { name: '' } });
    const next = jest.fn() as unknown as NextFunction;
    validate(bodySchema, 'body')(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});

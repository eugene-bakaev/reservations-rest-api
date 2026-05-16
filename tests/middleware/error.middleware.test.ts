import { Request, Response } from 'express';
import { errorHandler } from '@/middleware/error.middleware';
import { NotFoundError, ValidationError } from '@/utils/errors';

function makeRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('maps AppError to its statusCode and message', () => {
    const res = makeRes();
    errorHandler(new NotFoundError('thing missing'), {} as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'thing missing' });
  });

  it('maps ValidationError to 400', () => {
    const res = makeRes();
    errorHandler(new ValidationError('bad'), {} as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'bad' });
  });

  it('maps unknown errors to 500 with generic message', () => {
    const res = makeRes();
    const spy = jest.spyOn(console, 'error').mockImplementation();
    errorHandler(new Error('boom internal'), {} as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

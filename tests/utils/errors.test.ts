import {
  AppError, ValidationError, UnauthorizedError, NotFoundError, ConflictError,
} from '@/utils/errors';

describe('error hierarchy', () => {
  it('AppError carries statusCode and message', () => {
    const e = new AppError(418, 'teapot');
    expect(e.statusCode).toBe(418);
    expect(e.message).toBe('teapot');
    expect(e).toBeInstanceOf(Error);
  });
  it('ValidationError is 400', () => {
    expect(new ValidationError('bad').statusCode).toBe(400);
  });
  it('UnauthorizedError is 401', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new UnauthorizedError().message).toBe('Unauthorized');
  });
  it('NotFoundError is 404', () => {
    expect(new NotFoundError('missing').statusCode).toBe(404);
  });
  it('ConflictError is 409', () => {
    expect(new ConflictError('dup').statusCode).toBe(409);
  });
});

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export type ValidationSource = 'body' | 'params' | 'query';

export function validate(schema: ZodSchema, source: ValidationSource): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(toValidationError(result.error));
      return;
    }
    Object.assign(req[source] as object, result.data);
    next();
  };
}

function toValidationError(err: ZodError): ValidationError {
  const message = err.issues
    .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('; ');
  return new ValidationError(message);
}

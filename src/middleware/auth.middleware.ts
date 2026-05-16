import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthorizedError } from '../utils/errors';
import type { TokenSigner } from '../services/token.service';

export function makeAuthGuard(deps: { signer: TokenSigner }): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header) throw new UnauthorizedError('Missing Authorization header');
      const [scheme, token] = header.split(' ');
      if (scheme !== 'Bearer' || !token) {
        throw new UnauthorizedError('Authorization header must use Bearer scheme');
      }
      res.locals.user = deps.signer.verify(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}

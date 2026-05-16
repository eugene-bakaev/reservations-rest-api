import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

export function makeAuthGuard(deps: { jwtSecret: string }): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header) throw new UnauthorizedError('Missing Authorization header');
      const [scheme, token] = header.split(' ');
      if (scheme !== 'Bearer' || !token) {
        throw new UnauthorizedError('Authorization header must use Bearer scheme');
      }
      res.locals.user = verifyToken(token, deps.jwtSecret);
      next();
    } catch (err) {
      next(err);
    }
  };
}

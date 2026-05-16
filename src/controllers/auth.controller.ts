import { Request, Response } from 'express';
import { registerUser, loginUser, type AuthServiceDeps } from '../services/auth.service';

export type AuthController = {
  register(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
};

export function makeAuthController(deps: AuthServiceDeps): AuthController {
  return {
    async register(req, res) {
      const result = await registerUser(req.body, deps);
      res.status(201).json(result);
    },
    async login(req, res) {
      const result = await loginUser(req.body, deps);
      res.json(result);
    },
  };
}

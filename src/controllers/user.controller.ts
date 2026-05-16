import { Request, Response } from 'express';
import { getUserReservations, type UserServiceDeps } from '../services/user.service';

export type UserController = {
  getReservations(req: Request, res: Response): Promise<void>;
};

export function makeUserController(deps: UserServiceDeps): UserController {
  return {
    async getReservations(req, res) {
      const id = Number(req.params.id);
      const result = await getUserReservations(id, deps);
      res.json(result);
    },
  };
}

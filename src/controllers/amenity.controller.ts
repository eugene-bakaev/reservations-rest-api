import { Request, Response } from 'express';
import { getAmenityReservations, type AmenityServiceDeps } from '../services/amenity.service';

export type AmenityController = {
  getReservations(req: Request, res: Response): Promise<void>;
};

export function makeAmenityController(deps: AmenityServiceDeps): AmenityController {
  return {
    async getReservations(req, res) {
      const id = Number(req.params.id);
      const date = Number(req.query.date);
      const result = await getAmenityReservations(id, date, deps);
      res.json(result);
    },
  };
}

import { once } from 'events';
import { pipeline } from 'stream/promises';
import { Router, Request, Response, NextFunction } from 'express';
import { parseCsvStream } from '../services/csv.service';
import { JsonArrayTransform } from '../streams/json-array-transform';
import { makeAuthGuard } from '../middleware/auth.middleware';
import { ValidationError } from '../utils/errors';
import type { TokenSigner } from '../services/token.service';

const ACCEPTED_CONTENT_TYPES = ['text/csv', 'application/csv'];

export function makeCsvRouter(deps: { signer: TokenSigner }): Router {
  const router = Router();
  const guard = makeAuthGuard({ signer: deps.signer });

  router.post('/parse', guard, async (req: Request, res: Response, next: NextFunction) => {
    const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    if (!ACCEPTED_CONTENT_TYPES.includes(contentType)) {
      next(new ValidationError(`Expected Content-Type ${ACCEPTED_CONTENT_TYPES.join(' or ')}`));
      return;
    }

    const parser = parseCsvStream(req);
    const transform = new JsonArrayTransform();

    const pipelineDone = pipeline(parser, transform).catch((err: Error) => err);

    res.setHeader('Content-Type', 'application/json');

    try {
      for await (const chunk of transform) {
        if (!res.write(chunk as Buffer)) {
          await once(res, 'drain');
        }
      }
      res.end();
    } catch (err) {
      if (!res.headersSent) {
        next(new ValidationError(`Failed to parse CSV: ${(err as Error).message}`));
      } else {
        res.destroy(err as Error);
      }
    }

    await pipelineDone;
  });

  return router;
}

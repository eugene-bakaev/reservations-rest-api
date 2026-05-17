import { z } from './zod';

export const csvRowSchema = z.record(z.string(), z.string());
export const csvParseResponseSchema = z.array(csvRowSchema);

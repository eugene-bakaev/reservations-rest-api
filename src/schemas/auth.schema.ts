import { z } from 'zod';

export const credentialsSchema = z.object({
  username: z.string().min(3).max(255),
  password: z.string().min(8).max(255),
});

export type Credentials = z.infer<typeof credentialsSchema>;

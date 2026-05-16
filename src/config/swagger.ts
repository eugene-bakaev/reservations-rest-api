import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  amenityReservationsParamsSchema,
  amenityReservationsQuerySchema,
  formattedReservationSchema,
} from '../schemas/amenity.schema';
import { userReservationsParamsSchema, userReservationsResponseSchema } from '../schemas/user.schema';
import { credentialsSchema, loginResponseSchema, registerResponseSchema } from '../schemas/auth.schema';
import { csvParseResponseSchema } from '../schemas/csv.schema';

extendZodWithOpenApi(z);

const errorSchema = z.object({ error: z.string() }).openapi('Error');

export function buildOpenApiSpec(): ReturnType<OpenApiGeneratorV3['generateDocument']> {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    summary: 'Register a new user',
    request: { body: { content: { 'application/json': { schema: credentialsSchema } } } },
    responses: {
      201: { description: 'Created', content: { 'application/json': { schema: registerResponseSchema } } },
      409: { description: 'Username taken', content: { 'application/json': { schema: errorSchema } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    summary: 'Login and receive a JWT',
    request: { body: { content: { 'application/json': { schema: credentialsSchema } } } },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: loginResponseSchema } } },
      401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorSchema } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/amenities/{id}/reservations',
    summary: 'List reservations for an amenity on a given day',
    request: {
      params: amenityReservationsParamsSchema,
      query: amenityReservationsQuerySchema,
    },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: z.array(formattedReservationSchema) } } },
      404: { description: 'Amenity not found', content: { 'application/json': { schema: errorSchema } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{id}/reservations',
    summary: 'List a user reservations grouped by day',
    request: { params: userReservationsParamsSchema },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: userReservationsResponseSchema } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/csv/parse',
    summary: 'Parse CSV body (auth required)',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'text/csv': { schema: z.string().openapi({ type: 'string' }) },
        },
      },
    },
    responses: {
      200: { description: 'Parsed rows', content: { 'application/json': { schema: csvParseResponseSchema } } },
      400: { description: 'Bad request', content: { 'application/json': { schema: errorSchema } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: errorSchema } } },
    },
  });

  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: { title: 'Reservations API', version: '1.0.0' },
  });
}

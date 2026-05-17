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

export function buildOpenApiSpec(): ReturnType<OpenApiGeneratorV3['generateDocument']> {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  const Error = registry.register('Error', z.object({ error: z.string() }));
  const Credentials = registry.register('Credentials', credentialsSchema);
  const RegisterResponse = registry.register('RegisterResponse', registerResponseSchema);
  const LoginResponse = registry.register('LoginResponse', loginResponseSchema);
  const FormattedReservation = registry.register('FormattedReservation', formattedReservationSchema);
  const UserReservationsResponse = registry.register('UserReservationsResponse', userReservationsResponseSchema);
  const CsvParseResponse = registry.register('CsvParseResponse', csvParseResponseSchema);

  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    summary: 'Register a new user',
    request: { body: { content: { 'application/json': { schema: Credentials } } } },
    responses: {
      201: { description: 'Created', content: { 'application/json': { schema: RegisterResponse } } },
      409: { description: 'Username taken', content: { 'application/json': { schema: Error } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    summary: 'Login and receive a JWT',
    description: 'A seeded legacy user is available for convenience: any `legacy_user_<id>` where id is in 1..100 (except 11/67/80/99). The example body below is pre-filled with valid credentials.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: Credentials,
            example: { username: 'legacy_user_42', password: 'Pass123$' },
          },
        },
      },
    },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: LoginResponse } } },
      401: { description: 'Invalid credentials', content: { 'application/json': { schema: Error } } },
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
      200: { description: 'OK', content: { 'application/json': { schema: z.array(FormattedReservation) } } },
      404: { description: 'Amenity not found', content: { 'application/json': { schema: Error } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{id}/reservations',
    summary: 'List a user reservations grouped by day',
    request: { params: userReservationsParamsSchema },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: UserReservationsResponse } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/csv/parse',
    summary: 'Parse CSV body (auth required)',
    description: 'Requires a Bearer JWT. Use `POST /auth/login` to obtain one, then click the **Authorize** button in the top-right corner of this page and paste the token.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'text/csv': { schema: z.string().openapi({ type: 'string', format: 'binary' }) },
        },
      },
    },
    responses: {
      200: { description: 'Parsed rows', content: { 'application/json': { schema: CsvParseResponse } } },
      400: { description: 'Bad request', content: { 'application/json': { schema: Error } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: Error } } },
    },
  });

  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: { title: 'Reservations API', version: '1.0.0' },
  });
}

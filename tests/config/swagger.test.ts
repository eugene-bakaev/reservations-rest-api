import { buildOpenApiSpec } from '@/config/swagger';

describe('buildOpenApiSpec', () => {
  const spec = buildOpenApiSpec();

  it('declares OpenAPI 3.0 with the API title and version', () => {
    expect(spec.openapi).toBe('3.0.0');
    expect(spec.info.title).toBe('Reservations API');
    expect(spec.info.version).toBe('1.0.0');
  });

  it('registers every documented path', () => {
    const paths = Object.keys(spec.paths ?? {});
    expect(paths).toEqual(
      expect.arrayContaining([
        '/auth/register',
        '/auth/login',
        '/amenities/{id}/reservations',
        '/users/{id}/reservations',
        '/csv/parse',
      ]),
    );
  });

  it('declares the bearerAuth security scheme and applies it to /csv/parse', () => {
    expect(spec.components?.securitySchemes?.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
    const csvParse = spec.paths?.['/csv/parse']?.post;
    expect(csvParse?.security).toEqual([{ bearerAuth: [] }]);
  });
});

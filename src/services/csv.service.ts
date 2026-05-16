import { parse as parseSync } from 'csv-parse/sync';
import { parse as parseStream } from 'csv-parse';
import type { Readable } from 'stream';
import { ValidationError } from '../utils/errors';

export type CsvRow = Record<string, string>;

const CSV_OPTIONS = {
  delimiter: ';',
  columns: true,
  skip_empty_lines: true,
  trim: true,
} as const;

export function parseCsv<T extends CsvRow = CsvRow>(input: string | Buffer): T[] {
  const text = typeof input === 'string' ? input : input.toString('utf8');
  if (text.trim() === '') return [];

  try {
    return parseSync(text, CSV_OPTIONS) as T[];
  } catch (err) {
    throw new ValidationError(`Failed to parse CSV: ${(err as Error).message}`);
  }
}

export function parseCsvStream(input: Readable): Readable {
  const parser = parseStream(CSV_OPTIONS);
  input.pipe(parser);
  return parser;
}

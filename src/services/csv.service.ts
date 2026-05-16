import { parse } from 'csv-parse/sync';
import { ValidationError } from '../utils/errors';

export type CsvRow = Record<string, string>;

export function parseCsv<T extends CsvRow = CsvRow>(input: string | Buffer): T[] {
  const text = typeof input === 'string' ? input : input.toString('utf8');
  if (text.trim() === '') return [];

  try {
    return parse(text, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as T[];
  } catch (err) {
    throw new ValidationError(`Failed to parse CSV: ${(err as Error).message}`);
  }
}

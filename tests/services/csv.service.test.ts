import { Readable } from 'stream';
import { parseCsv, parseCsvStream } from '@/services/csv.service';

describe('parseCsv', () => {
  it('parses semicolon-delimited CSV with header row', () => {
    const input = 'id;name\n1;Gym\n2;Pool';
    expect(parseCsv(input)).toEqual([
      { id: '1', name: 'Gym' },
      { id: '2', name: 'Pool' },
    ]);
  });

  it('returns empty array when only header is present', () => {
    expect(parseCsv('id;name')).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('handles trailing newline', () => {
    const input = 'id;name\n1;Gym\n';
    expect(parseCsv(input)).toEqual([{ id: '1', name: 'Gym' }]);
  });

  it('accepts a Buffer input', () => {
    const buf = Buffer.from('id;name\n1;Gym', 'utf8');
    expect(parseCsv(buf)).toEqual([{ id: '1', name: 'Gym' }]);
  });

  it('throws ValidationError on malformed CSV', () => {
    const input = 'id;name\n1;"unterminated';
    expect(() => parseCsv(input)).toThrow(/CSV/);
  });
});

async function collectStream(stream: Readable): Promise<unknown[]> {
  const rows: unknown[] = [];
  for await (const row of stream) {
    rows.push(row);
  }
  return rows;
}

describe('parseCsvStream', () => {
  it('parses a streamed CSV with header row into row objects', async () => {
    const input = Readable.from('id;name\n1;Gym\n2;Pool');
    expect(await collectStream(parseCsvStream(input))).toEqual([
      { id: '1', name: 'Gym' },
      { id: '2', name: 'Pool' },
    ]);
  });

  it('emits no rows when only header is present', async () => {
    const input = Readable.from('id;name');
    expect(await collectStream(parseCsvStream(input))).toEqual([]);
  });

  it('emits no rows for empty input', async () => {
    const input = Readable.from('');
    expect(await collectStream(parseCsvStream(input))).toEqual([]);
  });

  it('parses input split across many chunks', async () => {
    const chunks = ['id;n', 'ame\n1;G', 'ym\n2;Pool\n'];
    const input = Readable.from(chunks);
    expect(await collectStream(parseCsvStream(input))).toEqual([
      { id: '1', name: 'Gym' },
      { id: '2', name: 'Pool' },
    ]);
  });

  it('errors on malformed CSV', async () => {
    const input = Readable.from('id;name\n1;"unterminated');
    await expect(collectStream(parseCsvStream(input))).rejects.toThrow();
  });
});

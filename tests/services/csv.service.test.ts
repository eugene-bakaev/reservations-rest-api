import { parseCsv } from '@/services/csv.service';

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

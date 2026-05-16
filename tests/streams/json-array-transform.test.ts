import { Readable } from 'stream';
import { JsonArrayTransform } from '@/streams/json-array-transform';

async function collect(stream: Readable): Promise<string> {
  let out = '';
  for await (const chunk of stream) {
    out += chunk.toString('utf8');
  }
  return out;
}

describe('JsonArrayTransform', () => {
  it('emits [] for an empty stream', async () => {
    const out = await collect(Readable.from([]).pipe(new JsonArrayTransform()));
    expect(out).toBe('[]');
    expect(JSON.parse(out)).toEqual([]);
  });

  it('emits a one-element array for a single object', async () => {
    const out = await collect(
      Readable.from([{ id: '1', name: 'Gym' }]).pipe(new JsonArrayTransform()),
    );
    expect(JSON.parse(out)).toEqual([{ id: '1', name: 'Gym' }]);
  });

  it('emits a comma-separated array for many objects', async () => {
    const rows = [
      { id: '1', name: 'Gym' },
      { id: '2', name: 'Pool' },
      { id: '3', name: 'Sauna' },
    ];
    const out = await collect(Readable.from(rows).pipe(new JsonArrayTransform()));
    expect(JSON.parse(out)).toEqual(rows);
  });
});

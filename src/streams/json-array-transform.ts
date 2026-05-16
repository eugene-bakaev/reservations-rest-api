import { Transform, TransformCallback } from 'stream';

export class JsonArrayTransform extends Transform {
  private first = true;

  constructor() {
    super({ writableObjectMode: true });
  }

  _transform(row: unknown, _enc: BufferEncoding, cb: TransformCallback): void {
    const prefix = this.first ? '[' : ',';
    this.first = false;
    cb(null, prefix + JSON.stringify(row));
  }

  _flush(cb: TransformCallback): void {
    cb(null, this.first ? '[]' : ']');
  }
}

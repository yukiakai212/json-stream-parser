import { EventEmitter } from 'events';

export class JSONStreamParser extends EventEmitter {
  private buffer = '';
  private depthCurly = 0;
  private depthSquare = 0;
  private inString = false;
  private escape = false;

  write(chunk: string | Buffer) {
    const data = chunk.toString();
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      this.buffer += char;

      if (this.inString) {
        if (char === '"' && !this.buffer.endsWith('\\"')) {
          this.inString = false;
        }
        continue;
      }

      if (char === '"') {
        this.inString = true;
        continue;
      }

      if (char === '{') this.depthCurly++;
      else if (char === '}') this.depthCurly--;
      else if (char === '[') this.depthSquare++;
      else if (char === ']') this.depthSquare--;

      // Nếu bất kỳ depth nào âm, JSON sai cú pháp
      if (this.depthCurly < 0 || this.depthSquare < 0) {
        this.emit('error', new Error('Unexpected closing bracket or brace'));
        this.reset();
        return;
      }

      // Nếu cả 2 đều bằng 0 và không đang trong chuỗi -> hoàn tất một JSON
      if (this.depthCurly === 0 && this.depthSquare === 0 && !this.inString) {
        try {
          const parsed = JSON.parse(this.buffer);
          this.emit('data', parsed);
        } catch (err) {
          this.emit('error', new Error(`Invalid JSON: ${err}`));
        }
        this.reset();
      }
    }
  }

  private reset() {
    this.buffer = '';
    this.depthCurly = 0;
    this.depthSquare = 0;
    this.inString = false;
    this.escape = false;
  }
}

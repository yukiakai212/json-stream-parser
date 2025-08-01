import { describe, it, expect, vi } from 'vitest';
import { JsonStreamParser } from '../src/index.js'; // giả định parser nằm trong index.ts

const toChunks = (str: string, chunkSize = 4) => {
  const chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks;
};

describe('JsonStreamParser', () => {
  it('should parse single valid JSON object split into chunks', () => {
    const input = { hello: 'world', count: 42 };
    const jsonStr = JSON.stringify(input);

    const parser = new JsonStreamParser();
    const onData = vi.fn();
    parser.on('data', onData);

    for (const chunk of toChunks(jsonStr)) {
      parser.write(chunk);
    }

    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith(input);
  });

  it('should parse multiple JSON objects from stream', () => {
    const a = { a: 1 };
    const b = [1, 2, 3];
    const str = JSON.stringify(a) + JSON.stringify(b);

    const parser = new JsonStreamParser();
    const onData = vi.fn();
    parser.on('data', onData);

    for (const chunk of toChunks(str, 3)) {
      parser.write(chunk);
    }

    expect(onData).toHaveBeenCalledTimes(2);
    expect(onData).toHaveBeenNthCalledWith(1, a);
    expect(onData).toHaveBeenNthCalledWith(2, b);
  });

  it('should emit error on invalid JSON', () => {
    const parser = new JsonStreamParser();
    const onError = vi.fn();
    parser.on('error', onError);

    const invalid = '{"foo": 1, "bar": }'; // thiếu giá trị

    for (const chunk of toChunks(invalid)) {
      parser.write(chunk);
    }

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('should parse nested structures with strings correctly', () => {
    const input = {
      text: '{"quoted": "string with { and } and \ and \\ and [ ] inside"}',
      arr: ['[1,2]', '{3,4}'],
    };

    const jsonStr = JSON.stringify(input);

    const parser = new JsonStreamParser();
    const onData = vi.fn();
    parser.on('data', onData);

    for (const chunk of toChunks(jsonStr, 5)) {
      parser.write(chunk);
    }

    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith(input);
  });
});

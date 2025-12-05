# @yukiakai/json-stream-parser

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]

[![Build Status][github-build-url]][github-url]
[![codecov][codecov-image]][codecov-url]

A lightweight and zero-dependency **streaming JSON parser** for Node.js and browsers.  
It handles **fragmented** JSON input — such as from sockets, WebSockets, or chunked streams — and emits **complete JSON values** when they are fully parsed.

---

## Features

- Parses streamed JSON incrementally (like from `.write()` chunks)
- Emits complete JSON values when available
- Detects incomplete vs. invalid JSON properly
- Skips strings `"..."` correctly to avoid false `{` or `}` detection
- Tiny and dependency-free

---

## Installation

```bash
npm install @yukiakai/json-stream-parser
````

---

## Usage

```ts
import { JsonStreamParser } from '@yukiakai/json-stream-parser';

const parser = new JsonStreamParser();

parser.on('data', (jsonValue) => {
  console.log('Parsed:', jsonValue);
});

parser.on('error', (err) => {
  console.error('Invalid JSON:', err.message);
});

// Simulate fragmented incoming JSON
parser.write('{"id":1,');
parser.write('"name":"Alice"}');
parser.write('\n{"id":2,"name":"B');
parser.write('ob"}');
```

---

## API

### `new JsonStreamParser()`

Creates a new instance of the streaming parser.

### `parser.write(chunk: string | Buffer)`

Feeds partial input into the parser.
It automatically buffers and emits full JSON values when complete.

### Events

* `data`: `(value: any)` – Emitted when a full valid JSON value is parsed.
* `error`: `(error: Error)` – Emitted if an invalid JSON structure is detected (e.g. unclosed brace).

---

## Example: With Socket

```ts
import net from 'net';
import { JsonStreamParser } from '@yukiakai/json-stream-parser';

const server = net.createServer((socket) => {
  const parser = new JsonStreamParser();

  parser.on('data', (obj) => {
    console.log('Received JSON:', obj);
  });

  parser.on('error', (err) => {
    console.warn('Bad JSON:', err.message);
    socket.destroy(); // or handle gracefully
  });

  socket.on('data', (chunk) => {
    parser.write(chunk);
  });
});

server.listen(3000);
```

---

## Tests

```bash
npm run test
```

---

## License

MIT © [Yuki Akai](https://github.com/yukiakai212)

---

[npm-downloads-image]: https://badgen.net/npm/dm/@yukiakai/json-stream-parser
[npm-downloads-url]: https://www.npmjs.com/package/@yukiakai/json-stream-parser
[npm-url]: https://www.npmjs.com/package/@yukiakai/json-stream-parser
[npm-version-image]: https://badgen.net/npm/v/@yukiakai/json-stream-parser
[github-build-url]: https://github.com/yukiakai212/json-stream-parser/actions/workflows/build.yml/badge.svg
[github-url]: https://github.com/yukiakai212/json-stream-parser/
[codecov-image]: https://codecov.io/gh/yukiakai212/json-stream-parser/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/yukiakai212/json-stream-parser

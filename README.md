# pino-seq ![Build](https://github.com/datalust/pino-seq/workflows/Test/badge.svg) ![Publish](https://github.com/datalust/pino-seq/workflows/Publish/badge.svg) [![NPM](https://img.shields.io/npm/v/pino-seq.svg)](https://www.npmjs.com/package/pino-seq)

A stream to send [Pino](https://github.com/pinojs/pino) events to [Seq](https://datalust.co/seq). Tested with Node.js versions 18.x and up.

**Now written in TypeScript** with automatic type definitions and full ES Module support!

## Installation

```bash
npm install pino-seq
```

## Usage

Use the `createStream()` method to create a Pino stream configuration, passing `serverUrl`, `apiKey` and batching parameters.

### JavaScript (ESM)

```js
import pino from 'pino';
import pinoToSeq from 'pino-seq';

const stream = pinoToSeq.createStream({ serverUrl: 'http://localhost:5341' });
const logger = pino({ name: 'pino-seq example' }, stream);

logger.info('Hello Seq, from Pino');

const frLogger = logger.child({ lang: 'fr' });
frLogger.warn('au reviour');

// Flush logs before exit
await stream.flush();
```

### TypeScript

```typescript
import pino from 'pino';
import { createStream, PinoSeqStreamConfig } from 'pino-seq';

const config: PinoSeqStreamConfig = {
  serverUrl: 'http://localhost:5341',
  apiKey: 'your-api-key', // optional
  logOtherAs: 'Information' // optional
};

const stream = createStream(config);
const logger = pino({ name: 'pino-seq example' }, stream);

logger.info('Hello Seq, from Pino');
```

## Configuration

The `createStream()` function accepts a configuration object with the following properties:

- `serverUrl` (string): The URL of your Seq server
- `apiKey` (string, optional): API key for authentication
- `logOtherAs` (string, optional): Log level for unstructured messages ('Verbose', 'Debug', 'Information', 'Warning', 'Error', 'Fatal')
- `additionalProperties` (object, optional): Additional properties to add to all log events
- `maxBatchingTime` (number, optional): Maximum time in milliseconds to wait before sending a batch
- `eventSizeLimit` (number, optional): Maximum size of a single event
- `batchSizeLimit` (number, optional): Maximum size of a batch
- `onError` (function, optional): Error handler callback

## Development

### Running Tests

```bash
npm test
```

### Testing with Local Seq Instance

A Docker Compose configuration is provided for local testing:

```bash
# Start Seq
docker compose up -d

# Run examples
npm start        # JavaScript example
npm run start:ts # TypeScript example

# View logs at http://localhost:5341

# Stop Seq
docker compose down
```

### Building

```bash
npm run build
```

The build produces ES Module output in the `dist/` directory with automatic type definitions.

**Note:** This package is ESM-only (like its dependency `seq-logging`). If you need CommonJS support, please use version 2.x or earlier.

## Acknowledgements

Originally by Simi Hartstein and published as `simihartstein/pino-seq`; maintainership transferred to Datalust at version 0.5.

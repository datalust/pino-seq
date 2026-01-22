# pino-seq ![Build](https://github.com/datalust/pino-seq/workflows/Test/badge.svg) ![Publish](https://github.com/datalust/pino-seq/workflows/Publish/badge.svg) [![NPM](https://img.shields.io/npm/v/pino-seq.svg)](https://www.npmjs.com/package/pino-seq)

A stream to send [Pino](https://github.com/pinojs/pino) events to [Seq](https://datalust.co/seq). Tested with Node.js versions 18.x and up.

**Now written in TypeScript** with automatic type definitions and full ES Module support!

## Installation

```bash
npm install pino-seq
```

## Usage

Use the `createStream()` method to create a Pino stream configuration, passing `serverUrl`, `apiKey` and batching parameters.

This example works in both JavaScript and TypeScript projects:

```javascript
import pino from 'pino';
import { createStream } from 'pino-seq';

// Create a stream to Seq
const stream = createStream({ 
  serverUrl: 'http://localhost:5341',
  apiKey: 'your-api-key' // optional
});

// Create a Pino logger
const logger = pino({ name: 'pino-seq example' }, stream);

// Log some messages
logger.info('Hello Seq, from Pino');

// Child loggers work too
const frLogger = logger.child({ lang: 'fr' });
frLogger.warn('au reviour');

// Flush logs before exit
await stream.flush();
```

For TypeScript projects with explicit typing:

```typescript
import { createStream, PinoSeqStreamConfig } from 'pino-seq';

const config: PinoSeqStreamConfig = {
  serverUrl: 'http://localhost:5341',
  // ... see Configuration section below for all options
};
const stream = createStream(config);
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

## Acknowledgements

Originally by Simi Hartstein and published as `simihartstein/pino-seq`; maintainership transferred to Datalust at version 0.5.

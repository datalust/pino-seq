// This example works in both JavaScript and TypeScript projects
// For TypeScript: rename to .ts or use as-is (types will be inferred)

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

# pino-seq ![Build](https://github.com/datalust/pino-seq/workflows/Test/badge.svg) ![Publish](https://github.com/datalust/pino-seq/workflows/Publish/badge.svg) [![NPM](https://img.shields.io/npm/v/pino-seq.svg)](https://www.npmjs.com/package/pino-seq)

A stream to send [Pino](https://github.com/pinojs/pino) events to [Seq](https://datalust.co/seq). Tested with Node.js versions 18.x and up.

Use the `createStream()` method to create a Pino stream configuration, passing `serverUrl`, `apiKey` and batching parameters.

```js
import pino from 'pino';
import pinoToSeq from 'pino-seq';

let stream = pinoToSeq.createStream({ serverUrl: 'http://localhost:5341' });
let logger = pino({ name: 'pino-seq example' }, stream);

logger.info('Hello Seq, from Pino');

let frLogger = logger.child({ lang: 'fr' });
frLogger.warn('au reviour');
```

### Acknowledgements

Originally by Simi Hartstein and published as `simihartstein/pino-seq`; maintainership transferred to Datalust at version 0.5.

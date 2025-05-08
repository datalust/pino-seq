# pino-seq ![Build](https://github.com/datalust/pino-seq/workflows/Test/badge.svg) ![Publish](https://github.com/datalust/pino-seq/workflows/Publish/badge.svg) [![NPM](https://img.shields.io/npm/v/pino-seq.svg)](https://www.npmjs.com/package/pino-seq)

A stream to send [Pino](https://github.com/pinojs/pino) events to [Seq](https://datalust.co/seq). Tested with Node.js versions 18.x and up.

### Out-of-process (transport) usage <sup>recommended</sup>

First, install and use `pino` in your Node.js app, following the instructions in the [Pino documentation](https://getpino.io).

This will look something like:

```js
const logger = (await import('pino'))();
logger.info('Hello, World!');
```

Pino will, by default, write newline-delimited JSON events to `STDOUT`. These events are piped into the `pino-seq` transport.

First, install `pino-seq` as a global tool:

```shell
npm install -g pino-seq
```

Then, pipe the output of your Pino-enabled app to it:

```shell
node your-app.js | pino-seq --serverUrl http://localhost:5341 --apiKey 1234567890 --property applicationName=PinoSeqExampleApp
```

`pino-seq` accepts the following parameters:

- `serverUrl` - this is the base URL of your Seq server; if omitted, the default value of `http://localhost:5341` will be used
- `apiKey` - your Seq API key, if one is required; the default does not send an API key
- `logOtherAs` - log other output (not formatted through pino) to seq at this loglevel. Useful to capture messages if the node process crashes or smilar.
- `property` - add additional properties to all logs sent to Seq

#### Capturing other output

To enable capture of output not formatted through pino use the `logOtherAs` parameter. It's possible to use different settings for STDOUT/STDERR like this, when using bash:

```shell
node your-app.js 2> >(pino-seq --logOtherAs Error --serverUrl http://localhost:5341 --apiKey 1234567890) > >(pino-seq --logOtherAs Information --serverUrl http://localhost:5341 --apiKey 1234567890)
```

### In-process (stream) usage

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

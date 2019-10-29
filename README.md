# pino-seq [![Build status](https://ci.appveyor.com/api/projects/status/mecbtwbuq7vvkrg3?svg=true)](https://ci.appveyor.com/project/datalust/pino-seq) [![NPM](https://img.shields.io/npm/v/pino-seq.svg)](https://www.npmjs.com/package/pino-seq)-->

A stream to send [Pino](https://github.com/pinojs/pino) events to [Seq](https://datalust.co/seq). Tested with Node.js versions 4.2.2 and up.

### Transport usage

`node foo | pino-seq --apiKey <key> --serverUrl http://localhost:5341`

### Stream usage

Use the `createStream()` method to create a Pino stream configuration, passing `serverUrl`, `apiKey` and batching parameters.

```js
let pino = require('pino');
let pinoToSeq = require('pino-seq');

let stream = pinoToSeq.createStream({serverUrl: "http://localhost:5341"});
let logger = pino({name: "pino-seq example"}, stream);

logger.info("Hello Seq, from Pino");

let frLogger = logger.child({lang: "fr"});
frLogger.warn("au reviour");
```

See the [Pino API](https://github.com/pinojs/pino/blob/master/docs/api.md) for how to use the logger.

### Acknowledgements

Originally by Simi Hartstein and published as `simihartstein/pino-seq`; maintainership transferred to Datalust at version 0.5.

<!--# bunyan-seq [![Build status](https://ci.appveyor.com/api/projects/status/mrcbbrd33prih7bb?svg=true)](https://ci.appveyor.com/project/datalust/bunyan-seq) [![NPM](https://img.shields.io/npm/v/bunyan-seq.svg)](https://www.npmjs.com/package/bunyan-seq)-->


A stream to send [Pino](https://github.com/pinojs/pino) events to [Seq](https://getseq.net). Tested with Node.js versions 4.2.2 and up.

### Usage

Use the `createStream()` method to create a Pino stream configuration, passing `serverUrl`, `apiKey` and batching parameters.

```js
let pino = require('pino');
let pinoToSeq = require('pinoToSeq');

let stream = pinoToSeq.createStream({serverUrl: "http://localhost:5341"});
let logger = pino({name: "pino-seq example"}, stream);

logger.info("Hello Seq, from Pino");

let frLogger = logger.child({lang: "fr"});
frLogger.warn("au reviour");
```

See the [Pino API](https://github.com/pinojs/pino/blob/master/docs/api.md) for how to use the logger

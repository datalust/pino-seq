"use strict";

let pino = require('pino');
let pinoToSeq = require('../index');


function onError(err, stream) {
  console.log("Logging failed: ", err);
}

let stream = pinoToSeq.createStream({serverUrl: "http://localhost:5341", onError});
let logger = pino({name: "pino-seq example"}, stream);

logger.info("Hello Seq, from Pino");
logger.error(); // should emit an error

let frLogger = logger.child({lang: "fr"});
frLogger.warn("au reviour");

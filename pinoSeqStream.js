"use strict";

let stream = require("stream");
let seq = require('seq-logging');

let LEVEL_NAMES = {
  10: 'Verbose',
  20: 'Debug',
  30: 'Information',
  40: 'Warning',
  50: 'Error',
  60: 'Fatal'
};

class PinoSeqStream extends stream.Writable {
  constructor(config) {
    super();

    let loggerConfig = config == null ? {} : { ...config };
    let onError = loggerConfig.onError || function () { };
    loggerConfig.onError = (e) => {
      this.emit('error', e);
      onError(e);
    };
    this._logger = new seq.Logger(loggerConfig);

    // At least one listener must be specified, or else the default behavior will
    // be to throw an exception (and halt logging).
    this.on('error', function () { });
  }

  write(event) {
    if (!event) {
      this.emit("error", new Error("SeqStream.write() requires an event parameter to be provided."));
      return;
    }

    let eventCopy = JSON.parse(event);

    let { time, level, msg, exception, v, err, ...props } = eventCopy

    let forSeq = {
      timestamp: new Date(time),
      level: LEVEL_NAMES[level],
      messageTemplate: msg,
      properties: props
    }

    if (err) {
      forSeq.exception = err
    }

    this._logger.emit(forSeq);
  }

  // Force the underlying logger to flush at the time of the call
  // and wait for pending writes to complete
  flush() {
    return this._logger.flush();
  }

  // A browser only function that queues events for sending using the
  // navigator.sendBeacon() API.  This may work in an unload or pagehide event
  // handler when a normal flush() would not.
  // Events over 63K in length are discarded (with a warning sent in its place) 
  // and the total size batch will be no more than 63K in length.
  flushToBeacon() {
    return this._logger.flushToBeacon();
  }
}

module.exports = PinoSeqStream;

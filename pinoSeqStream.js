"use strict";

let stream = require('stream');
let seq = require('seq-logging');

let LEVEL_NAMES = {
  10: 'Verbose',
  20: 'Debug',
  30: 'Information',
  40: 'Warning',
  50: 'Error',
  60: 'Fatal'
};

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

class PinoSeqStream extends stream.Writable {
  constructor(config) {
    super();

    let { additionalProperties, logOtherAs, ...loggerConfig } = config == null ? {} : { ...config };
    loggerConfig.onError = loggerConfig.onError || function (e) { console.error('[PinoSeqStream] Log batch failed\n', e) };
    this._additionalProperties = additionalProperties;
    this._logOtherAs = logOtherAs;
    this._bufferTime = false;
    this._buffer = [];
    this._logger = new seq.Logger(loggerConfig);
  }

  _write(message, enc, cb) {
    if (message) {
      try {
        let eventCopy = JSON.parse(message);

        let { time, level, msg, err, error, stack, ...props } = eventCopy;

        // Get the properties from the error
        let { message: errMessage, stack: errStack, ...errorProps } = err || error || {};

        let forSeq = {
          timestamp: new Date(time),
          level: LEVEL_NAMES[level],
          messageTemplate: msg ? msg : errMessage,
          properties: { ...this._additionalProperties, ...errorProps, ...props },
          exception: stack ? stack : errStack
        };

        // Handle sending to sql separatly
        try {
          // If we get a new correctly formatted message, flush the buffer
          if (this._logOtherAs) {
            this.flushBuffer();
          }
          this._logger.emit(forSeq);
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        const msg = String(message);
        console.error(msg);
        if (this._logOtherAs) {
          this.handleUnstructuredMessage(msg);
        }
      }
    }
    cb();
  }

  handleUnstructuredMessage(message) {
    this._bufferTime = this._bufferTime ? this._bufferTime : new Date();
    this._buffer.push(message);
    // Flush the message buffer after 1 sec of inacticity
    if (!this._flushTimer) {
      this._flushTimer = setTimeout(() => {
        this.flushBuffer();
      }, 1000);
    }
  }

  flushBuffer() {
    if (this._buffer.length) {
      try {
        // No need to flush again
        if (this._flushTimer) {
          clearTimeout(this._flushTimer);
        }
        this._logger.emit({
          timestamp: this._bufferTime,
          level: this._logOtherAs,
          messageTemplate: this._buffer.join('\n'),
          properties: { ...this._additionalProperties },
        });
        this._bufferTime = false;
        this._buffer = [];
      } catch (err) {
        console.error(err);
      }
    }
  }

  // When flushing logs pino doesn't actually call _final and wait for the logs to flush when using streams
  // Instead it calls a poorly documented flushSync method that is not part of the stream.Writable interface
  // As the name suggests the function is not async and will block the event loop until the logs are flushed
  // Normally this wouldn't be an issue, but when running inside a Cloud function the function will often exit before the logs are flushed,
  // so this implementation is in line with what pino recommends https://getpino.io/#/docs/asynchronous?id=aws-lambda
  flushSync() {
    this.flushBuffer();

    let running = true;
    this._logger
      .flush()
      .then(() => {
        running = false;
      })
      .catch((err) => {
        console.error(err);
        running = false;
      });

    while (running) {
      msleep(100);
    }
  }

  // Force the underlying logger to flush at the time of the call
  // and wait for pending writes to complete
  _final(callback) {
    this.flushBuffer();
    this._logger
      .close()
      .then(() => callback())
      .catch((err) => callback(err));
  }
}

module.exports = PinoSeqStream;

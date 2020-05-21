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

class PinoSeqStream extends stream.Writable {
  constructor(config) {
    super();

    let { logOtherAs, ...loggerConfig } = config == null ? {} : { ...config };
    let onError = loggerConfig.onError || function () { };
    loggerConfig.onError = (e) => {
      this.destroy(e);
      onError(e);
    };
    this._logOtherAs = logOtherAs;
    this._bufferTime = false;
    this._buffer = [];
    this._logger = new seq.Logger(loggerConfig);
  }

  _write(message, enc, cb) {
    if (message) {
      try {
        let eventCopy = JSON.parse(message);

        let { time, level, msg, exception, v, err, error, stack, ...props } = eventCopy;

        // Get the properties from the error
        let { message: errMessage, stack: errStack, ...errorProps } = err || error || {};

        let forSeq = {
          timestamp: new Date(time),
          level: LEVEL_NAMES[level],
          messageTemplate: msg ? msg : errMessage,
          properties: { ...errorProps, ...props },
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
          message: this._buffer.join('\n')
        });
        this._bufferTime = false;
        this._buffer = [];
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Force the underlying logger to flush at the time of the call
  // and wait for pending writes to complete
  _final() {
    this.flushBuffer();
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

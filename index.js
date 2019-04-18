"use strict";

let pinoSeqStream = require('./pinoSeqStream');

module.exports = {
  createStream: config => {
    config = config || {};
    return new PinoSeqStream(config);
  }
};

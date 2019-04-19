"use strict";

let PinoSeqStream = require('./pinoSeqStream');

module.exports = {
  createStream: config => {
    config = config || {};
    return new PinoSeqStream(config);
  }
};

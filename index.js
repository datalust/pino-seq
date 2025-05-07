"use strict";

import { PinoSeqStream } from './pinoSeqStream.js';

export default {
  createStream: config => {
    config = config || {};
    return new PinoSeqStream(config);
  }
};

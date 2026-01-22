import { PinoSeqStream, PinoSeqStreamConfig } from './pinoSeqStream.js';

export { PinoSeqStream, PinoSeqStreamConfig };

export function createStream(config?: PinoSeqStreamConfig): PinoSeqStream {
  return new PinoSeqStream(config);
}

// Default export for backward compatibility
export default {
  createStream
};

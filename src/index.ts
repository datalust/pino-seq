import { PinoSeqStream, PinoSeqStreamConfig } from './pinoSeqStream.js';
import { Writable } from 'stream';

export { PinoSeqStream, PinoSeqStreamConfig };

export interface StreamWithFlush extends Writable {
  flush: () => Promise<boolean>;
}

export function createStream(config?: PinoSeqStreamConfig): StreamWithFlush {
  return new PinoSeqStream(config);
}

// Default export for backward compatibility
export default {
  createStream
};

import { Writable } from 'stream';

declare namespace PinoSeq {
  interface SeqConfig {
    serverUrl?: string;
    apiKey?: string;
    logOtherAs?: 'Verbose' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Fatal';
    maxBatchingTime?: number;
    eventSizeLimit?: number;
    batchSizeLimit?: number;
    onError?: (e: Error) => void;
  }

  function createStream(config: PinoSeq.SeqConfig): Writable;
}

export = PinoSeq;

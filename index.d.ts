import { Writable } from "stream";

declare namespace PinoSeq {
  interface SeqConfig {
    serverUrl ?: string;
    apiKey ?: string;
    maxBatchingTime ?: number;
    eventSizeLimit ?: number;
    batchSizeLimit ?: number;
    onError ?: (e: Error) => void
  }
  
  function createStream(config: PinoSeq.SeqConfig): Writable
}


export = PinoSeq;
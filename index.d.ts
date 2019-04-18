import { Writable } from "stream";

export interface SeqConfig {
  serverUrl ?: string;
  apiKey ?: string;
  maxBatchingTime ?: number;
  eventSizeLimit ?: number;
  batchSizeLimit ?: number;
  onError ?: (e: Error) => void
}


declare function createStream(config: SeqConfig): Writable

export default createStream;

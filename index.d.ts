
export interface SeqConfig {
  serverUrl ?: string;
  apiKey ?: string;
  maxBatchingTime ?: number;
  eventSizeLimit ?: number;
  batchSizeLimit ?: number;
  onError ?: (e: Error) => void
}
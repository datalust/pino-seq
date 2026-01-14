import { Writable } from 'stream';
import { Logger as SeqLogger, SeqLoggerConfig } from 'seq-logging';

const LEVEL_NAMES: Record<number, string> = {
  10: 'Verbose',
  20: 'Debug',
  30: 'Information',
  40: 'Warning',
  50: 'Error',
  60: 'Fatal'
};

export interface PinoSeqStreamConfig extends Partial<SeqLoggerConfig> {
  additionalProperties?: Record<string, any>;
  logOtherAs?: 'Verbose' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Fatal';
}

interface PinoLogEvent {
  time: number;
  level: number;
  msg?: string;
  err?: Error & Record<string, any>;
  error?: Error & Record<string, any>;
  stack?: string;
  trace_id?: string;
  span_id?: string;
  [key: string]: any;
}

export class PinoSeqStream extends Writable {
  private _additionalProperties?: Record<string, any>;
  private _logOtherAs?: string;
  private _bufferTime: Date | false;
  private _buffer: string[];
  private _logger: SeqLogger;
  private _flushTimer?: NodeJS.Timeout;

  constructor(config?: PinoSeqStreamConfig) {
    super();

    const { additionalProperties, logOtherAs, ...loggerConfig } = config || {};
    
    const onError = (loggerConfig as SeqLoggerConfig).onError || ((e: Error) => {
      console.error('[PinoSeqStream] Log batch failed\n', e);
    });

    const configWithDefaults: SeqLoggerConfig = {
      ...loggerConfig,
      onError
    };

    this._additionalProperties = additionalProperties;
    this._logOtherAs = logOtherAs;
    this._bufferTime = false;
    this._buffer = [];
    this._logger = new SeqLogger(configWithDefaults);
  }

  _write(message: Buffer | string, enc: string, cb: (error?: Error | null) => void): void {
    if (message) {
      try {
        const eventCopy: PinoLogEvent = JSON.parse(message.toString());

        const { time, level, msg, err, error, stack, ...props } = eventCopy;

        // Get the properties from the error
        const errorObj = err || error;
        const errMessage = errorObj?.message;
        const errStack = errorObj?.stack;
        const { message: _msg, stack: _stack, ...errorProps } = errorObj || {};

        const forSeq = {
          timestamp: new Date(time),
          level: LEVEL_NAMES[level],
          traceId: props.trace_id,
          spanId: props.span_id,
          messageTemplate: msg || errMessage,
          properties: { 
            ...this._additionalProperties, 
            ...errorProps, 
            ...props 
          },
          exception: stack || errStack
        };

        // Handle sending to seq separately
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

  private handleUnstructuredMessage(message: string): void {
    this._bufferTime = this._bufferTime || new Date();
    this._buffer.push(message);
    // Flush the message buffer after 1 sec of inactivity
    if (!this._flushTimer) {
      this._flushTimer = setTimeout(() => {
        this.flushBuffer();
      }, 1000);
    }
  }

  private flushBuffer(): void {
    if (this._buffer.length) {
      try {
        // No need to flush again
        if (this._flushTimer) {
          clearTimeout(this._flushTimer);
          this._flushTimer = undefined;
        }
        this._logger.emit({
          timestamp: this._bufferTime || new Date(),
          level: this._logOtherAs!,
          messageTemplate: this._buffer.join('\n'),
          properties: { ...this._additionalProperties },
        });
        this._bufferTime = false;
        this._buffer = [];
      } catch (err) {
        console.error(err);
      }
    }
  }

  flush(): Promise<boolean> {
    this.flushBuffer();
    return this._logger.flush();
  }

  // Force the underlying logger to flush at the time of the call
  // and wait for pending writes to complete
  _final(callback: (error?: Error | null) => void): void {
    this.flushBuffer();
    this._logger
      .close()
      .then(() => callback())
      .catch((err: Error) => callback(err));
  }
}

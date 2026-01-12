"use strict";

import { describe, it } from 'mocha';
import pino from 'pino';
import { createStream, PinoSeqStream } from '../dist/index.js';

describe('Integration Tests', () => {
  describe('createStream', () => {
    it('should create a stream with default export', () => {
      const stream = createStream({ serverUrl: 'http://localhost:5341' });
      if (!(stream instanceof PinoSeqStream)) {
        throw new Error('Stream should be an instance of PinoSeqStream');
      }
    });

    it('should work with pino logger', async () => {
      const stream = createStream({ serverUrl: 'http://localhost:5341' });
      const logger = pino({ name: 'test-logger' }, stream);
      
      logger.info('Test message');
      await stream.flush();
    });

    it('should handle child loggers', async () => {
      const stream = createStream({ serverUrl: 'http://localhost:5341' });
      const logger = pino({ name: 'test-logger' }, stream);
      const childLogger = logger.child({ module: 'test-module' });
      
      childLogger.warn('Child logger test');
      await stream.flush();
    });

    it('should handle errors', async () => {
      const stream = createStream({ serverUrl: 'http://localhost:5341' });
      const logger = pino({ name: 'test-logger' }, stream);
      
      const testError = new Error('Test error');
      logger.error({ err: testError }, 'Error occurred');
      await stream.flush();
    });
  });

  describe('TypeScript type compatibility', () => {
    it('should export types correctly', () => {
      // This test passes if the imports don't throw
      const config = {
        serverUrl: 'http://localhost:5341',
        logOtherAs: 'Information'
      };
      const stream = createStream(config);
      if (typeof stream.flush !== 'function') {
        throw new Error('Stream should have flush method');
      }
    });
  });
});

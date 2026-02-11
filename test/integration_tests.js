/*
Integration tests for the `PinoSeqStream`.

These tests are run in CI against an externally managed Seq instance.
You can run them locally by starting a Seq instance and running:

```
npm run test:integration
```
*/

"use strict";

import { describe, it, before } from 'mocha';
import pino from 'pino';
import { createStream, PinoSeqStream } from '../dist/index.js';

// Helper to query Seq for events (real mode only)
async function querySeqEvents(messageText) {
  const response = await fetch('http://localhost:5341/api/events?clef');
  if (!response.ok) {
    throw new Error(`Seq query failed: ${response.status}`);
  }

  const text = await response.text();
  const events = text.trim().split('\n').filter(line => line).map(line => JSON.parse(line));

  return events.filter(event => 
    event['@mt'] && event['@mt'].includes(messageText)
  );
}

// Helper to wait for event to appear in Seq (real mode only)
async function waitForEvent(messageText, maxAttempts = 10) {
  let err = 'unknown failure';

  for (let i = 0; i < maxAttempts; i++) {
    try
    {
      const events = await querySeqEvents(messageText);

      if (events.length > 0) {
        return events[0];
      }
    }
    catch (e)
    {
      err = e;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`Event matching "${messageText}" not found in Seq after ${maxAttempts} attempts due to: ${err}`);
}

describe('Integration Tests', () => {
  function createTestStream() {
    return createStream({ serverUrl: 'http://localhost:5341', onError: () => {} });
  }

  describe('createStream', () => {
    it('should create a stream with default export', () => {
      const stream = createTestStream();

      if (!(stream instanceof PinoSeqStream)) {
        throw new Error('Stream should be an instance of PinoSeqStream');
      }
    });

    it('should work with pino logger and verify in Seq', async function() {
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      
      const testMessage = `Test message ${Date.now()}`;
      logger.info(testMessage);
      await stream.flush();
      
      // Verify the message appears in Seq
      const event = await waitForEvent(testMessage);
      if (!event) {
        throw new Error('Event not found in Seq');
      }
      
      // Verify event properties
      // Information level is the default, so @l may be undefined
      if (event['@l'] && event['@l'] !== 'Information') {
        throw new Error(`Expected level 'Information' or undefined, got '${event['@l']}'`);
      }
      if (!event.name || event.name !== 'integration-test') {
        throw new Error(`Expected name 'integration-test', got '${event.name}'`);
      }
    });

    it('should handle child loggers and verify in Seq', async function() {
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      const childLogger = logger.child({ module: 'test-module' });
      
      const testMessage = `Child logger test ${Date.now()}`;
      childLogger.warn(testMessage);
      await stream.flush();
      
      // Verify the message appears in Seq with child properties
      const event = await waitForEvent(testMessage);
      if (!event) {
        throw new Error('Event not found in Seq');
      }
      
      if (event['@l'] !== 'Warning') {
        throw new Error(`Expected level 'Warning', got '${event['@l']}'`);
      }
      if (!event.module || event.module !== 'test-module') {
        throw new Error(`Expected module 'test-module', got '${event.module}'`);
      }
    });

    it('should handle errors and verify in Seq', async function() {
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      
      const testError = new Error('Test error message');
      const testMessage = `Error occurred ${Date.now()}`;
      logger.error({ err: testError }, testMessage);
      await stream.flush();
      
      // Verify the error appears in Seq
      const event = await waitForEvent(testMessage);
      if (!event) {
        throw new Error('Event not found in Seq');
      }
      
      if (event['@l'] !== 'Error') {
        throw new Error(`Expected level 'Error', got '${event['@l']}'`);
      }
      if (!event['@x']) {
        throw new Error('Expected exception stack trace');
      }
    });

    it('should handle trace_id and span_id', async function() {
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      
      const testMessage = `Trace test ${Date.now()}`;
      const testTraceId = 'trace-123';
      const testSpanId = 'span-456';
      
      logger.info({ trace_id: testTraceId, span_id: testSpanId }, testMessage);
      await stream.flush();
      
      // Verify the message appears in Seq with trace info
      const event = await waitForEvent(testMessage);
      if (!event) {
        throw new Error('Event not found in Seq');
      }
      
      if (event.trace_id !== testTraceId) {
        throw new Error(`Expected trace_id '${testTraceId}', got '${event.trace_id}'`);
      }
      if (event.span_id !== testSpanId) {
        throw new Error(`Expected span_id '${testSpanId}', got '${event.span_id}'`);
      }
    });
  });

});

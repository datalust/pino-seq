"use strict";

import { describe, it, before } from 'mocha';
import pino from 'pino';
import { createStream, PinoSeqStream } from '../dist/index.js';
import { MockSeqTransport } from './mockSeqTransport.js';

const useMock = process.env.MOCK_SEQ === 'true';

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
  for (let i = 0; i < maxAttempts; i++) {
    const events = await querySeqEvents(messageText);
    if (events.length > 0) {
      return events[0];
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Event not found in Seq after ${maxAttempts} attempts: "${messageText}"`);
}

describe('Integration Tests', () => {
  let mockTransport;

  before(function() {
    this.timeout(5000);
    if (useMock) {
      console.log('      ℹ Running tests with MOCK_SEQ=true');
      mockTransport = new MockSeqTransport();
    } else {
      console.log('      ℹ Running tests with real Seq instance');
    }
  });

  // Helper to create stream in either mock or real mode
  function createTestStream() {
    if (useMock) {
      return createStream({ 
        serverUrl: 'http://localhost:5341',
        _testLogger: mockTransport 
      });
    } else {
      return createStream({ serverUrl: 'http://localhost:5341' });
    }
  }

  describe('createStream', () => {
    it('should create a stream with default export', () => {
      const stream = useMock 
        ? createStream({ serverUrl: 'http://localhost:5341', _testLogger: mockTransport })
        : createStream({ serverUrl: 'http://localhost:5341' });
      if (!(stream instanceof PinoSeqStream)) {
        throw new Error('Stream should be an instance of PinoSeqStream');
      }
    });

    it('should work with pino logger and verify in Seq', async function() {
      this.timeout(5000);
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      
      const testMessage = `Test message ${Date.now()}`;
      logger.info(testMessage);
      await stream.flush();
      
      if (useMock) {
        // Verify the mock captured the event
        const event = mockTransport.findEvent(testMessage);
        if (!event) {
          throw new Error('Event not captured by mock');
        }
        if (event.level !== 'Information') {
          throw new Error(`Expected level 'Information', got '${event.level}'`);
        }
        if (!event.properties || event.properties.name !== 'integration-test') {
          throw new Error(`Expected name 'integration-test', got '${event.properties?.name}'`);
        }
      } else {
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
      }
    });

    it('should handle child loggers and verify in Seq', async function() {
      this.timeout(5000);
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      const childLogger = logger.child({ module: 'test-module' });
      
      const testMessage = `Child logger test ${Date.now()}`;
      childLogger.warn(testMessage);
      await stream.flush();
      
      if (useMock) {
        const event = mockTransport.findEvent(testMessage);
        if (!event) {
          throw new Error('Event not captured by mock');
        }
        if (event.level !== 'Warning') {
          throw new Error(`Expected level 'Warning', got '${event.level}'`);
        }
        if (!event.properties || event.properties.module !== 'test-module') {
          throw new Error(`Expected module 'test-module', got '${event.properties?.module}'`);
        }
      } else {
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
      }
    });

    it('should handle errors and verify in Seq', async function() {
      this.timeout(5000);
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      
      const testError = new Error('Test error message');
      const testMessage = `Error occurred ${Date.now()}`;
      logger.error({ err: testError }, testMessage);
      await stream.flush();
      
      if (useMock) {
        const event = mockTransport.findEvent(testMessage);
        if (!event) {
          throw new Error('Event not captured by mock');
        }
        if (event.level !== 'Error') {
          throw new Error(`Expected level 'Error', got '${event.level}'`);
        }
        if (!event.exception) {
          throw new Error('Expected exception in event');
        }
      } else {
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
      }
    });

    it('should handle trace_id and span_id', async function() {
      this.timeout(5000);
      const stream = createTestStream();
      const logger = pino({ name: 'integration-test' }, stream);
      
      const testMessage = `Trace test ${Date.now()}`;
      const testTraceId = 'trace-123';
      const testSpanId = 'span-456';
      
      logger.info({ trace_id: testTraceId, span_id: testSpanId }, testMessage);
      await stream.flush();
      
      if (useMock) {
        const event = mockTransport.findEvent(testMessage);
        if (!event) {
          throw new Error('Event not captured by mock');
        }
        if (!event.properties || event.properties.trace_id !== testTraceId) {
          throw new Error(`Expected trace_id '${testTraceId}', got '${event.properties?.trace_id}'`);
        }
        if (!event.properties || event.properties.span_id !== testSpanId) {
          throw new Error(`Expected span_id '${testSpanId}', got '${event.properties?.span_id}'`);
        }
      } else {
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
      }
    });
  });

});

// Simple mock transport for testing without a real Seq instance
// Captures events sent to Seq for verification in tests

export class MockSeqTransport {
  constructor() {
    this.events = [];
  }

  // Mock the seq-logging Logger interface
  emit(event) {
    this.events.push(event);
    return Promise.resolve();
  }

  flush() {
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }

  // Helper for tests to find events
  findEvent(messageTemplate) {
    return this.events.find(e => 
      e.messageTemplate && e.messageTemplate.includes(messageTemplate)
    );
  }

  // Helper to get all events matching a pattern
  findEvents(messageTemplate) {
    return this.events.filter(e => 
      e.messageTemplate && e.messageTemplate.includes(messageTemplate)
    );
  }

  // Clear captured events
  clear() {
    this.events = [];
  }
}

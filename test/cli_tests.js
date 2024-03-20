"use strict";

const pino = require('pino')({
  level: 'trace'
});

pino.trace('trace message');
pino.debug('debug message');
pino.info('info message');
pino.warn('warn message');
pino.error(new Error('error message'));
pino.fatal('fatal message');

const logWithProperties = pino.child({
  a: 1,
  trace_id: '6112be4ab9f113c499dbf4817e503a69',
  span_id: '2f2b39a596fc76cd',
});

logWithProperties.info('info with properties');

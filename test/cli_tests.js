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
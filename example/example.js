import pino from 'pino';
import pinoToSeq from '../index.js';

let stream = pinoToSeq.createStream({ serverUrl: 'http://localhost:5341' });
let logger = pino({ name: 'pino-seq example' }, stream);

logger.info('Hello Seq, from Pino');

let frLogger = logger.child({ lang: 'fr' });
frLogger.warn('au reviour');

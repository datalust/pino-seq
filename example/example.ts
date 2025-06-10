import { pino, type LoggerOptions } from 'pino';
import PinoSeq from '../index.js';

const stream = PinoSeq.createStream({ serverUrl: 'http://localhost:5341' });

const options: LoggerOptions = {
  name: 'pino-seq example'
};
const logger = pino(options, stream);

logger.info('Hello Seq, from Pino');

const frLogger = logger.child({ lang: 'fr' });
frLogger.warn('au reviour');

stream.flush().then(() => console.log('flushed'));

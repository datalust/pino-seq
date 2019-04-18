import Pino, { LoggerOptions, Logger } from "pino"
import createStream from ".."


const onError = (err:Error) => {
  console.log("Logging failed: ", err);
}

const stream = createStream({serverUrl: "http://localhost:5341", onError});

const options: LoggerOptions = {
  name: "pino-seq example"
}
const logger: Logger = Pino(options, stream);

logger.info("Hello Seq, from Pino");

const frLogger = logger.child({lang: "fr"});
frLogger.warn("au reviour");

#!/usr/bin/env node

const program = require('commander');
const split2 = require('split2');

const pkg = require('./package.json');
const pinoSeq = require('./index');

function main() {
  program
    .version(pkg.version)
    .option('-s, --serverUrl <serverUrl>', 'Seq server instance')
    .option('-k, --apiKey <apiKey>', 'Seq API key')
    .option(
      '-o, --logOtherAs <Verbose|Debug|Information|Warning|Error|Fatal>',
      'Log other output (not formatted through pino) to seq at this loglevel. Useful to capture messages if the node process crashes or smilar.',
      (string) => {
        if (['Verbose', 'Debug', 'Information', 'Warning', 'Error', 'Fatal'].includes(string)) {
          return string;
        }
        console.error(`Warning, skipping option "logOtherAs": Invalid value supplied: "${string}"`);
        return undefined;
      }
    )
    .option('-p, --property <property>', 'Properties to add to all logs', (value, previous) => {
      const valueSplit = value.split('=')
      if(valueSplit.length !== 2)
      {
        console.error(`Warning, skipping option "property": Invalid value specified: "${value}`)
        return previous;
      }

      const current = {
        [valueSplit[0]]: valueSplit[1]
      }
      return Object.assign(previous, current);
    }, {})
    .action(({ serverUrl, apiKey, logOtherAs, property }) => {
      try {
        const writeStream = pinoSeq.createStream({ serverUrl, apiKey, logOtherAs, additionalProperties: property });

        process.stdin.pipe(split2()).pipe(writeStream).on("error", console.error);

        const handler = (err, name) => {
          writeStream.end(() => {
            process.exit(0);
          });
        };

        process.on('SIGINT', () => handler(null, 'SIGINT'));
        process.on('SIGQUIT', () => handler(null, 'SIGQUIT'));
        process.on('SIGTERM', () => handler(null, 'SIGTERM'));
        process.on('SIGLOST', () => handler(null, 'SIGLOST'));
        process.on('SIGABRT', () => handler(null, 'SIGABRT'));
      } catch (error) {
        console.error(error);
      }
    });

  program.parse(process.argv);
}

main();

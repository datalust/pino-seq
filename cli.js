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
    .action(({ serverUrl, apiKey }) => {
      try {
        const writeStream = pinoSeq.createStream({ serverUrl, apiKey });
        process.stdin.pipe(split2(str => writeStream.write(str)));
        console.info('logging');
      } catch (error) {
        console.error(error);
      }
    });

  program.parse(process.argv);
}

main();

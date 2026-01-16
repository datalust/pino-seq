"use strict";

import { describe, it, before, after } from 'mocha';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

describe('Example Tests', () => {
  before(async function() {
    this.timeout(10000);
    // Link the package locally so examples can import 'pino-seq'
    try {
      await exec('npm link');
      console.log('      ℹ Linked pino-seq locally for example tests');
    } catch (err) {
      console.error('      ⚠ Failed to link package:', err.message);
      throw err;
    }
  });

  after(async function() {
    this.timeout(5000);
    // Clean up the link
    try {
      await exec('npm unlink -g pino-seq');
    } catch (err) {
      // Ignore errors on cleanup
    }
  });

  it('should run JavaScript example without errors', async function() {
    this.timeout(10000);
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['./example/example.js'], {
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`JavaScript example exited with code ${code}\nstderr: ${stderr}`));
        } else {
          resolve();
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to start JavaScript example: ${err.message}`));
      });
    });
  });

  it('should run TypeScript example without errors', async function() {
    this.timeout(10000);
    
    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['tsx', './example/example.ts'], {
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`TypeScript example exited with code ${code}\nstderr: ${stderr}`));
        } else {
          resolve();
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to start TypeScript example: ${err.message}`));
      });
    });
  });
});

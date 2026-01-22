"use strict";

import { describe, it, before, after } from 'mocha';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);
const useMock = process.env.MOCK_SEQ === 'true';

describe('Example Tests', () => {
  before(async function() {
    this.timeout(10000);
    // Link the package locally so examples can import 'pino-seq'
    try {
      await exec('npm link');
      if (useMock) {
        console.log('      ℹ Running example tests with MOCK_SEQ=true (examples will fail without real Seq)');
      } else {
        console.log('      ℹ Running example tests with real Seq instance');
      }
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

  it('should run example as JavaScript without errors', async function() {
    if (useMock) {
      this.skip(); // Examples need real Seq, skip in mock mode
      return;
    }

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
          reject(new Error(`Example exited with code ${code}\nstderr: ${stderr}`));
        } else {
          resolve();
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to start example: ${err.message}`));
      });
    });
  });

  it('should run example as TypeScript without errors', async function() {
    if (useMock) {
      this.skip(); // Examples need real Seq, skip in mock mode
      return;
    }

    this.timeout(10000);
    
    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['tsx', './example/example.js'], {
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
          reject(new Error(`Example with tsx exited with code ${code}\nstderr: ${stderr}`));
        } else {
          resolve();
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to start example with tsx: ${err.message}`));
      });
    });
  });
});

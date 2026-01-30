#!/usr/bin/env node

/**
 * Simplified dev server launcher
 * Uses npm directly to avoid platform-specific spawning issues
 */

import { spawn } from 'child_process';
import net from 'net';

const startPort = 3000;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(start, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = start + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${start} and ${start + maxAttempts}`);
}

async function startDevServer() {
  try {
    const port = await findAvailablePort(startPort);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting Next.js dev server on port ${port}`);
    console.log(`${'='.repeat(60)}\n`);

    // Use npm run for cross-platform compatibility
    // npm handles platform-specific execution automatically
    const nextDev = spawn('npm', ['run', 'next-dev', '--', '--port', String(port)], {
      stdio: 'inherit',
      shell: false,
      cwd: process.cwd(),
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\nShutting down...');
      nextDev.kill('SIGTERM');
      setTimeout(() => process.exit(0), 1000);
    });

    nextDev.on('exit', (code) => {
      process.exit(code || 0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

startDevServer();

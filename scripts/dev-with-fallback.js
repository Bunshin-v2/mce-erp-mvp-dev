#!/usr/bin/env node

/**
 * Dev Server with Automatic Port Fallback
 *
 * Attempts to start Next.js dev server on port 3000.
 * If port is in use, automatically tries 3001, 3002, etc.
 * until an available port is found.
 *
 * IMPORTANT: Does NOT use shell spawning to avoid lock file issues
 */

import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const startPort = 3000;
const maxAttempts = 10;

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * Find available port
 */
async function findAvailablePort(start, maxAttempts) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = start + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${start} and ${start + maxAttempts}`);
}

/**
 * Start dev server WITHOUT shell spawning
 */
async function startDevServer() {
  try {
    const port = await findAvailablePort(startPort, maxAttempts);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting Next.js dev server on port ${port}`);
    console.log(`${'='.repeat(60)}\n`);

    // Update env var so health checks use correct port
    process.env.API_BASE_URL = `http://localhost:${port}`;

    // Find npx executable path
    let npxCmd = 'npx';
    if (process.platform === 'win32') {
      // On Windows, npx is usually in node_modules/.bin/npx.cmd
      npxCmd = 'npx.cmd';
    }

    // Spawn next dev process WITHOUT shell - pass args as array
    const nextDev = spawn(npxCmd, ['next', 'dev', '-p', String(port)], {
      stdio: 'inherit',
      shell: false,  // CRITICAL: Do NOT use shell
      // On Windows, detached mode helps with cleanup
      detached: process.platform === 'win32',
    });

    nextDev.on('error', (err) => {
      console.error('Failed to start dev server:', err.message);
      if (err.code === 'ENOENT') {
        console.error('\n⚠️  npx not found. Trying direct "next" command...\n');
        // Fallback: try calling next directly
        startDevServerFallback(port);
      } else {
        process.exit(1);
      }
    });

    nextDev.on('exit', (code) => {
      process.exit(code || 0);
    });

    // Handle parent process termination
    process.on('SIGINT', () => {
      console.log('\n\nShutting down dev server...');
      nextDev.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n\nShutting down dev server...');
      nextDev.kill('SIGTERM');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Fallback: Try calling next directly (if installed locally)
 */
async function startDevServerFallback(port) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const nextPath = path.join(__dirname, '..', 'node_modules', '.bin', 'next');

    console.log(`Trying fallback: ${nextPath}`);

    const nextDev = spawn(nextPath, ['dev', '-p', String(port)], {
      stdio: 'inherit',
      shell: false,
      detached: process.platform === 'win32',
    });

    nextDev.on('error', (err) => {
      console.error('Fallback also failed:', err.message);
      process.exit(1);
    });

    nextDev.on('exit', (code) => {
      process.exit(code || 0);
    });

    process.on('SIGINT', () => {
      nextDev.kill('SIGINT');
    });

  } catch (error) {
    console.error('Fallback error:', error.message);
    process.exit(1);
  }
}

startDevServer();

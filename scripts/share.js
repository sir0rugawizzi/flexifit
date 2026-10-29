// scripts/share.js
// Launches the FlexiFit production server (if not already running)
// and creates an instant HTTPS tunnel with a terminal QR code for sharing with groupmates.

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import qrcode from 'qrcode-terminal';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 3000;

// Helper to check if server is already responding
function isServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Get local network IP for Wi-Fi sharing
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[32m%s\x1b[0m', '   FlexiFit – Instant Share with Groupmates');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');

let serverProcess = null;
let tunnelProcess = null;
let isExiting = false;

function cleanup() {
  if (isExiting) return;
  isExiting = true;
  console.log('\n\x1b[33m%s\x1b[0m', 'Closing sharing session...');
  try { if (tunnelProcess) tunnelProcess.kill('SIGTERM'); } catch {}
  try { if (serverProcess) serverProcess.kill('SIGTERM'); } catch {}
  setTimeout(() => process.exit(0), 400);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const running = await isServerRunning(PORT);

if (running) {
  console.log(`\x1b[32m✔\x1b[0m Detected existing FlexiFit server already running on port ${PORT}.`);
  startTunnel();
} else {
  // Check if client/dist exists; if not, build it first
  const distPath = path.join(rootDir, 'client/dist');
  if (!existsSync(distPath)) {
    console.log('\x1b[33m%s\x1b[0m', 'Building client PWA first (one-time step)...');
    const build = spawn('npm', ['run', 'build'], { cwd: rootDir, stdio: 'inherit', shell: true });
    await new Promise((resolve, reject) => {
      build.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Client build failed with code ${code}`));
      });
    });
  }

  console.log(`Starting FlexiFit server on port ${PORT}...`);
  serverProcess = spawn('node', ['server/src/index.js'], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('FlexiFit server running')) {
      startTunnel();
    }
  });

  serverProcess.stderr.on('data', (d) => {
    console.error('[Server Error]', d.toString());
  });

  serverProcess.on('exit', () => cleanup());
}

function startTunnel() {
  console.log('\x1b[34m%s\x1b[0m', `Creating secure HTTPS public tunnel via Cloudflare (port ${PORT})...`);

  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let printed = false;
  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i);
    if (match && !printed) {
      printed = true;
      const url = match[0];
      const localIp = getLocalIp();

      console.log('\n\x1b[1m\x1b[32m%s\x1b[0m', '✔ FLEXIFIT IS LIVE ONLINE!');
      console.log('\x1b[36m%s\x1b[0m', '───────────────────────────────────────────────────────────');
      console.log('\x1b[1m\x1b[33m%s\x1b[0m', `  Public URL:  ${url}`);
      console.log('\x1b[90m%s\x1b[0m', `  Local Wi-Fi: http://${localIp}:${PORT}`);
      console.log('\x1b[36m%s\x1b[0m', '───────────────────────────────────────────────────────────');

      console.log('\n\x1b[1mScan this QR Code with your phone camera to open:\x1b[0m\n');
      qrcode.generate(url, { small: true });

      console.log('\x1b[36m%s\x1b[0m', '───────────────────────────────────────────────────────────');
      console.log('\x1b[1mDemo Accounts (or tap the 1-click demo buttons on login):\x1b[0m');
      console.log('  👨‍🏫 Trainer Demo:  \x1b[32mbrian@flexifit.ug\x1b[0m  (Password: \x1b[33mpassword123\x1b[0m)');
      console.log('  🏃 Client Demo:   \x1b[32msarah@techcorp.ug\x1b[0m  (Password: \x1b[33mpassword123\x1b[0m)');
      console.log('\n\x1b[1m📱 Mobile PWA Tip:\x1b[0m');
      console.log('  Groupmates opening on iPhone (Safari) or Android (Chrome) can tap');
      console.log('  "Add to Home Screen" / "Install" to run it like an installed mobile app!');
      console.log('\x1b[36m%s\x1b[0m', '───────────────────────────────────────────────────────────');
      console.log('\x1b[90m%s\x1b[0m', 'Keep this terminal open while sharing. Press Ctrl+C to stop.\n');
    }
  };

  tunnelProcess.stdout.on('data', handleOutput);
  tunnelProcess.stderr.on('data', handleOutput);

  tunnelProcess.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', `Failed to start cloudflared: ${err.message}`);
    console.log(`You can still share via your local Wi-Fi: http://${getLocalIp()}:${PORT}`);
  });
}

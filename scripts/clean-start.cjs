
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 NEURAL CLEANSE INITIATED...');

// 1. Kill Port 3000-3015
const startPort = 3000;
const endPort = 3015;

try {
    console.log('💀 Terminating Zombie Processes...');
    // Windows-specific port killing
    for (let port = startPort; port <= endPort; port++) {
        try {
            // Find PID
            const findCmd = `netstat -ano | findstr :${port}`;
            const output = execSync(findCmd, { encoding: 'utf8', stdio: 'pipe' });

            const lines = output.split('\n').filter(l => l.includes('LISTENING'));
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    console.log(`   - Killing PID ${pid} on port ${port}`);
                    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                }
            });
        } catch (e) {
            // Ignore errors if no process found
        }
    }
} catch (e) {
    console.log('   - No zombies found (or permission denied).');
}

// 2. Delete .next folder
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
    console.log('🗑️  Dissolving Corrupted Cache (.next)...');
    try {
        fs.rmSync(nextDir, { recursive: true, force: true });
    } catch (e) {
        console.warn('   ! Could not fully delete .next. It might be locked. Continuing...');
    }
}

// 3. Start Dev Server
console.log('🚀 IGNIITING REACTORS...');
// Use a random port in the 4000 range to avoid collision risk entirely? 
// No, standard is good. Let's try 3010 again now that it's clean, or 3000.
// Let's stick to 3000 as the "Golden" port now that we've cleaned it.
try {
    execSync('npm run dev -- -p 3000', { stdio: 'inherit' });
} catch (e) {
    // User cancelled or error
}

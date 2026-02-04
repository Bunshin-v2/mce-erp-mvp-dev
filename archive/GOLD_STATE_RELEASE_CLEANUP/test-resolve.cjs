
try {
    const fsPath = require.resolve('enhanced-resolve/lib/util/fs');
    console.log('Successfully resolved fs.js at:', fsPath);
    const { readJson } = require('enhanced-resolve/lib/util/fs');
    console.log('Successfully imported readJson');
} catch (e) {
    console.error('Failed to resolve or import:', e.message);
    console.error('Stack:', e.stack);
}

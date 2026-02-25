// Polyfill for Node.js 18 in tests
if (!global.crypto) {
    // @ts-ignore
    global.crypto = require('crypto');
}

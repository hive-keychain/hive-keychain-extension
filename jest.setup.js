const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

Object.assign(global, require('jest-chrome'));
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.subtle,
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    randomUUID: crypto.randomUUID,
  },
});

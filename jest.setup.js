const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

Object.assign(global, require('jest-chrome'));
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});
if (!global.self) {
  Object.defineProperty(global, 'self', {
    value: global,
    configurable: true,
  });
}
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.subtle,
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    randomUUID: crypto.randomUUID,
  },
});

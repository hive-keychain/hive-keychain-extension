const crypto = require('crypto');

Object.assign(global, require('jest-chrome'));
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.subtle,
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    randomUUID: crypto.randomUUID,
  },
});

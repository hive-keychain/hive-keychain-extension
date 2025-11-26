const crypto = require('crypto');

Object.assign(global, require('jest-chrome'));
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.subtle,
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    randomUUID: crypto.randomUUID,
  },
});

// Polyfill global fetch for node environment (simple stub)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '{}',
  }));
}

// Ensure chrome.storage.local.onChanged exists for tests that attach listeners
if (
  global.chrome &&
  global.chrome.storage &&
  global.chrome.storage.local &&
  !global.chrome.storage.local.onChanged
)
  global.chrome.storage.local.onChanged = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };

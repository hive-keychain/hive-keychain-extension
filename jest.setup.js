const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

/** Popup E2E tests use async HiveApp init + 15s waitFor in render helpers. */
jest.setTimeout(30000);

Object.assign(global, require('jest-chrome'));
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});

/** jest-chrome may omit `storage.local.onChanged` used by HiveAppComponent. */
if (!global.chrome?.storage?.local?.onChanged?.addListener) {
  global.chrome = global.chrome || {};
  global.chrome.storage = global.chrome.storage || {};
  global.chrome.storage.local = global.chrome.storage.local || {};
  global.chrome.storage.local.onChanged = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
}

/** VaultUtils uses `runtime.connect`; jest-chrome may omit a full port. */
global.chrome = global.chrome || {};
global.chrome.runtime = global.chrome.runtime || {};
const vaultPortStub = () => ({
  onMessage: { addListener: jest.fn(), removeListener: jest.fn() },
  onDisconnect: { addListener: jest.fn(), removeListener: jest.fn() },
  disconnect: jest.fn(),
  postMessage: jest.fn(),
});
const _connect = global.chrome.runtime.connect;
global.chrome.runtime.connect = jest.fn((...args) => {
  const p = typeof _connect === 'function' ? _connect(...args) : null;
  if (p && p.onMessage && p.onMessage.addListener) return p;
  return vaultPortStub();
});
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.subtle,
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    randomUUID: crypto.randomUUID,
  },
});

/** Default fetch: jsdom provides `fetch`, but an empty JSON body breaks hive-tx RPC (`result` missing → throw). */
const defaultFetchImpl = (_url, init) => {
  const httpMethod = init?.method || 'GET';
  let body = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      /* ignore */
    }
  }
  const rpcMethod = body.method;
  const jsonRpc = (result) =>
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result }),
    });
  // REST (e.g. PeakD notifications): callers expect an array from res.json()
  if (httpMethod === 'GET') {
    return Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve([]),
    });
  }
  if (rpcMethod === 'condenser_api.get_accounts') {
    return jsonRpc([]);
  }
  if (
    rpcMethod === 'condenser_api.get_withdraw_routes' ||
    rpcMethod === 'condenser_api.get_open_orders'
  ) {
    return jsonRpc([]);
  }
  return jsonRpc({});
};
globalThis.fetch = jest.fn(defaultFetchImpl);

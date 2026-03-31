import { VaultCommand } from '@reference-data/vault-message-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import VaultUtils from 'src/utils/vault.utils';

describe('vault.utils (vault port IPC)', () => {
  let connectSpy: jest.SpyInstance;

  afterEach(() => {
    connectSpy?.mockRestore();
  });

  it('getValueFromVault resolves payload from port onMessage', async () => {
    let onMsg: (r: unknown) => void = () => {};
    connectSpy = jest.spyOn(chrome.runtime, 'connect').mockImplementation(() => ({
      onMessage: {
        addListener: (fn: typeof onMsg) => {
          onMsg = fn;
        },
        removeListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      disconnect: jest.fn(),
      postMessage: jest.fn(() => {
        onMsg({ value: 'mk-from-vault', command: VaultCommand.GET_VALUE });
      }),
    })) as unknown as jest.SpyInstance;

    await expect(VaultUtils.getValueFromVault(VaultKey.__MK)).resolves.toEqual({
      value: 'mk-from-vault',
      command: VaultCommand.GET_VALUE,
    });
  });

  it('getValueFromVault resolves undefined when the port disconnects without a message', async () => {
    let onDisc: () => void = () => {};
    connectSpy = jest.spyOn(chrome.runtime, 'connect').mockImplementation(() => ({
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      onDisconnect: {
        addListener: (fn: typeof onDisc) => {
          onDisc = fn;
        },
        removeListener: jest.fn(),
      },
      disconnect: jest.fn(),
      postMessage: jest.fn(() => {
        onDisc();
      }),
    })) as unknown as jest.SpyInstance;

    await expect(VaultUtils.getValueFromVault(VaultKey.__MK)).resolves.toBeUndefined();
  });

  it('saveValueInVault resolves true from port response', async () => {
    let onMsg: (r: unknown) => void = () => {};
    connectSpy = jest.spyOn(chrome.runtime, 'connect').mockImplementation(() => ({
      onMessage: {
        addListener: (fn: typeof onMsg) => {
          onMsg = fn;
        },
        removeListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      disconnect: jest.fn(),
      postMessage: jest.fn(() => {
        onMsg(true);
      }),
    })) as unknown as jest.SpyInstance;

    await expect(
      VaultUtils.saveValueInVault(VaultKey.__MK, 'mk-value'),
    ).resolves.toBe(true);
  });

  it('removeFromVault resolves true from port response', async () => {
    let onMsg: (r: unknown) => void = () => {};
    connectSpy = jest.spyOn(chrome.runtime, 'connect').mockImplementation(() => ({
      onMessage: {
        addListener: (fn: typeof onMsg) => {
          onMsg = fn;
        },
        removeListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      disconnect: jest.fn(),
      postMessage: jest.fn(() => {
        onMsg(true);
      }),
    })) as unknown as jest.SpyInstance;

    await expect(VaultUtils.removeFromVault(VaultKey.__MK)).resolves.toBe(true);
  });
});

describe('vault.utils (Firefox service worker in-memory store)', () => {
  const originalFirefox = process.env.IS_FIREFOX;

  beforeEach(() => {
    jest.resetModules();
    process.env.IS_FIREFOX = 'true';
    (global as any).contextType = 'service_worker';
  });

  afterEach(() => {
    if (originalFirefox === undefined) {
      delete process.env.IS_FIREFOX;
    } else {
      process.env.IS_FIREFOX = originalFirefox;
    }
    delete (global as any).contextType;
  });

  it('get/set/remove use the module firefoxVault map', async () => {
    const Vault = (await import('src/utils/vault.utils')).default;

    await Vault.saveValueInVault(VaultKey.__MK, 'sw-secret');
    expect(Vault.getValueFromVault(VaultKey.__MK)).toBe('sw-secret');

    await Vault.removeFromVault(VaultKey.__MK);
    expect(Vault.getValueFromVault(VaultKey.__MK)).toBeUndefined();
  });
});

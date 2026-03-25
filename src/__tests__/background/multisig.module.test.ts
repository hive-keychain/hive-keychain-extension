import { MultisigModule } from '@background/multisig.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import MkModule from '@background/mk.module';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

jest.spyOn(global, 'setInterval').mockImplementation(() => 123 as unknown as ReturnType<typeof setInterval>);

const mockVolatileEmit = jest.fn((cmd: string, msg: unknown, ack?: (v: string) => void) => {
  if (typeof ack === 'function') {
    ack('ack');
  }
});

const mockSocket = {
  connected: false,
  connect: jest.fn(function (this: { connected: boolean }) {
    this.connected = true;
  }),
  on: jest.fn(),
  emit: jest.fn((_ev: string, _a?: unknown, cb?: (r: unknown) => void) => {
    if (typeof cb === 'function') {
      cb({ errors: {} });
    }
  }),
  volatile: { emit: mockVolatileEmit },
  removeAllListeners: jest.fn(),
  off: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

jest.mock('src/utils/async.utils', () => ({
  AsyncUtils: {
    sleep: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@popup/hive/utils/multisig.utils', () => ({
  MultisigUtils: {
    encodeMetadata: jest.fn().mockResolvedValue('encoded-meta'),
    decodeTransaction: jest.fn().mockResolvedValue(null),
    encodeTransaction: jest.fn().mockResolvedValue('enc-tx'),
    getPotentialSigners: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@background/utils/window.utils', () => ({
  waitUntilDialogIsReady: jest.fn((_n: number, _c: string, cb: () => void) => {
    cb();
  }),
}));

jest.mock('src/config', () => ({
  __esModule: true,
  default: {
    multisig: { baseURL: 'https://multisig.test' },
    transactions: {
      multisigExpirationTimeInMinutes: 60,
      multisigExpirationTimeInMinutesForHardfork28: 1440,
    },
    vault: { portName: 'vault-connection' },
    keyless: { host: 'https://hive-auth.test/' },
  },
}));

describe('multisig.module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;
  });

  describe('encodeMetadata', () => {
    it('delegates to MultisigUtils.encodeMetadata', async () => {
      const out = await MultisigModule.encodeMetadata({ a: 1 }, 'priv', 'STMrecv');
      expect(MultisigUtils.encodeMetadata).toHaveBeenCalledWith(
        { a: 1 },
        'priv',
        'STMrecv',
      );
      expect(out).toBe('encoded-meta');
    });
  });

  describe('processSignatureRequest', () => {
    it('returns undefined when signer is missing', async () => {
      await expect(
        MultisigModule.processSignatureRequest({ id: 1 } as any, undefined as any),
      ).resolves.toBeUndefined();
    });

    it('returns undefined when decryption yields nothing', async () => {
      jest.spyOn(MkModule, 'getMk').mockResolvedValue('mk');
      jest.spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage').mockResolvedValue([
        { name: 'alice', keys: { active: 'k', posting: 'p' } },
      ] as any);
      (MultisigUtils.decodeTransaction as jest.Mock).mockResolvedValueOnce(null);

      const signer = { id: 1, publicKey: 'STMpub', encryptedTransaction: 'enc' };
      const sigReq = {
        id: 10,
        keyType: KeychainKeyTypes.active,
      } as any;

      await expect(
        MultisigModule.processSignatureRequest(sigReq, signer),
      ).resolves.toBeUndefined();
    });
  });

  describe('start', () => {
    it('reads multisig config and completes when nothing is enabled', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
        alice: {
          isEnabled: false,
          active: { isEnabled: false, publicKey: '', message: '' },
          posting: { isEnabled: false, publicKey: '', message: '' },
        },
      } as any);

      await MultisigModule.start();

      expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.MULTISIG_CONFIG,
      );
    });
  });
});

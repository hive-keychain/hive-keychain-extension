import LedgerHiveApp from '@engrave/ledger-app-hive';
import { KeyType } from '@interfaces/keys.interface';
import Transport from '@ledgerhq/hw-transport';
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { LedgerKeyType, LedgerUtils } from 'src/utils/ledger.utils';

describe('ledger.utils.ts tests:\n', () => {
  const constants = {
    t: new Transport(),
    ledgerHiveApp: {} as LedgerHiveApp,
  };
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('init cases:\n', () => {
    it('Must return true', async () => {
      TransportWebUsb.isSupported = jest.fn().mockResolvedValue(true);
      TransportWebUsb.create = jest.fn().mockResolvedValue(constants.t);
      TransportWebUsb.list = jest.fn().mockResolvedValue(['testdevice']);
      expect(await LedgerUtils.init(true)).toBe(true);
    });

    it('Must throw error', async () => {
      TransportWebUsb.isSupported = jest.fn().mockResolvedValue(false);
      TransportWebUsb.create = jest.fn().mockResolvedValue(constants.t);
      try {
        await LedgerUtils.init(true);
      } catch (error) {
        expect(error).toEqual(new Error('html_ledger_not_supported'));
      }
    });
  });

  describe('getKeyForAccount cases:\n', () => {
    it('Must return active key', async () => {
      LedgerUtils.getKeysForAccount = jest.fn().mockResolvedValue({
        active: userData.one.nonEncryptKeys.active,
        activePubkey: userData.one.encryptKeys.active,
      });
      expect(
        await LedgerUtils.getKeyForAccount(KeyType.ACTIVE, mk.user.one),
      ).toEqual({
        active: userData.one.nonEncryptKeys.active,
        activePubkey: userData.one.encryptKeys.active,
      });
    });

    it('Must return posting key', async () => {
      LedgerUtils.getKeysForAccount = jest.fn().mockResolvedValue({
        posting: userData.one.nonEncryptKeys.posting,
        postingPubkey: userData.one.encryptKeys.posting,
      });
      expect(
        await LedgerUtils.getKeyForAccount(KeyType.POSTING, mk.user.one),
      ).toEqual({
        posting: userData.one.nonEncryptKeys.posting,
        postingPubkey: userData.one.encryptKeys.posting,
      });
    });

    it('Must return memo key', async () => {
      LedgerUtils.getKeysForAccount = jest.fn().mockResolvedValue({
        memo: userData.one.nonEncryptKeys.memo,
        memoPubkey: userData.one.encryptKeys.memo,
      });
      expect(
        await LedgerUtils.getKeyForAccount(KeyType.MEMO, mk.user.one),
      ).toEqual({
        memo: userData.one.nonEncryptKeys.memo,
        memoPubkey: userData.one.encryptKeys.memo,
      });
    });

    it('Must return {} if no keys', async () => {
      LedgerUtils.getKeysForAccount = jest.fn().mockResolvedValue(undefined);
      expect(
        await LedgerUtils.getKeyForAccount(KeyType.MEMO, mk.user.one),
      ).toEqual({});
    });
  });

  describe('buildDerivationPath cases:\n', () => {
    it('Must return path', () => {
      expect(LedgerUtils.buildDerivationPath(LedgerKeyType.ACTIVE, 1)).toBe(
        "m/48' /13' /1' /1' /0'",
      );
    });
  });

  describe('Name of the group', () => {
    it('Must return ledger instance', async () => {
      TransportWebUsb.isSupported = jest.fn().mockResolvedValue(true);
      TransportWebUsb.create = jest.fn().mockResolvedValue(constants.t);
      expect(await LedgerUtils.getLedgerInstance()).toBeInstanceOf(
        LedgerHiveApp,
      );
    });
  });

  describe('getPathFromString cases:\n', () => {
    it('Must return string path', () => {
      expect(LedgerUtils.getPathFromString('#KEY')).toBe('KEY');
    });
  });
});

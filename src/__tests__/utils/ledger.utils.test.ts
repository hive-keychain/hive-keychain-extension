import LedgerHiveApp from '@engrave/ledger-app-hive';
import { KeyType } from '@interfaces/keys.interface';
import Transport from '@ledgerhq/hw-transport';
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { KeychainError } from 'src/keychain-error';
import { LedgerKeyType, LedgerUtils } from 'src/utils/ledger.utils';

describe('ledger.utils.ts tests:\n', () => {
  const constants = {
    t: new Transport(),
    ledgerHiveApp: {} as LedgerHiveApp,
  };
  const usbDescriptor = Object.getOwnPropertyDescriptor(navigator, 'usb');
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    if (usbDescriptor) {
      Object.defineProperty(navigator, 'usb', usbDescriptor);
    } else {
      delete (navigator as { usb?: unknown }).usb;
    }
    window.history.pushState({}, '', '/');
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

    it('rejects with no device selected when the USB picker is dismissed', async () => {
      TransportWebUsb.isSupported = jest.fn().mockResolvedValue(true);
      TransportWebUsb.list = jest.fn().mockResolvedValue([]);
      TransportWebUsb.request = jest.fn().mockRejectedValue({
        name: 'NotFoundError',
        message:
          "Failed to execute 'requestDevice' on 'USB': No device selected.",
      });
      TransportWebUsb.create = jest.fn();

      await expect(LedgerUtils.init(true)).rejects.toEqual(
        new KeychainError('html_ledger_no_device_selected'),
      );
      expect(TransportWebUsb.create).not.toHaveBeenCalled();
    });

    it('opens an authorized Ledger without showing the device prompt', async () => {
      const device = { vendorId: 0x2c97 };
      TransportWebUsb.isSupported = jest.fn().mockResolvedValue(true);
      TransportWebUsb.open = jest.fn().mockResolvedValue(constants.t);
      TransportWebUsb.request = jest.fn();
      Object.defineProperty(navigator, 'usb', {
        configurable: true,
        value: {
          getDevices: jest.fn().mockResolvedValue([device]),
          requestDevice: jest.fn(),
        },
      });

      await expect(LedgerUtils.init(true)).resolves.toBe(true);
      expect(TransportWebUsb.open).toHaveBeenCalledWith(device);
      expect(
        (navigator as Navigator & { usb: { requestDevice: jest.Mock } }).usb
          .requestDevice,
      ).not.toHaveBeenCalled();
    });

    it('prompts for a Ledger from the side panel when none is authorized yet', async () => {
      const device = { vendorId: 0x2c97 };
      TransportWebUsb.isSupported = jest.fn().mockResolvedValue(true);
      TransportWebUsb.open = jest.fn().mockResolvedValue(constants.t);
      window.history.pushState({}, '', '/sidepanel.html');
      const requestDevice = jest.fn().mockResolvedValue(device);
      Object.defineProperty(navigator, 'usb', {
        configurable: true,
        value: {
          getDevices: jest.fn().mockResolvedValue([]),
          requestDevice,
        },
      });

      await expect(LedgerUtils.init(true)).resolves.toBe(true);
      expect(requestDevice).toHaveBeenCalledWith({
        filters: [{ vendorId: 0x2c97 }],
      });
      expect(TransportWebUsb.open).toHaveBeenCalledWith(device);
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
      TransportWebUsb.list = jest.fn().mockResolvedValue(['testdevice']);
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

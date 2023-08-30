import { Account } from '@hiveio/dhive';
import { Keys } from '@interfaces/keys.interface';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { KeysUtils } from 'src/utils/keys.utils';

describe('keys.utils tests:\n', () => {
  describe('getPublicKeyFromPrivateKeyString tests:\n', () => {
    test('Passing the memo private key must return the memo public key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        userData.one.nonEncryptKeys.memo,
      );
      expect(result).toBe(userData.one.encryptKeys.memo);
    });
    test('Passing the posting private key must return the memo public posting key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        userData.one.nonEncryptKeys.posting,
      );
      expect(result).toBe(userData.one.encryptKeys.posting);
    });
    test('Passing the active private key must return the memo public active key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        userData.one.nonEncryptKeys.active,
      );
      expect(result).toBe(userData.one.encryptKeys.active);
    });
    test('Passing the owner private key must return the memo public owner key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        userData.one.nonEncryptKeys.owner,
      );
      expect(result).toBe(userData.one.encryptKeys.owner);
    });
    test('Passing a fake WIF decoded key must return null', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        userData.one.nonEncryptKeys.fakeKey,
      );
      expect(result).toBe(null);
    });
    test('Passing an empty string must return null', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString('');
      expect(result).toBe(null);
    });
  });

  describe('getPubkeyWeight tests:\n', () => {
    let postingHasWeight = {
      weight_threshold: 1,
      account_auths: [
        ['peakd.app', 1],
        ['stoodkev', 1],
      ],
      key_auths: [[userData.one.encryptKeys.posting, 1]],
    };
    test('Passing a posting key authority object with weigth must return 1', () => {
      expect(
        KeysUtils.getPubkeyWeight(
          userData.one.encryptKeys.posting,
          postingHasWeight,
        ),
      ).toBe(1);
    });
    test('Passing a posting key authority object with no weigth must return 0', () => {
      postingHasWeight.key_auths = [];
      expect(
        KeysUtils.getPubkeyWeight(
          userData.one.encryptKeys.posting,
          postingHasWeight,
        ),
      ).toBe(0);
    });
  });

  describe('hasKeys tests:\n', () => {
    test('Passing an empty Keys object must return false', () => {
      expect(KeysUtils.hasKeys({} as Keys)).toBe(false);
    });
    test('Passing a Keys object with at least one key must return true', () => {
      expect(
        KeysUtils.hasKeys({
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
  });

  describe('keysCount tests:\n', () => {
    test('Passing an empty Keys Object must return 0', () => {
      expect(KeysUtils.keysCount({} as Keys)).toBe(0);
    });
    test('Passing a Keys Object with 1 key, must return 1', () => {
      expect(
        KeysUtils.keysCount({
          memoPubkey: userData.one.encryptKeys.memo,
        } as Keys),
      ).toBe(1);
    });
    test('Passing a Keys Object with 4 keys, must return 4', () => {
      expect(
        KeysUtils.keysCount({
          activePubkey: userData.one.encryptKeys.active,
          active: userData.one.nonEncryptKeys.active,
          postingPubkey: userData.one.encryptKeys.posting,
          posting: userData.one.nonEncryptKeys.posting,
        } as Keys),
      ).toBe(4);
    });
  });

  describe('hasActive tests:\n', () => {
    test('Passing an empty Keys object must return false', () => {
      expect(KeysUtils.hasActive({} as Keys)).toBe(false);
    });
    test('Passing a Keys object with active key present, must return true', () => {
      expect(
        KeysUtils.hasActive({
          active: userData.one.nonEncryptKeys.active,
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
    test('Passing a Keys object with keys but no active key present, must return false', () => {
      expect(
        KeysUtils.hasActive({
          memo: userData.one.nonEncryptKeys.memo,
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(false);
    });
  });

  describe('hasPosting tests:\n', () => {
    test('Passing an empty Keys object must return false', () => {
      expect(KeysUtils.hasPosting({} as Keys)).toBe(false);
    });
    test('Passing a Keys object with posting key present, must return true', () => {
      expect(
        KeysUtils.hasPosting({
          posting: userData.one.nonEncryptKeys.posting,
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
    test('Passing a Keys object with keys but no posting key present, must return false', () => {
      expect(
        KeysUtils.hasPosting({
          memo: userData.one.nonEncryptKeys.memo,
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(false);
    });
  });

  describe('hasMemo tests:\n', () => {
    test('Passing an empty Keys object must return false', () => {
      expect(KeysUtils.hasMemo({} as Keys)).toBe(false);
    });
    test('Passing a Keys object with memo key present, must return true', () => {
      expect(
        KeysUtils.hasMemo({
          memo: userData.one.nonEncryptKeys.memo,
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
    test('Passing a Keys object with keys but no memo key present, must return false', () => {
      expect(
        KeysUtils.hasMemo({
          posting: userData.one.nonEncryptKeys.posting,
          activePubkey: userData.one.encryptKeys.active,
        } as Keys),
      ).toBe(false);
    });
  });

  describe('isAuthorizedAccount tests:\n', () => {
    test('Passing a key without @ at the beginning, must return false', () => {
      expect(
        KeysUtils.isAuthorizedAccount(userData.one.nonEncryptKeys.active),
      ).toBe(false);
    });
    test('Passing a public key that starts with @, must return true', () => {
      expect(
        KeysUtils.isAuthorizedAccount(`@${userData.one.encryptKeys.active}`),
      ).toBe(true);
    });
  });

  describe('derivateFromMasterPassword tests:\n', () => {
    test('Passing valid account obj, master key and username must return all keys', () => {
      const account = {
        id: 1,
        name: userData.one.username,
        posting: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[userData.one.encryptKeys.posting, 1]],
        },
        active: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[userData.one.encryptKeys.active, 1]],
        },
        memo_key: userData.one.encryptKeys.memo,
      } as Account;
      expect(
        KeysUtils.derivateFromMasterPassword(
          account.name,
          userData.one.nonEncryptKeys.master,
          account,
        ),
      ).toEqual({
        active: userData.one.nonEncryptKeys.active,
        activePubkey: userData.one.encryptKeys.active,
        posting: userData.one.nonEncryptKeys.posting,
        postingPubkey: userData.one.encryptKeys.posting,
        memo: userData.one.nonEncryptKeys.memo,
        memoPubkey: userData.one.encryptKeys.memo,
      });
    });
  });
});

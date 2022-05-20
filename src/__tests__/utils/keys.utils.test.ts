import { Account } from '@hiveio/dhive';
import { Keys } from '@interfaces/keys.interface';
import KeysUtils from 'src/utils/keys.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('keys.utils tests:\n', () => {
  describe('getPublicKeyFromPrivateKeyString tests:\n', () => {
    test('Passing the memo private key must return the memo public key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        utilsT.userData.nonEncryptKeys.memo,
      );
      expect(result).toBe(utilsT.userData.encryptKeys.memo);
    });
    test('Passing the posting private key must return the memo public posting key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        utilsT.userData.nonEncryptKeys.posting,
      );
      expect(result).toBe(utilsT.userData.encryptKeys.posting);
    });
    test('Passing the active private key must return the memo public active key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        utilsT.userData.nonEncryptKeys.active,
      );
      expect(result).toBe(utilsT.userData.encryptKeys.active);
    });
    test('Passing the owner private key must return the memo public owner key', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        utilsT.userData.nonEncryptKeys.owner,
      );
      expect(result).toBe(utilsT.userData.encryptKeys.owner);
    });
    test('Passing a fake WIF decoded key must return null', () => {
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(
        utilsT.userData.nonEncryptKeys.fakeKey,
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
      key_auths: [[utilsT.userData.encryptKeys.posting, 1]],
    };
    test('Passing a posting key authority object with weigth must return 1', () => {
      expect(
        KeysUtils.getPubkeyWeight(
          utilsT.userData.encryptKeys.posting,
          postingHasWeight,
        ),
      ).toBe(1);
    });
    test('Passing a posting key authority object with no weigth must return 0', () => {
      postingHasWeight.key_auths = [];
      expect(
        KeysUtils.getPubkeyWeight(
          utilsT.userData.encryptKeys.posting,
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
          activePubkey: utilsT.userData.encryptKeys.active,
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
          memoPubkey: utilsT.userData.encryptKeys.memo,
        } as Keys),
      ).toBe(1);
    });
    test('Passing a Keys Object with 4 keys, must return 4', () => {
      expect(
        KeysUtils.keysCount({
          activePubkey: utilsT.userData.encryptKeys.active,
          active: utilsT.userData.nonEncryptKeys.active,
          postingPubkey: utilsT.userData.encryptKeys.posting,
          posting: utilsT.userData.nonEncryptKeys.posting,
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
          active: utilsT.userData.nonEncryptKeys.active,
          activePubkey: utilsT.userData.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
    test('Passing a Keys object with keys but no active key present, must return false', () => {
      expect(
        KeysUtils.hasActive({
          memo: utilsT.userData.nonEncryptKeys.memo,
          activePubkey: utilsT.userData.encryptKeys.active,
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
          posting: utilsT.userData.nonEncryptKeys.posting,
          activePubkey: utilsT.userData.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
    test('Passing a Keys object with keys but no posting key present, must return false', () => {
      expect(
        KeysUtils.hasPosting({
          memo: utilsT.userData.nonEncryptKeys.memo,
          activePubkey: utilsT.userData.encryptKeys.active,
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
          memo: utilsT.userData.nonEncryptKeys.memo,
          activePubkey: utilsT.userData.encryptKeys.active,
        } as Keys),
      ).toBe(true);
    });
    test('Passing a Keys object with keys but no memo key present, must return false', () => {
      expect(
        KeysUtils.hasMemo({
          posting: utilsT.userData.nonEncryptKeys.posting,
          activePubkey: utilsT.userData.encryptKeys.active,
        } as Keys),
      ).toBe(false);
    });
  });

  describe('isAuthorizedAccount tests:\n', () => {
    test('Passing a key without @ at the beginning, must return false', () => {
      expect(
        KeysUtils.isAuthorizedAccount(utilsT.userData.nonEncryptKeys.active),
      ).toBe(false);
    });
    test('Passing a public key that starts with @, must return true', () => {
      expect(
        KeysUtils.isAuthorizedAccount(`@${utilsT.userData.encryptKeys.active}`),
      ).toBe(true);
    });
  });

  describe('derivateFromMasterPassword tests:\n', () => {
    test('Passing valid account obj, master key and username must return all keys', () => {
      const account = {
        id: 1,
        name: utilsT.userData.username,
        posting: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[utilsT.userData.encryptKeys.posting, 1]],
        },
        active: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[utilsT.userData.encryptKeys.active, 1]],
        },
        memo_key: utilsT.userData.encryptKeys.memo,
      } as Account;
      expect(
        KeysUtils.derivateFromMasterPassword(
          account.name,
          utilsT.userData.nonEncryptKeys.master,
          account,
        ),
      ).toEqual({
        active: utilsT.userData.nonEncryptKeys.active,
        activePubkey: utilsT.userData.encryptKeys.active,
        posting: utilsT.userData.nonEncryptKeys.posting,
        postingPubkey: utilsT.userData.encryptKeys.posting,
        memo: utilsT.userData.nonEncryptKeys.memo,
        memoPubkey: utilsT.userData.encryptKeys.memo,
      });
    });
  });
});

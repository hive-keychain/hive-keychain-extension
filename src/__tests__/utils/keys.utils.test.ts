import { Account } from '@hiveio/dhive';
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
      key_auths: [[utilsT.userData2.encryptKeys.posting, 1]],
    };
    test('Passing a posting key authority object with weigth must return 1', () => {
      expect(
        KeysUtils.getPubkeyWeight(
          utilsT.userData2.encryptKeys.posting,
          postingHasWeight,
        ),
      ).toBe(1);
    });
    test('Passing a posting key authority object with no weigth must return 0', () => {
      postingHasWeight.key_auths = [];
      expect(
        KeysUtils.getPubkeyWeight(
          utilsT.userData2.encryptKeys.posting,
          postingHasWeight,
        ),
      ).toBe(0);
    });
  });

  describe('derivateFromMasterPassword tests:\n', () => {
    test('Passing valid account obj, master key and username must return all keys', () => {
      const account = {
        id: 1,
        name: utilsT.userData2.username,
        posting: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[utilsT.userData2.encryptKeys.posting, 1]],
        },
        active: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[utilsT.userData2.encryptKeys.active, 1]],
        },
        memo_key: utilsT.userData2.encryptKeys.memo,
      } as Account;
      expect(
        KeysUtils.derivateFromMasterPassword(
          account.name,
          utilsT.userData2.nonEncryptKeys.master,
          account,
        ),
      ).toEqual({
        active: utilsT.userData2.nonEncryptKeys.active,
        activePubkey: utilsT.userData2.encryptKeys.active,
        posting: utilsT.userData2.nonEncryptKeys.posting,
        postingPubkey: utilsT.userData2.encryptKeys.posting,
        memo: utilsT.userData2.nonEncryptKeys.memo,
        memoPubkey: utilsT.userData2.encryptKeys.memo,
      });
    });
  });
});

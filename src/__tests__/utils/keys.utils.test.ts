import { KeysUtils } from '@hiveapp/utils/keys.utils';
import { Account, ExtendedAccount } from '@hiveio/dhive';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { Keys, PrivateKeyType } from '@interfaces/keys.interface';
import { PrivateKey } from 'hive-tx';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import type { WrongKeysOnUser } from 'src/popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

/** Same derivation as `KeysUtils` (hive-tx); avoids brittle hard-coded STM strings across Jest/jsdom. */
const expectedPubFromWif = (wif: string) =>
  PrivateKey.fromString(wif).createPublic().toString();

describe('keys.utils tests:\n', () => {
  describe('getPublicKeyFromPrivateKeyString tests:\n', () => {
    test('Passing the memo private key must return the memo public key', () => {
      const wif = userData.one.nonEncryptKeys.memo;
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(wif);
      expect(result).toBe(expectedPubFromWif(wif));
    });
    test('Passing the posting private key must return the memo public posting key', () => {
      const wif = userData.one.nonEncryptKeys.posting;
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(wif);
      expect(result).toBe(expectedPubFromWif(wif));
    });
    test('Passing the active private key must return the memo public active key', () => {
      const wif = userData.one.nonEncryptKeys.active;
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(wif);
      expect(result).toBe(expectedPubFromWif(wif));
    });
    test('Passing the owner private key must return the memo public owner key', () => {
      const wif = userData.one.nonEncryptKeys.owner;
      const result = KeysUtils.getPublicKeyFromPrivateKeyString(wif);
      expect(result).toBe(expectedPubFromWif(wif));
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
      const { username, nonEncryptKeys } = userData.one;
      const postingPriv = PrivateKey.fromLogin(
        username,
        nonEncryptKeys.master,
        'posting',
      );
      const activePriv = PrivateKey.fromLogin(
        username,
        nonEncryptKeys.master,
        'active',
      );
      const memoPriv = PrivateKey.fromLogin(
        username,
        nonEncryptKeys.master,
        'memo',
      );
      const postingPub = postingPriv.createPublic().toString();
      const activePub = activePriv.createPublic().toString();
      const memoPub = memoPriv.createPublic().toString();

      const account = {
        id: 1,
        name: username,
        posting: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[postingPub, 1]],
        },
        active: {
          weight_threshold: 1,
          account_auths: [
            ['peakd.app', 1],
            ['stoodkev', 1],
          ],
          key_auths: [[activePub, 1]],
        },
        memo_key: memoPub,
      } as Account;

      expect(
        KeysUtils.derivateFromMasterPassword(
          account.name,
          nonEncryptKeys.master,
          account,
        ),
      ).toEqual({
        active: activePriv.toString(),
        activePubkey: activePub,
        posting: postingPriv.toString(),
        postingPubkey: postingPub,
        memo: memoPriv.toString(),
        memoPubkey: memoPub,
      });
    });

    test('returns null when derived keys do not match any on-chain authority', () => {
      const { username, nonEncryptKeys } = userData.one;

      const account = {
        id: 1,
        name: username,
        posting: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [['STM1111111111111111111111111111111114T1Anm', 1]],
        },
        active: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [['STM1111111111111111111111111111111114T1Anm', 1]],
        },
        memo_key: 'STM1111111111111111111111111111111114T1Anm',
      } as Account;

      expect(
        KeysUtils.derivateFromMasterPassword(
          account.name,
          nonEncryptKeys.master,
          account,
        ),
      ).toBeNull();
    });
  });

  describe('isUsingLedger / requireManualConfirmation', () => {
    test('ledger-prefixed keys are treated as hardware keys', () => {
      expect(KeysUtils.isUsingLedger(null)).toBe(false);
      expect(KeysUtils.isUsingLedger('#' + 'ledgerRef')).toBe(true);
      expect(KeysUtils.requireManualConfirmation('#' + 'ledgerRef')).toBe(true);
    });
  });

  describe('isUsingMultisig', () => {
    test('detects partial weight on active authority (below threshold)', () => {
      const priv = userData.one.nonEncryptKeys.active;
      const pub = KeysUtils.getPublicKeyFromPrivateKeyString(priv)!;
      const extended = {
        name: 'alice',
        active: {
          weight_threshold: 100,
          account_auths: [],
          key_auths: [[pub, 5]],
        },
        posting: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        },
      } as ExtendedAccount;

      expect(
        KeysUtils.isUsingMultisig(
          priv,
          extended,
          'initiator',
          KeychainKeyTypesLC.active,
        ),
      ).toBe(true);
    });

    test('returns false when active key weight meets threshold', () => {
      const priv = userData.one.nonEncryptKeys.active;
      const pub = KeysUtils.getPublicKeyFromPrivateKeyString(priv)!;
      const extended = {
        name: 'alice',
        active: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [[pub, 1]],
        },
        posting: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        },
      } as ExtendedAccount;

      expect(
        KeysUtils.isUsingMultisig(
          priv,
          extended,
          'initiator',
          KeychainKeyTypesLC.active,
        ),
      ).toBe(false);
    });

    test('detects partial weight on posting authority', () => {
      const priv = userData.one.nonEncryptKeys.posting;
      const pub = KeysUtils.getPublicKeyFromPrivateKeyString(priv)!;
      const extended = {
        name: 'alice',
        active: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        },
        posting: {
          weight_threshold: 50,
          account_auths: [],
          key_auths: [[pub, 10]],
        },
      } as ExtendedAccount;

      expect(
        KeysUtils.isUsingMultisig(
          priv,
          extended,
          'initiator',
          KeychainKeyTypesLC.posting,
        ),
      ).toBe(true);
    });
  });

  describe('getKeyType', () => {
    test('classifies multisig when partial authority weight applies', () => {
      const priv = userData.one.nonEncryptKeys.active;
      const pub = KeysUtils.getPublicKeyFromPrivateKeyString(priv)!;
      const transactionAccount = {
        name: 'alice',
        active: {
          weight_threshold: 100,
          account_auths: [],
          key_auths: [[pub, 3]],
        },
        posting: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        },
      } as ExtendedAccount;
      const initiator = { name: 'bob' } as ExtendedAccount;

      expect(
        KeysUtils.getKeyType(
          priv,
          pub,
          transactionAccount,
          initiator,
          KeychainKeyTypesLC.active,
        ),
      ).toBe(PrivateKeyType.MULTISIG);
    });

    test('classifies ledger and authorized-account markers', () => {
      expect(KeysUtils.getKeyType('#ledger', null)).toBe(PrivateKeyType.LEDGER);
      expect(KeysUtils.getKeyType('priv', '@pub')).toBe(
        PrivateKeyType.AUTHORIZED_ACCOUNT,
      );
      expect(
        KeysUtils.getKeyType(userData.one.nonEncryptKeys.active, null),
      ).toBe(PrivateKeyType.PRIVATE_KEY);
    });
  });

  describe('isExportable', () => {
    test('allows export for normal private vs public key pairs', () => {
      const priv = userData.one.nonEncryptKeys.active;
      const pub = userData.one.encryptKeys.active;
      expect(KeysUtils.isExportable(priv, pub)).toBe(true);
    });

    test('returns false when either side is missing', () => {
      expect(KeysUtils.isExportable(undefined, 'STMpub')).toBe(false);
      expect(KeysUtils.isExportable('priv', undefined)).toBe(false);
    });
  });

  describe('checkWrongKeyOnAccount', () => {
    test('records active/posting pubkey mismatches and memo key mismatch', () => {
      const goodActivePub = userData.one.encryptKeys.active;
      const extended = {
        active: {
          key_auths: [[goodActivePub, 1]],
        },
        posting: {
          key_auths: [[userData.one.encryptKeys.posting, 1]],
        },
        memo_key: userData.one.encryptKeys.memo,
      } as ExtendedAccount;

      const found: WrongKeysOnUser = { alice: [] };

      KeysUtils.checkWrongKeyOnAccount(
        'activePubkey',
        'STMwrong',
        'alice',
        extended,
        found,
      );
      KeysUtils.checkWrongKeyOnAccount(
        'postingPubkey',
        'STMwrong2',
        'alice',
        extended,
        found,
      );
      KeysUtils.checkWrongKeyOnAccount(
        'memoPubkey',
        'STMwrongmemo',
        'alice',
        extended,
        found,
      );

      expect(found.alice).toEqual(
        expect.arrayContaining(['active', 'posting', 'memo']),
      );
    });

    test('skips validation when skipKey is true', () => {
      const extended = {
        active: { key_auths: [] },
        posting: { key_auths: [] },
        memo_key: '',
      } as ExtendedAccount;
      const found: WrongKeysOnUser = { bob: [] };

      KeysUtils.checkWrongKeyOnAccount(
        'activePubkey',
        'bad',
        'bob',
        extended,
        found,
        true,
      );

      expect(found.bob).toHaveLength(0);
    });
  });

  describe('getKeyReferences', () => {
    test('delegates to condenser_api.get_key_references', async () => {
      const spy = jest
        .spyOn(HiveTxUtils, 'getData')
        .mockResolvedValue([['alice']] as any);

      await expect(
        KeysUtils.getKeyReferences([userData.one.encryptKeys.active]),
      ).resolves.toEqual([['alice']]);

      expect(spy).toHaveBeenCalledWith('condenser_api.get_key_references', [
        [userData.one.encryptKeys.active],
      ]);
    });
  });

  describe('isKeyActiveOrPosting', () => {
    test('returns active when stored local key matches active WIF', async () => {
      const active = userData.one.nonEncryptKeys.active;
      jest.spyOn(AccountUtils, 'getAccountFromLocalStorage').mockResolvedValue({
        name: 'alice',
        keys: { active, posting: userData.one.nonEncryptKeys.posting },
      } as any);

      const { KeychainKeyTypes } = await import('hive-keychain-commons');
      await expect(
        KeysUtils.isKeyActiveOrPosting(active, { name: 'alice' } as ExtendedAccount),
      ).resolves.toBe(KeychainKeyTypes.active);
    });
  });
});

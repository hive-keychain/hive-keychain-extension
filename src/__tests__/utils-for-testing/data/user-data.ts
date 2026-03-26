import { Keys } from '@interfaces/keys.interface';
import { PrivateKey } from 'hive-tx';

/**
 * Canonical Hive test identities — fixed WIFs with pubkeys derived via hive-tx at
 * module load so Jest/jsdom and `KeysUtils.getPublicKeyFromPrivateKeyString` agree
 * with `encryptKeys` (hive-tx’s CryptoJS path can differ from Node for the same WIF).
 *
 * To regenerate encrypted account blobs in tests, use `EncryptUtils.encryptJson` with
 * `TEST_VAULT_MK` and the same key material (see `accounts.ts`).
 */
export const TEST_VAULT_MK = 'hive-keychain-test-mk-v1';

const TEST_USERNAME = 'keychain.tests';
/** Brain-wallet password used only for test key derivation (not a WIF). */
const TEST_MASTER_PASSWORD = 'hive-keychain-test-master-password-v1';

const pubFromWif = (wif: string) =>
  PrivateKey.fromString(wif).createPublic().toString();

const nonEncryptKeys = {
  /** Same string passed to `PrivateKey.fromLogin` as password (not a WIF). */
  master: TEST_MASTER_PASSWORD,
  owner: '5KRQo45wqgENiZnHP1snXotSKaQtGVW3XHf8ThPw9Y88rtHidWN',
  active: '5KBmiCuqEohHugciuGApR9or5Twn6mNuJpHkJo8vA2X4DH4EcXi',
  posting: '5KBN59EVyowwgN3cPtV6w2aAFSPnWN3Z8ShUk2npakbU2CYtTTv',
  memo: '5KJ98zPvdTNwo6SGVacWjwpLnnC3KGEUjr78t5HZ9Xa5UAUXbFZ',
  /** Must not be a valid WIF for hive-tx (getPublicKeyFromPrivateKeyString → null). */
  fakeKey: 'not-a-valid-wif',
  randomStringKey51: 'MknOPyeXr5CGsCgvDewdny55MREtDpAjhkT9OsPPLCujYD82Urk',
};

const encryptKeys = {
  owner: pubFromWif(nonEncryptKeys.owner),
  active: pubFromWif(nonEncryptKeys.active),
  posting: pubFromWif(nonEncryptKeys.posting),
  memo: pubFromWif(nonEncryptKeys.memo),
  randomString53: 'Kzi5gocL1KZlnsryMRIbfdmXgz2lLmiaosQDELp3GM2jU9sFYguxv',
};

const one = {
  username: TEST_USERNAME,
  encryptKeys,
  nonEncryptKeys,
};

const TEST_USER2_USERNAME = 'workerjab2';

const two = {
  username: TEST_USER2_USERNAME,
  keys: {
    posting: '5KCP5JMENP6sRYZzjvYkv1G2qJjgiSsX6knAynEU9HT8qHJ91Xm',
    postingPubkey: 'STM6iAsgBsNxC6U9XiUxQ9AgpSD3vymdyRyGafJNeVCWh65wY8rL4',
  } as Keys,
};

export default { one, two };

import { PrivateKey } from 'hive-tx';

/**
 * In jsdom/Jest, `hive-keychain-commons` `isWif` can disagree with hive-tx for the
 * same base58 string. Account flows (`getKeys`, add key) gate on `isWif` before using
 * `KeysUtils.getPublicKeyFromPrivateKeyString`; align detection with hive-tx.
 */
export const getHiveKeychainCommonsIsWifMock = () => {
  const actual = jest.requireActual('hive-keychain-commons') as Record<
    string,
    unknown
  >;
  const realIsWif = actual.isWif as (s: string) => boolean;
  return {
    ...actual,
    isWif: (s: string) => {
      try {
        PrivateKey.fromString(s);
        return true;
      } catch {
        return realIsWif(s);
      }
    },
  };
};

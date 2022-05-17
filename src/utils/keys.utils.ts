import * as Hive from '@hiveio/dhive';
import { Account } from '@hiveio/dhive';
import { Key } from '@interfaces/local-account.interface';
import { Keys } from 'src/interfaces/keys.interface';

const getPublicKeyFromPrivateKeyString = (privateKeyS: string) => {
  try {
    const privateKey = Hive.PrivateKey.fromString(privateKeyS);
    const publicKey = privateKey.createPublic();
    return publicKey.toString();
  } catch (e) {
    return null;
  }
};

const getPubkeyWeight = (publicKey: any, permissions: any) => {
  for (let n in permissions.key_auths) {
    const keyWeight = permissions.key_auths[n];
    const lpub = keyWeight['0'];
    if (publicKey === lpub) {
      return keyWeight['1'];
    }
  }
  return 0;
};

const derivateFromMasterPassword = (
  username: string,
  password: string,
  account: Account,
): Keys | null => {
  const posting = Hive.PrivateKey.fromLogin(username, password, 'posting');
  const active = Hive.PrivateKey.fromLogin(username, password, 'active');
  const memo = Hive.PrivateKey.fromLogin(username, password, 'memo');

  const keys = {
    posting: posting.toString(),
    active: active.toString(),
    memo: memo.toString(),
    postingPubkey: posting.createPublic().toString(),
    activePubkey: active.createPublic().toString(),
    memoPubkey: memo.createPublic().toString(),
  };

  const hasActive = getPubkeyWeight(keys.activePubkey, account.active);
  const hasPosting = getPubkeyWeight(keys.postingPubkey, account.posting);

  if (hasActive || hasPosting || keys.memoPubkey === account.memo_key) {
    const workingKeys: Keys = {};
    if (hasActive) {
      workingKeys.active = keys.active;
      workingKeys.activePubkey = keys.activePubkey;
    }
    if (hasPosting) {
      workingKeys.posting = keys.posting;
      workingKeys.postingPubkey = keys.postingPubkey;
    }
    if (keys.memoPubkey === account.memo_key) {
      workingKeys.memo = keys.memo;
      workingKeys.memoPubkey = keys.memoPubkey;
    }
    return workingKeys;
  } else {
    return null;
  }
};
/* istanbul ignore next */
const hasKeys = (keys: Keys): boolean => {
  return keysCount(keys) > 0;
};
/* istanbul ignore next */
const keysCount = (keys: Keys): number => {
  return Object.keys(keys).length;
};
/* istanbul ignore next */
const hasActive = (keys: Keys): boolean => {
  return keys.active !== undefined;
};
/* istanbul ignore next */
const hasPosting = (keys: Keys): boolean => {
  return keys.posting !== undefined;
};
/* istanbul ignore next */
const hasMemo = (keys: Keys): boolean => {
  return keys.memo !== undefined;
};
/* istanbul ignore next */
const isAuthorizedAccount = (key: Key): boolean => {
  return key!.toString().startsWith('@');
};

const KeysUtils = {
  isAuthorizedAccount,
  getPublicKeyFromPrivateKeyString,
  getPubkeyWeight,
  derivateFromMasterPassword,
  hasKeys,
  keysCount,
  hasActive,
  hasPosting,
  hasMemo,
};

export default KeysUtils;

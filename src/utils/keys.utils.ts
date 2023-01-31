import { Account, PrivateKey } from '@hiveio/dhive';
import { Key, Keys, PrivateKeyType } from 'src/interfaces/keys.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const getPublicKeyFromPrivateKeyString = (privateKeyS: string) => {
  try {
    const privateKey = PrivateKey.fromString(privateKeyS);
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
  const posting = PrivateKey.fromLogin(username, password, 'posting');
  const active = PrivateKey.fromLogin(username, password, 'active');
  const memo = PrivateKey.fromLogin(username, password, 'memo');

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

const hasKeys = (keys: Keys): boolean => {
  return keysCount(keys) > 0;
};

const keysCount = (keys: Keys): number => {
  return keys ? Object.keys(keys).length : 0;
};

const hasActive = (keys: Keys): boolean => {
  return keys.active !== undefined;
};

const hasPosting = (keys: Keys): boolean => {
  return keys.posting !== undefined;
};

const hasMemo = (keys: Keys): boolean => {
  return keys.memo !== undefined;
};

const isAuthorizedAccount = (key: Key): boolean => {
  return KeysUtils.getKeyType(key) === PrivateKeyType.AUTHORIZED_ACCOUNT;
};

const isUsingLedger = (key: Key): boolean => {
  if (!key) return false;
  return KeysUtils.getKeyType(key) === PrivateKeyType.LEDGER;
};

const getKeyReferences = (keys: string[]) => {
  return HiveTxUtils.getData('condenser_api.get_key_references', [keys]);
};

const getKeyType = (key: Key): PrivateKeyType => {
  if (key!.toString().startsWith('#')) {
    return PrivateKeyType.LEDGER;
  } else if (key!.toString().startsWith('@')) {
    return PrivateKeyType.AUTHORIZED_ACCOUNT;
  } else {
    return PrivateKeyType.PRIVATE_KEY;
  }
};

const requireManualConfirmation = (key: Key) => {
  return KeysUtils.isUsingLedger(key);
};

export const KeysUtils = {
  isAuthorizedAccount,
  getPublicKeyFromPrivateKeyString,
  getPubkeyWeight,
  derivateFromMasterPassword,
  hasKeys,
  keysCount,
  hasActive,
  hasPosting,
  hasMemo,
  isUsingLedger,
  getKeyReferences,
  getKeyType,
  requireManualConfirmation,
};

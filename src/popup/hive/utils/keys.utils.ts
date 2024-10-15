import { Account, ExtendedAccount, PrivateKey } from '@hiveio/dhive';
import AccountUtils from '@popup/hive/utils/account.utils';
import { KeychainKeyTypes, KeychainKeyTypesLC } from 'hive-keychain-commons';
import { Key, Keys, PrivateKeyType } from 'src/interfaces/keys.interface';
import { WrongKeysOnUser } from 'src/popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

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
  return KeysUtils.getKeyType(null, key) === PrivateKeyType.AUTHORIZED_ACCOUNT;
};

const isUsingLedger = (key: Key): boolean => {
  if (!key) return false;
  return KeysUtils.getKeyType(key, null) === PrivateKeyType.LEDGER;
};

const isKeyActiveOrPosting = async (key: Key, account: ExtendedAccount) => {
  const localAccount = await AccountUtils.getAccountFromLocalStorage(
    account.name,
  );
  if (localAccount?.keys.active === key) {
    return KeychainKeyTypes.active;
  } else {
    return KeychainKeyTypes.posting;
  }
};

const isUsingMultisig = (
  key: Key,
  transactionAccount: ExtendedAccount,
  initiatorAccountName: string,
  method: KeychainKeyTypesLC,
): boolean => {
  const publicKey = KeysUtils.getPublicKeyFromPrivateKeyString(
    key?.toString()!,
  );
  switch (method) {
    case KeychainKeyTypesLC.active: {
      const accAuth = transactionAccount.active.account_auths.find(
        ([auth, w]) => auth === initiatorAccountName,
      );
      const keyAuth = transactionAccount.active.key_auths.find(
        ([keyAuth, w]) => keyAuth === publicKey,
      );
      if (
        (accAuth && accAuth[1] < transactionAccount.active.weight_threshold) ||
        (keyAuth && keyAuth[1] < transactionAccount.active.weight_threshold)
      ) {
        return true;
      }
      return false;
    }
    case KeychainKeyTypesLC.posting:
      {
        const accAuth = transactionAccount.posting.account_auths.find(
          ([auth, w]) => auth === initiatorAccountName,
        );
        const keyAuth = transactionAccount.posting.key_auths.find(
          ([keyAuth, w]) => keyAuth === publicKey,
        );
        if (
          (accAuth &&
            accAuth[1] < transactionAccount.posting.weight_threshold) ||
          (keyAuth && keyAuth[1] < transactionAccount.posting.weight_threshold)
        ) {
          return true;
        }
      }
      return false;
  }

  return true;
};

const getKeyReferences = (keys: string[]) => {
  return HiveTxUtils.getData('condenser_api.get_key_references', [keys]);
};

const getKeyType = (
  privateKey: Key,
  publicKey?: Key,
  transactionAccount?: ExtendedAccount,
  initiatorAccount?: ExtendedAccount,
  method?: KeychainKeyTypesLC,
): PrivateKeyType => {
  if (
    transactionAccount &&
    initiatorAccount &&
    method &&
    KeysUtils.isUsingMultisig(
      privateKey,
      transactionAccount,
      initiatorAccount.name,
      method,
    )
  ) {
    return PrivateKeyType.MULTISIG;
  } else if (privateKey?.toString().startsWith('#')) {
    return PrivateKeyType.LEDGER;
  } else if (publicKey?.toString().startsWith('@')) {
    return PrivateKeyType.AUTHORIZED_ACCOUNT;
  } else {
    return PrivateKeyType.PRIVATE_KEY;
  }
};

const requireManualConfirmation = (key: Key) => {
  return KeysUtils.isUsingLedger(key);
};

const isExportable = (
  privateKey: Key | undefined,
  publicKey: Key | undefined,
) => {
  if (privateKey && publicKey) {
    const keyType = KeysUtils.getKeyType(privateKey, publicKey);
    if (
      keyType === PrivateKeyType.PRIVATE_KEY ||
      keyType === PrivateKeyType.AUTHORIZED_ACCOUNT
    )
      return true;
  } else {
    return false;
  }
};

const checkWrongKeyOnAccount = (
  key: string,
  value: string,
  accountName: string,
  extendedAccount: ExtendedAccount,
  foundWrongKey: WrongKeysOnUser,
  skipKey?: boolean,
) => {
  if (!skipKey && key.includes('Pubkey') && !String(value).includes('@')) {
    const keyType = key.split('Pubkey')[0];
    if (
      keyType === KeychainKeyTypesLC.active ||
      keyType === KeychainKeyTypesLC.posting
    ) {
      if (
        !extendedAccount[keyType].key_auths.find(
          (keyAuth) => keyAuth[0] === value,
        )
      ) {
        foundWrongKey[accountName].push(keyType);
      }
    } else if (keyType === KeychainKeyTypesLC.memo) {
      if (extendedAccount['memo_key'] !== value) {
        foundWrongKey[accountName].push(keyType);
      }
    }
  }
  return foundWrongKey;
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
  isUsingMultisig,
  getKeyReferences,
  getKeyType,
  requireManualConfirmation,
  isExportable,
  checkWrongKeyOnAccount,
  isKeyActiveOrPosting,
};

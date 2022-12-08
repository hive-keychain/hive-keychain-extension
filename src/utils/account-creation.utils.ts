import {
  ChangeRecoveryAccountOperation,
  Operation,
  PrivateKey,
} from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

export enum AccountCreationType {
  USING_TICKET = 'USING_TICKET',
  BUYING = 'BUYING',
}

export interface GeneratedKey {
  public: string;
  private: string;
}

export interface GeneratedKeys {
  owner: GeneratedKey;
  active: GeneratedKey;
  posting: GeneratedKey;
  memo: GeneratedKey;
}

const checkAccountNameAvailable = async (username: string) => {
  const account = await AccountUtils.getExtendedAccount(username);
  return account ? false : true;
};

const generateMasterKey = () => {
  const array = new Uint32Array(10);
  crypto.getRandomValues(array);
  return 'P' + PrivateKey.fromSeed(array.toString()).toString();
};

const validateUsername = (username: string) => {
  return new RegExp(
    /^(?=.{3,16}$)[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){2,}([\.](?=[a-z][0-9a-z\-][0-9a-z\-])[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){1,}){0,}$/,
  ).test(username);
};

const createAccount = async (
  creationType: AccountCreationType,
  price: number,
  newUsername: string,
  parentAccount: LocalAccount,
  keys: GeneratedKeys,
) => {
  let success = null;
  switch (creationType) {
    case AccountCreationType.BUYING: {
      success = await createPayingAccount(
        keys,
        newUsername,
        parentAccount,
        price,
      );
      break;
    }
    case AccountCreationType.USING_TICKET: {
      success = await createAccountUsingTicket(
        keys,
        newUsername,
        parentAccount,
      );
      break;
    }
  }
  if (success) {
    return {
      name: newUsername,
      keys: {
        active: keys.active.private,
        activePubkey: keys.active.public,
        posting: keys.posting.private,
        postingPubkey: keys.posting.public,
        memo: keys.memo.private,
        memoPubkey: keys.memo.public,
      },
    } as LocalAccount;
  } else {
    return false;
  }
};

const createAccountUsingTicket = (
  keys: GeneratedKeys,
  newUsername: string,
  parentAccount: LocalAccount,
) => {
  return HiveTxUtils.sendOperation(
    [
      [
        'create_claimed_account',
        {
          creator: parentAccount.name!,
          new_account_name: newUsername,
          json_metadata: '{}',
          extensions: [],
          ...generateKeyObject(keys),
        },
      ],
    ],
    parentAccount.keys.active!,
  );
};

const createPayingAccount = (
  keys: GeneratedKeys,
  newUsername: string,
  parentAccount: LocalAccount,
  price: number,
) => {
  return HiveTxUtils.sendOperation(
    [
      [
        'account_create',
        {
          fee: `${price.toFixed(3)} HIVE`,
          creator: parentAccount.name!,
          new_account_name: newUsername,
          json_metadata: '{}',
          ...generateKeyObject(keys),
        },
      ] as Operation,
    ],
    parentAccount.keys.active!,
  );
};

const generateKeyObject = (keys: GeneratedKeys) => {
  return {
    owner: {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[keys.owner.public, 1]],
    },
    active: {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[keys.active.public, 1]],
    },
    posting: {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[keys.posting.public, 1]],
    },
    memo_key: keys.memo.public,
  };
};

const setRecoveryAccountOperation = (
  accountName: string,
  newRecoveryAccount: string,
  ownerKey: string,
) => {
  return HiveTxUtils.sendOperation(
    [
      [
        'change_recovery_account',
        {
          account_to_recover: accountName,
          new_recovery_account: newRecoveryAccount,
          extensions: [],
        },
      ] as ChangeRecoveryAccountOperation,
    ],
    ownerKey as Key,
  );
};

export const AccountCreationUtils = {
  checkAccountNameAvailable,
  generateMasterKey,
  validateUsername,
  createAccount,
  setRecoveryAccountOperation,
};

import type {
  AccountCreateOperation,
  AuthorityType,
  ChangeRecoveryAccountOperation,
  CreateClaimedAccountOperation,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { PrivateKey } from 'hive-tx';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

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

export interface AccountAuthorities {
  owner: AuthorityType;
  active: AuthorityType;
  posting: AuthorityType;
  memo_key: string;
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
  newUsername: string,
  parentUsername: string,
  parentActiveKey: Key,
  authorities: AccountAuthorities,
  price?: number,
  generatedKeys?: GeneratedKeys,
  options?: TransactionOptions,
) => {
  let success = null;
  switch (creationType) {
    case AccountCreationType.BUYING: {
      success = await createPayingAccount(
        authorities,
        newUsername,
        parentUsername,
        parentActiveKey,
        price!,
        options,
      );
      break;
    }
    case AccountCreationType.USING_TICKET: {
      success = await createAccountUsingTicket(
        authorities,
        newUsername,
        parentUsername,
        parentActiveKey,
        options,
      );
      break;
    }
  }
  if (success && generatedKeys) {
    return {
      name: newUsername,
      keys: {
        active: generatedKeys.active.private,
        activePubkey: generatedKeys.active.public,
        posting: generatedKeys.posting.private,
        postingPubkey: generatedKeys.posting.public,
        memo: generatedKeys.memo.private,
        memoPubkey: generatedKeys.memo.public,
      },
    } as LocalAccount;
  } else {
    return false;
  }
};

const createAccountUsingTicket = (
  authorities: AccountAuthorities,
  newUsername: string,
  parentUsername: string,
  parentActiveKey: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [
      AccountCreationUtils.getCreateClaimedAccountOperation(
        authorities,
        newUsername,
        parentUsername,
      ),
    ],
    parentActiveKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const getCreateClaimedAccountOperation = (
  authorities: AccountAuthorities,
  newUsername: string,
  parentUsername: string,
) => {
  const extensions: any[] = [];
  return [
    'create_claimed_account',
    {
      creator: parentUsername,
      new_account_name: newUsername,
      json_metadata: '{}',
      extensions: extensions,
      ...authorities,
    },
  ] as CreateClaimedAccountOperation;
};
/* istanbul ignore next */
const getCreateClaimedAccountTransaction = (
  authorities: AccountAuthorities,
  newUsername: string,
  parentUsername: string,
) => {
  return HiveTxUtils.createTransaction([
    AccountCreationUtils.getCreateClaimedAccountOperation(
      authorities,
      newUsername,
      parentUsername,
    ),
  ]);
};

const createPayingAccount = (
  authorities: AccountAuthorities,
  newUsername: string,
  parentUsername: string,
  parentActiveKey: Key,
  price: number,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [
      [
        'account_create',
        {
          fee: `${price.toFixed(3)} HIVE`,
          creator: parentUsername,
          new_account_name: newUsername,
          json_metadata: '{}',
          ...authorities,
        },
      ] as AccountCreateOperation,
    ],
    parentActiveKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const generateAccountAuthorities = (
  keys: GeneratedKeys,
): AccountAuthorities => {
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
/* istanbul ignore next */
const setRecoveryAccountOperation = (
  accountName: string,
  newRecoveryAccount: string,
  ownerKey: string,
  options?: TransactionOptions,
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
    false,
    options,
  );
};

export const AccountCreationUtils = {
  checkAccountNameAvailable,
  generateMasterKey,
  validateUsername,
  createAccount,
  setRecoveryAccountOperation,
  generateAccountAuthorities,
  getCreateClaimedAccountOperation,
  getCreateClaimedAccountTransaction,
};

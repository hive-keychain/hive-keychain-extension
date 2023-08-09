import { Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const user1 = {
  name: userData.one.username,
  keys: {
    active: userData.one.nonEncryptKeys.active,
    activePubkey: `@${userData.one.username}`,
    posting: userData.one.nonEncryptKeys.posting,
    postingPubkey: `@${userData.one.username}`,
    memo: userData.one.nonEncryptKeys.memo,
    memoPubkey: `@${userData.one.username}`,
    owner: userData.one.nonEncryptKeys.owner,
    ownerPubkey: `@${userData.one.username}`,
  } as Keys,
} as LocalAccount;

const user2 = {
  name: userData.two.username,
  keys: userData.two.keys,
} as LocalAccount;

export const localAccounts = { user1, user2 };

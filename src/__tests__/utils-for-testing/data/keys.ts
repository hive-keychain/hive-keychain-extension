import { Keys } from '@interfaces/keys.interface';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const keysUser1 = {
  active: userData.one.nonEncryptKeys.active,
  activePubkey: `@${userData.one.username}`,
  posting: userData.one.nonEncryptKeys.posting,
  postingPubkey: `@${userData.one.username}`,
  memo: userData.one.nonEncryptKeys.memo,
  memoPubkey: `@${userData.one.username}`,
  owner: userData.one.nonEncryptKeys.owner,
  ownerPubkey: `@${userData.one.username}`,
} as Keys;

const keysUser2 = userData.two.keys;

export const keys = { keysUser1, keysUser2 };

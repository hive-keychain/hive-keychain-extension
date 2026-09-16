import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

/**
 * chrome.storage.local keys that name Hive accounts or EVM wallets/recipients.
 * Encrypted in place with mk when the wallet is unlocked.
 */
export const IDENTITY_STORAGE_KEYS: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
  LocalStorageKeyEnum.FAVORITE_USERS,
  LocalStorageKeyEnum.NO_CONFIRM,
  LocalStorageKeyEnum.CLAIM_REWARDS,
  LocalStorageKeyEnum.CLAIM_ACCOUNTS,
  LocalStorageKeyEnum.CLAIM_SAVINGS,
  LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE,
  LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS,
  LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
  LocalStorageKeyEnum.PROPOSAL_SKIPPED,
  LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY,
  LocalStorageKeyEnum.MULTISIG_CONFIG,
  LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY,
  LocalStorageKeyEnum.LAST_VESTING_ROUTES,
  LocalStorageKeyEnum.NO_KEY_CHECK,
  LocalStorageKeyEnum.SHORTCUTS,
  LocalStorageKeyEnum.ACCOUNT_SELECTOR_DISPLAY_ORDER,
  LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
  LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
  LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
  LocalStorageKeyEnum.EVM_ENS,
  LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
  LocalStorageKeyEnum.EVM_LIGHT_NODE_REGISTERED_ADDRESSES,
  LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
  LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
  LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
  LocalStorageKeyEnum.EVM_LIFI_SWAP_HISTORY,
  LocalStorageKeyEnum.EVM_DISCOVERED_TOKENS_CACHE,
  LocalStorageKeyEnum.EVM_DISCOVERED_NFTS_CACHE,
  LocalStorageKeyEnum.EVM_MANUAL_DISCOVERED_NFTS,
  LocalStorageKeyEnum.EVM_LAST_HASH,
];

const IDENTITY_STORAGE_KEY_SET = new Set<string>(IDENTITY_STORAGE_KEYS);

export const isIdentityStorageKey = (key: string): boolean =>
  IDENTITY_STORAGE_KEY_SET.has(key);

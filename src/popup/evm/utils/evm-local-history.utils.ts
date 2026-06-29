import {
  EvmLocalHistory,
  EvmUserHistory,
  EvmUserHistoryItem,
  EvmUsersHistory,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmTransactionDisplayUtils } from '@popup/evm/utils/evm-transaction-display.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { TransactionResponse } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
/** Max events per wallet per chain; oldest dropped after append. */
export const MAX_EVM_LOCAL_HISTORY_EVENTS = 150;

const emptyUserHistory = (): EvmUserHistory => ({
  events: [],
  nextCursor: null,
  fullyFetch: true,
});

const normalizeWalletKey = (walletAddress: string) =>
  walletAddress.toLowerCase();

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const parseStoredLocalHistory = (raw: unknown): EvmLocalHistory => {
  if (!isPlainObject(raw)) return {};
  const out: EvmLocalHistory = {};
  for (const [chainId, bucket] of Object.entries(raw)) {
    if (!isPlainObject(bucket)) continue;
    const users: EvmUsersHistory = {};
    for (const [addr, hist] of Object.entries(bucket)) {
      if (
        hist &&
        typeof hist === 'object' &&
        !Array.isArray(hist) &&
        Array.isArray((hist as EvmUserHistory).events)
      ) {
        users[addr] = hist as EvmUserHistory;
      }
    }
    if (Object.keys(users).length > 0) {
      out[chainId] = users;
    }
  }
  return out;
};

export const buildHistoryItemFromBroadcast = async (
  tx: TransactionResponse,
  chain: EvmChain,
  walletAddress: string,
): Promise<EvmUserHistoryItem> => {
  return EvmTransactionDisplayUtils.buildDisplayItemFromBroadcast(
    tx,
    chain,
    walletAddress,
  );
};

export const appendBroadcastRecord = async (
  chain: EvmChain,
  walletAddress: string,
  tx: TransactionResponse,
  displayItem?: EvmUserHistoryItem,
): Promise<void> => {
  if (!chain.isCustom) return;

  const walletKey = normalizeWalletKey(walletAddress);
  const raw = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
  );
  const storage = parseStoredLocalHistory(raw);

  const item =
    displayItem ??
    (await buildHistoryItemFromBroadcast(tx, chain, walletAddress));

  const chainId = chain.chainId;
  const forChain = { ...(storage[chainId] ?? {}) };
  const previous = forChain[walletKey] ?? emptyUserHistory();

  const hashLower = item.transactionHash.toLowerCase();
  const deduped = previous.events.filter(
    (e) => e.transactionHash.toLowerCase() !== hashLower,
  );

  const next: EvmUserHistory = {
    events: [item, ...deduped].slice(0, MAX_EVM_LOCAL_HISTORY_EVENTS),
    nextCursor: null,
    fullyFetch: true,
  };

  forChain[walletKey] = next;
  storage[chainId] = forChain;

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
    storage,
  );
};

export const getLocalUserHistoryForCustomChain = async (
  chainId: string,
  walletAddress: string,
): Promise<EvmUserHistory> => {
  const walletKey = normalizeWalletKey(walletAddress);
  const raw = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
  );
  const storage = parseStoredLocalHistory(raw);
  const bucket = storage[chainId];
  const slice = bucket?.[walletKey];
  if (!slice?.events?.length) {
    return emptyUserHistory();
  }
  return {
    events: slice.events,
    nextCursor: null,
    fullyFetch: true,
  };
};

export const EvmLocalHistoryUtils = {
  appendBroadcastRecord,
  getLocalUserHistoryForCustomChain,
  buildHistoryItemFromBroadcast,
  MAX_EVM_LOCAL_HISTORY_EVENTS,
};

import { EvmLightNodeApi } from '@api/evm-light-node';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

let previousChain: Chain;

let defaultChains: Chain[];
let defaultChainsPromise: Promise<Chain[]> | null = null;

const isStoredChainValid = (chain: Partial<Chain> | null | undefined) => {
  return (
    !!chain &&
    typeof chain.chainId === 'string' &&
    typeof chain.name === 'string' &&
    typeof chain.type === 'string'
  );
};

const isValidStoredChainList = (chains: unknown): chains is Chain[] => {
  return (
    Array.isArray(chains) &&
    chains.length > 0 &&
    chains.every(isStoredChainValid)
  );
};

const cloneChains = (chains: Chain[]) => {
  return JSON.parse(JSON.stringify(chains)) as Chain[];
};

const getBundledDefaultChains = (): Chain[] => {
  return cloneChains(defaultChainList as Chain[]);
};

const setPreviousChain = (chain: Chain) => {
  previousChain = chain;
};
const getPreviousChain = () => {
  return previousChain;
};

const setDefaultChains = (chains: Chain[]) => {
  defaultChains = chains;
};

const getDefaultChains = async (): Promise<Chain[]> => {
  if (!defaultChains) {
    return initChains();
  }
  return defaultChains;
};

const getAllSetupChainsForType = async <T>(type: ChainType): Promise<T[]> => {
  const chains = await getSetupChains();
  return chains.filter((c: Chain) => c.type === type) as unknown as T[];
};

const getSetupChains = async (forceBaseChains?: boolean): Promise<Chain[]> => {
  let chainIds: Chain['chainId'][] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SETUP_CHAINS,
    );
  if (!chainIds) chainIds = [];

  const chains = [
    ...(await getDefaultChains()),
    ...(await getCustomChains()),
  ].filter((c: Chain) => chainIds.includes(c.chainId));

  if (forceBaseChains) {
    if (!chains.some((c: Chain) => c.type === ChainType.HIVE)) {
      const defaultHiveChain = (await getDefaultChains()).find(
        (c) =>
          c.chainId ===
          'beeab0de00000000000000000000000000000000000000000000000000000000',
      );
      if (defaultHiveChain) {
        chains.push(defaultHiveChain);
      }
    }
    if (!chains.some((c: Chain) => c.type === ChainType.EVM)) {
      const defaultEvmChain = (await getDefaultChains()).find(
        (c) => c.chainId === '0x1',
      );
      if (defaultEvmChain) {
        chains.push(defaultEvmChain);
      }
    }
  }

  return chains;
};

const getChain = async <T>(chainId: Chain['chainId']): Promise<T> => {
  const chains = await getSetupChains();
  if (!chains) return null as unknown as T;
  return chains.find(
    (c: Chain) => c.chainId.toLowerCase() === chainId.toLowerCase(),
  )! as unknown as T;
};

const getChainFromDefaultChains = async <T>(
  chainId: Chain['chainId'],
): Promise<T> => {
  const chains = await getDefaultChains();
  return chains.find(
    (c: Chain) => c.chainId.toLowerCase() === chainId.toLowerCase(),
  )! as unknown as T;
};

const getNonSetupChains = async (): Promise<Chain[]> => {
  let [setupChains, allChains] = await Promise.all([
    getSetupChains(),
    getDefaultChains(),
  ]);

  if (!setupChains) setupChains = [];

  return allChains.filter(
    (chain: Chain) =>
      !(setupChains as Chain[]).map((c) => c.chainId).includes(chain.chainId),
  );
};

const addChainToSetupChains = async (chain: Chain) => {
  let chainIds = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  if (chainIds && chainIds.includes(chain.chainId)) return;
  if (!chainIds) chainIds = [];
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    [...chainIds, chain.chainId],
  );
};

const removeChainFromSetupChains = async (chain: Chain) => {
  const chainIds = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  const ids = Array.isArray(chainIds) ? chainIds : [];
  const normalized = chain.chainId.toLowerCase();
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    ids.filter(
      (chainId: Chain['chainId']) => chainId.toLowerCase() !== normalized,
    ),
  );
};

const isStoredEvmChain = (c: unknown): c is EvmChain => {
  if (!c || typeof c !== 'object') return false;
  const ch = c as Record<string, unknown>;
  return (
    ch.type === ChainType.EVM &&
    typeof ch.chainId === 'string' &&
    typeof ch.name === 'string' &&
    typeof ch.mainToken === 'string' &&
    typeof ch.defaultTransactionType === 'string' &&
    Array.isArray(ch.rpcs)
  );
};

const getCustomChains = async (): Promise<EvmChain[]> => {
  const stored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CUSTOM_CHAINS,
  );
  if (!Array.isArray(stored)) return [];
  return stored
    .filter(isStoredEvmChain)
    .map((c) => ({ ...c, isCustom: true } as EvmChain));
};

const enrichCustomChainWithNativeCoinId = async (
  chain: EvmChain,
  previousChain?: EvmChain,
): Promise<EvmChain> => {
  try {
    const nativeCoinId = await EvmLightNodeUtils.getCoingeckoNativeCoinId(
      chain.chainId,
    );
    if (nativeCoinId) {
      return { ...chain, nativeCoinId };
    }
  } catch (error) {
    Logger.warn('Error while fetching custom chain native CoinGecko id', error);
  }

  const preservedNativeCoinId =
    chain.nativeCoinId ?? previousChain?.nativeCoinId;
  return preservedNativeCoinId
    ? { ...chain, nativeCoinId: preservedNativeCoinId }
    : chain;
};

const addCustomChain = async (chain: EvmChain): Promise<void> => {
  const custom = await getCustomChains();
  const normalizedId = chain.chainId.toLowerCase();
  if (custom.some((c) => c.chainId.toLowerCase() === normalizedId)) {
    throw new Error('duplicate_custom_chain');
  }
  const defaults = await getDefaultChains();
  if (defaults.some((c) => c.chainId.toLowerCase() === normalizedId)) {
    throw new Error('chain_exists_in_defaults');
  }
  const enrichedChain = await enrichCustomChainWithNativeCoinId(chain);
  const toSave: EvmChain = { ...enrichedChain, isCustom: true };
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CUSTOM_CHAINS,
    [...custom, toSave],
  );
  await addChainToSetupChains(toSave);
};

const rekeyRecordByChainIdKey = <T>(
  record: Record<string, T> | null | undefined,
  oldId: string,
  newId: string,
): Record<string, T> | undefined => {
  if (record == null) return undefined;
  if (typeof record !== 'object' || Array.isArray(record)) return undefined;
  const oldLower = oldId.toLowerCase();
  const existingKey = Object.keys(record as object).find(
    (k) => k.toLowerCase() === oldLower,
  );
  if (!existingKey) return record;
  if (existingKey.toLowerCase() === newId.toLowerCase()) {
    return record;
  }
  const next: Record<string, T> = { ...(record as Record<string, T>) };
  const value = next[existingKey];
  delete next[existingKey];
  next[newId] = value;
  return next;
};

const migrateSetupChainIds = async (
  oldId: string,
  newId: string,
): Promise<void> => {
  const oldLower = oldId.toLowerCase();
  const chainIds = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  if (!Array.isArray(chainIds)) return;
  const replaced = chainIds.map((id: string) =>
    typeof id === 'string' && id.toLowerCase() === oldLower ? newId : id,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    replaced,
  );
};

const migrateEvmLastChainUsed = async (
  oldId: string,
  newId: string,
): Promise<void> => {
  const last = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
  );
  if (typeof last !== 'string') return;
  if (last.toLowerCase() !== oldId.toLowerCase()) return;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
    newId,
  );
};

const migrateActiveChainStoredId = async (
  oldId: string,
  newId: string,
): Promise<void> => {
  const active = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACTIVE_CHAIN,
  );
  if (typeof active !== 'string') return;
  if (active.toLowerCase() !== oldId.toLowerCase()) return;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACTIVE_CHAIN,
    newId,
  );
};

const migrateEvmOriginChainState = async (
  oldId: string,
  newId: string,
): Promise<void> => {
  const state = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
  );
  if (!state || typeof state !== 'object' || Array.isArray(state)) return;
  const oldLower = oldId.toLowerCase();
  let changed = false;
  const next: Record<string, string> = { ...(state as Record<string, string>) };
  for (const [origin, cid] of Object.entries(next)) {
    if (typeof cid === 'string' && cid.toLowerCase() === oldLower) {
      next[origin] = newId;
      changed = true;
    }
  }
  if (changed) {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
      next,
    );
  }
};

const migratePendingTransactionsChainIds = async (
  oldId: string,
  newId: string,
): Promise<void> => {
  const txs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
  );
  if (!Array.isArray(txs)) return;
  const oldLower = oldId.toLowerCase();
  const next = txs.map((tx: { chainId?: string }) => {
    if (
      tx &&
      typeof tx.chainId === 'string' &&
      tx.chainId.toLowerCase() === oldLower
    ) {
      return { ...tx, chainId: newId };
    }
    return tx;
  });
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    next,
  );
};

const STORAGE_RECORDS_KEYED_BY_CHAIN_ID: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.EVM_ACTIVE_RPCS,
  LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
  LocalStorageKeyEnum.EVM_SWITCH_RPC_AUTO,
  LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
  LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
  LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
  LocalStorageKeyEnum.EVM_MANUAL_DISCOVERED_NFTS,
  LocalStorageKeyEnum.EVM_LIGHT_NODE_REGISTERED_ADDRESSES,
  LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
  LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
  LocalStorageKeyEnum.EVM_LOCAL_HISTORY,
];

const DEFAULT_EVM_CHAIN_AFTER_CUSTOM_REMOVED = '0x1';

const removeChainIdFromKeyedRecord = (
  record: Record<string, unknown> | null | undefined,
  chainIdToRemove: string,
): Record<string, unknown> | undefined => {
  if (record == null || typeof record !== 'object' || Array.isArray(record)) {
    return undefined;
  }
  const removeLower = chainIdToRemove.toLowerCase();
  const existingKey = Object.keys(record).find(
    (k) => k.toLowerCase() === removeLower,
  );
  if (!existingKey) return undefined;
  const next = { ...(record as Record<string, unknown>) };
  delete next[existingKey];
  return next;
};

const clearEvmStorageForRemovedCustomChain = async (
  chainId: string,
): Promise<void> => {
  const oldLower = chainId.toLowerCase();

  for (const storageKey of STORAGE_RECORDS_KEYED_BY_CHAIN_ID) {
    const data = await LocalStorageUtils.getValueFromLocalStorage(storageKey);
    const cleaned = removeChainIdFromKeyedRecord(
      data as Record<string, unknown> | null | undefined,
      chainId,
    );
    if (cleaned !== undefined && cleaned !== data) {
      await LocalStorageUtils.saveValueInLocalStorage(storageKey, cleaned);
    }
  }

  const last = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
  );
  if (typeof last === 'string' && last.toLowerCase() === oldLower) {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
      DEFAULT_EVM_CHAIN_AFTER_CUSTOM_REMOVED,
    );
  }

  const active = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACTIVE_CHAIN,
  );
  if (typeof active === 'string' && active.toLowerCase() === oldLower) {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACTIVE_CHAIN,
      DEFAULT_EVM_CHAIN_AFTER_CUSTOM_REMOVED,
    );
  }

  const originState = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
  );
  if (
    originState &&
    typeof originState === 'object' &&
    !Array.isArray(originState)
  ) {
    const next: Record<string, string> = {
      ...(originState as Record<string, string>),
    };
    let changed = false;
    for (const [origin, cid] of Object.entries(next)) {
      if (typeof cid === 'string' && cid.toLowerCase() === oldLower) {
        delete next[origin];
        changed = true;
      }
    }
    if (changed) {
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
        next,
      );
    }
  }

  const txs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
  );
  if (Array.isArray(txs)) {
    const next = txs.filter(
      (tx: { chainId?: string }) =>
        !(
          tx &&
          typeof tx.chainId === 'string' &&
          tx.chainId.toLowerCase() === oldLower
        ),
    );
    if (next.length !== txs.length) {
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
        next,
      );
    }
  }
};

const removeCustomChain = async (chainId: string): Promise<void> => {
  const custom = await getCustomChains();
  const normalized = chainId.toLowerCase();
  const idx = custom.findIndex((c) => c.chainId.toLowerCase() === normalized);
  if (idx === -1) {
    throw new Error('custom_chain_not_found');
  }
  const removed = custom[idx];
  const next = custom.filter((_, i) => i !== idx);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CUSTOM_CHAINS,
    next,
  );
  await removeChainFromSetupChains(removed);
  await clearEvmStorageForRemovedCustomChain(removed.chainId);
};

const migrateEvmStorageKeysForChainIdChange = async (
  oldId: string,
  newId: string,
): Promise<void> => {
  if (oldId.toLowerCase() === newId.toLowerCase()) return;

  await migrateSetupChainIds(oldId, newId);
  await migrateEvmLastChainUsed(oldId, newId);
  await migrateActiveChainStoredId(oldId, newId);
  await migrateEvmOriginChainState(oldId, newId);
  await migratePendingTransactionsChainIds(oldId, newId);

  for (const storageKey of STORAGE_RECORDS_KEYED_BY_CHAIN_ID) {
    const data = await LocalStorageUtils.getValueFromLocalStorage(storageKey);
    const rekeyed = rekeyRecordByChainIdKey(
      data as Record<string, unknown> | null | undefined,
      oldId,
      newId,
    );
    if (rekeyed !== undefined && rekeyed !== data) {
      await LocalStorageUtils.saveValueInLocalStorage(storageKey, rekeyed);
    }
  }
};

const updateCustomChain = async (
  originalChainId: string,
  chain: EvmChain,
): Promise<void> => {
  const custom = await getCustomChains();
  const normalizedOrig = originalChainId.toLowerCase();
  const normalizedNew = chain.chainId.toLowerCase();
  const idx = custom.findIndex(
    (c) => c.chainId.toLowerCase() === normalizedOrig,
  );
  if (idx === -1) {
    throw new Error('custom_chain_not_found');
  }

  const previous = custom[idx];

  if (normalizedNew !== normalizedOrig) {
    if (
      custom.some(
        (c, i) => i !== idx && c.chainId.toLowerCase() === normalizedNew,
      )
    ) {
      throw new Error('duplicate_custom_chain');
    }
    const defaults = await getDefaultChains();
    if (defaults.some((c) => c.chainId.toLowerCase() === normalizedNew)) {
      throw new Error('chain_exists_in_defaults');
    }
    await migrateEvmStorageKeysForChainIdChange(previous.chainId, chain.chainId);
  }

  const enrichedChain = await enrichCustomChainWithNativeCoinId(chain, previous);
  const next = [...custom];
  next[idx] = { ...enrichedChain, isCustom: true };
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CUSTOM_CHAINS,
    next,
  );
};

const initChains = async (): Promise<Chain[]> => {
  if (defaultChains) return defaultChains;
  if (defaultChainsPromise) return defaultChainsPromise;

  defaultChainsPromise = (async () => {
    try {
      const apiChains = await EvmLightNodeApi.get('chains');
      const normalizedChains = cloneChains(apiChains as Chain[]);
      setDefaultChains(normalizedChains);
      try {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.DEFAULT_CHAINS,
          normalizedChains,
        );
      } catch (err) {
        Logger.error('Error while caching default chains', err);
      }
      Logger.info('Initialized chains from api');
      return normalizedChains;
    } catch (err) {
      Logger.error('Error while fetching chains from api', err);
    }

    const cachedChains = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
    );
    if (isValidStoredChainList(cachedChains)) {
      const normalizedChains = cloneChains(cachedChains);
      setDefaultChains(normalizedChains);
      Logger.info('Initialized chains from cache');
      return normalizedChains;
    }

    if (cachedChains) {
      Logger.warn(
        'Stored default chains are invalid or empty, using bundled defaults',
      );
    }

    const bundledChains = getBundledDefaultChains();
    setDefaultChains(bundledChains);
    Logger.info('Initialized chains from bundle');
    return bundledChains;
  })();

  try {
    return await defaultChainsPromise;
  } finally {
    defaultChainsPromise = null;
  }
};

export const ChainUtils = {
  getDefaultChains,
  getSetupChains,
  addChainToSetupChains,
  removeChainFromSetupChains,
  getNonSetupChains,
  getCustomChains,
  addCustomChain,
  updateCustomChain,
  removeCustomChain,
  getChain,
  setPreviousChain,
  getPreviousChain,
  getAllSetupChainsForType,
  getChainFromDefaultChains,
  initChains,
};

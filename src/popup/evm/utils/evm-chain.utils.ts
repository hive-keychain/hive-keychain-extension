import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { normalizeEvmChainId } from 'src/utils/evm-provider-value.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface EvmOriginChainState {
  [origin: string]: string;
}

const getLastEvmChainId = async () => {
  const lastEvmChain: string = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
  );
  return normalizeEvmChainId(lastEvmChain) ?? (await getEthChainId());
};

const getLastEvmChain = async () => {
  const lastChainId = await getLastEvmChainId();
  if (!lastChainId) {
    return getEthChain();
  }

  return ChainUtils.getChain<EvmChain>(lastChainId);
};

const getEthChainId = async () => {
  return normalizeEvmChainId((await getEthChain())?.chainId);
};

const getEthChain = async (): Promise<EvmChain> => {
  return (await ChainUtils.getDefaultChains()).find(
    (chain) => chain.name === 'Ethereum',
  ) as EvmChain;
};

const saveLastUsedChain = (chain: EvmChain) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
    normalizeEvmChainId(chain.chainId),
  );
};

const getOriginChainState = async (): Promise<EvmOriginChainState> => {
  const originChainState = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
  );

  if (!originChainState) return {};

  const normalizedOriginChainState: EvmOriginChainState = {};
  for (const [origin, chainId] of Object.entries(originChainState)) {
    const normalizedChainId = normalizeEvmChainId(chainId);
    if (!normalizedChainId) continue;

    normalizedOriginChainState[origin] = normalizedChainId;
  }

  return normalizedOriginChainState;
};

const getStoredChainIdForOrigin = async (
  origin: string,
): Promise<string | null> => {
  const originChainState = await getOriginChainState();
  return originChainState[origin] ?? null;
};

const getLastEvmChainIdForOrigin = async (origin?: string) => {
  if (origin) {
    const originChainId = await getStoredChainIdForOrigin(origin);
    if (originChainId) return originChainId;
  }

  return getLastEvmChainId();
};

const setChainIdForOrigin = async (origin: string, chainId: string) => {
  const normalizedChainId = normalizeEvmChainId(chainId);
  if (!normalizedChainId) return;

  const originChainState = await getOriginChainState();
  originChainState[origin] = normalizedChainId;

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
    originChainState,
  );
};

export const EvmChainUtils = {
  getLastEvmChainId,
  getLastEvmChainIdForOrigin,
  getStoredChainIdForOrigin,
  getEthChain,
  getEthChainId,
  getLastEvmChain,
  saveLastUsedChain,
  setChainIdForOrigin,
};

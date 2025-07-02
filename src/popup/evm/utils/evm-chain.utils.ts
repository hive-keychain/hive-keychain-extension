import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getLastEvmChainId = async () => {
  const lastEvmChain: string = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
  );
  return lastEvmChain ?? getEthChainId();
};

const getLastEvmChain = async () => {
  const lastChainId = await getLastEvmChainId();
  return ChainUtils.getChain(lastChainId);
};

const getEthChainId = () => {
  return getEthChain()?.chainId;
};

const getEthChain = (): EvmChain => {
  return ChainUtils.getDefaultChains().find(
    (chain) => chain.name === 'Ethereum',
  ) as EvmChain;
};

const saveLastUsedChain = (chain: EvmChain) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
    chain.chainId,
  );
};

export const EvmChainUtils = {
  getLastEvmChainId,
  getEthChain,
  getEthChainId,
  getLastEvmChain,
  saveLastUsedChain,
};

import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getLastEvmChain = async () => {
  const lastEvmChain: string = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
  );
  return (
    lastEvmChain ??
    `0x${Number(ChainUtils.getDefaultChains()[0].chainId).toString(16)}`
  );
};

export const EvmChainUtils = { getLastEvmChain };

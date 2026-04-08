import { EvmEventName } from '@interfaces/evm-provider.interface';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { sendEvmEventGlobal } from 'src/content-scripts/hive/web-interface/response.logic';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getLastEvmChainId = async () => {
  const lastEvmChain: string = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
  );
  return lastEvmChain ?? (await getEthChainId());
};

const getLastEvmChain = async () => {
  const lastChainId = await getLastEvmChainId();
  return ChainUtils.getChain<EvmChain>(lastChainId);
};

const getEthChainId = async () => {
  return (await getEthChain())?.chainId;
};

const getEthChain = async (): Promise<EvmChain> => {
  return (await ChainUtils.getDefaultChains()).find(
    (chain) => chain.name === 'Ethereum',
  ) as EvmChain;
};

const saveLastUsedChain = (chain: EvmChain) => {
  return LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_CHAIN_USED,
    chain.chainId,
  );
};

const setActiveEvmChain = async (
  chain: EvmChain,
  options?: { emitEvent?: boolean },
) => {
  const previousChainId = await getLastEvmChainId();

  await saveLastUsedChain(chain);
  await EvmRpcUtils.setActiveRpc(
    await EvmRpcUtils.getActiveRpc(chain),
    chain,
  );

  if (
    options?.emitEvent !== false &&
    previousChainId?.toLowerCase() !== chain.chainId.toLowerCase()
  ) {
    sendEvmEventGlobal(EvmEventName.CHAIN_CHANGED, chain.chainId);
  }
};

export const EvmChainUtils = {
  getLastEvmChainId,
  getEthChain,
  getEthChainId,
  getLastEvmChain,
  saveLastUsedChain,
  setActiveEvmChain,
};

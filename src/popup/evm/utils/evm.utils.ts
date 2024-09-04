import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';

const getByBlockNumber = async (blockNumber: number, hydrated: boolean) => {
  const activeChain = await EvmChainUtils.getLastEvmChain();
  const provider = await EthersUtils.getProvider(activeChain as EvmChain);
  return provider.getBlock(blockNumber, hydrated);
};

export const EvmUtils = {
  getByBlockNumber,
};

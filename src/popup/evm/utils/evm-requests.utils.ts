import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BlockTag } from 'ethers';

const instanciateProvider = async () => {
  const activeChain = await EvmChainUtils.getLastEvmChain();
  const provider = await EthersUtils.getProvider(activeChain as EvmChain);
  return provider;
};

const getBlock = async (blockTag: BlockTag, hydrated: boolean) => {
  const provider = await instanciateProvider();
  return provider.getBlock(blockTag, hydrated);
};

const getBlockNumber = async () => {
  const provider = await instanciateProvider();
  return provider.getBlockNumber();
};

const estimateGasFee = async () => {
  const activeChain = await EvmChainUtils.getLastEvmChain();
  return '222';
  //   return await GasFeeUtils.estimate(activeChain);
};

const getBalance = async (walletAddress: string, blockTag: BlockTag) => {
  const provider = await instanciateProvider();
  const balance = await provider.getBalance(walletAddress, blockTag);
  return `0x${Number(balance).toString(16)}`;
};

const getTransactionCountByBlock = async (
  blockTag: BlockTag,
  hydrated: boolean,
) => {
  const block = await getBlock(blockTag, hydrated);
  return `0x${Number(block?.transactions.length).toString(16)}`;
};

export const EvmRequestsUtils = {
  getBalance,
  getBlockNumber,
  getBlock,
  estimateGasFee,
  getTransactionCountByBlock,
};

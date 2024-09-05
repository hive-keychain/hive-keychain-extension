import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BlockTag } from 'ethers';

const instanciateProvider = async () => {
  const activeChain = await EvmChainUtils.getLastEvmChain();
  const provider = await EthersUtils.getProvider(activeChain as EvmChain);
  return provider;
};

const getByBlockNumber = async (blockNumber: number, hydrated: boolean) => {
  const provider = await instanciateProvider();
  return provider.getBlock(blockNumber, hydrated);
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

const getBalance = async (walletAddress: string, blockNumber: BlockTag) => {
  const provider = await instanciateProvider();
  const balance = await provider.getBalance(walletAddress, blockNumber);
  return Number(balance).toString(16);
};

export const EvmRequestsUtils = {
  getBalance,
  getBlockNumber,
  getByBlockNumber,
  estimateGasFee,
};

// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { KeychainApi } from '@api/keychain';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';

const discoverTokens = async (walletAddress: string, chain: EvmChain) => {
  return EvmTokensUtils.getCustomTokens(chain, walletAddress);
};

const getNftTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=get-nft-tx&address=${walletAddress}&chain=${chain.chainId}&page=${page}&offset=${offset}`,
  );
  return result ?? [];
};

const getInternalsTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=get-internals-tx&address=${walletAddress}&chain=${chain.chainId}&page=${page}&offset=${offset}`,
  );
  return result ?? [];
};

const getTokenTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=get-token-tx&address=${walletAddress}&chain=${chain.chainId}&page=${page}&offset=${offset}`,
  );
  return result ?? [];
};

const getHistory = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=get-history&address=${walletAddress}&chain=${chain.chainId}&page=${page}&offset=${offset}`,
  );
  return result ?? [];
};

const getAbi = async (chain: EvmChain, address: string) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=get-abi&address=${address}&chain=${chain.chainId}`,
  );
  return result ?? [];
};

const getPendingTransactions = async (chain: EvmChain, address: string) => {
  const result = await KeychainApi.get(
    `evm/smart-contracts-info/etherscan?function=pending-tx-list&address=${address}&chain=${chain.chainId}`,
  );
  return result ?? [];
};

export const EtherscanApi = {
  // getTokenTx,
  // getHistory,
  // getInternalsTx,
  // getAbi,
  // discoverTokens,
  // getNftTx,
  // getPendingTransactions,
};

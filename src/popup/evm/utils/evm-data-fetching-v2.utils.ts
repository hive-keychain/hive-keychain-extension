import { KeychainApi } from '@api/keychain';

const getDiscoveredTokens = async (
  chainId: string | number,
  address: string,
  isNew?: boolean,
): Promise<unknown> => {
  const suffix = isNew === undefined ? '' : `/${isNew}`;
  return KeychainApi.get(
    `evm/light-node/discovery/tokens/${chainId}/${encodeURIComponent(
      address,
    )}${suffix}`,
  );
};

const getDiscoveredNfts = async (
  chainId: string | number,
  address: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/discovery/nfts/${chainId}/${encodeURIComponent(address)}`,
  );
};

const getNftDetail = async (
  chainId: string | number,
  nftId: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/nft/detail/${chainId}/${encodeURIComponent(nftId)}`,
  );
};

const getHistory = async (
  chainId: string | number,
  address: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/history/${chainId}/${encodeURIComponent(address)}`,
  );
};

const getHistoryDetail = async (
  chainId: string | number,
  txId: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/history/detail/${chainId}/${encodeURIComponent(txId)}`,
  );
};

const getContract = async (
  chainId: string | number,
  contractAddress: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/contract/${chainId}/${encodeURIComponent(contractAddress)}`,
  );
};

const getGasFee = async (chainId: string | number): Promise<unknown> => {
  return KeychainApi.get(`evm/light-node/gas-fee/${chainId}`);
};

const getPrice = async (
  chainId: string | number,
  tokenAddress: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/price/${chainId}/${encodeURIComponent(tokenAddress)}`,
  );
};

export const EvmDataFetchingV2Utils = {
  getDiscoveredTokens,
  getDiscoveredNfts,
  getNftDetail,
  getHistory,
  getHistoryDetail,
  getContract,
  getGasFee,
  getPrice,
};

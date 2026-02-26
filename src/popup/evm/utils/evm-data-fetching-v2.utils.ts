import { KeychainApi } from '@api/keychain';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc721,
} from '@popup/evm/interfaces/evm-tokens.interface';

// Done
const getDiscoveredTokens = async (
  chainId: string | number,
  address: string,
  isNew?: boolean,
): Promise<EvmSmartContractInfo[]> => {
  const suffix = isNew === undefined ? '' : `/${isNew}`;
  const tokens: EvmSmartContractInfo[] = await KeychainApi.get(
    `evm/light-node/discovery/tokens/${chainId}/${encodeURIComponent(
      address,
    )}${suffix}`,
  );

  console.log('response', tokens);

  return tokens;
};

const getDiscoveredNfts = async (
  chainId: string | number,
  address: string,
): Promise<(EvmSmartContractInfoErc721 | EvmSmartContractInfoErc1155)[]> => {
  const nfts: (EvmSmartContractInfoErc721 | EvmSmartContractInfoErc1155)[] =
    await KeychainApi.get(
      `evm/light-node/discovery/nfts/${chainId}/${encodeURIComponent(address)}`,
    );
  console.log('response', nfts);
  return nfts;
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

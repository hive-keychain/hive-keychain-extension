import { BaseApi } from '@api/base';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Logger from 'src/utils/logger.utils';

const getErc20 = async (walletAddress: string, chain: EvmChain) => {
  return (
    await get(
      `${chain.blockExplorerApi?.url}/v1/chains/${Number(
        chain.chainId,
      )}/addresses/${walletAddress}/balances:listErc20`,
    )
  ).erc20TokenBalances;
};

const getErc721 = async (walletAddress: string, chain: EvmChain) => {
  return (
    await get(
      `${chain.blockExplorerApi?.url}/v1/chains/${Number(
        chain.chainId,
      )}/addresses/${walletAddress}/balances:listErc721`,
    )
  ).erc721TokenBalances.map((token: any) => ({
    ...token,
    type: EVMSmartContractType.ERC721,
    contractAddress: token.address.toLowerCase(),
  }));
};

const getErc1155 = async (walletAddress: string, chain: EvmChain) => {
  return (
    await get(
      `${chain.blockExplorerApi?.url}/v1/chains/${Number(
        chain.chainId,
      )}/addresses/${walletAddress}/balances:listErc1155`,
    )
  ).erc1155TokenBalances;
};

const discoverTokens = async (walletAddress: string, chain: EvmChain) => {
  const [resultListErc20, resultListErc721, resultListErc1155] =
    await Promise.all([
      getErc20(walletAddress, chain),
      getErc721(walletAddress, chain),
      getErc1155(walletAddress, chain),
    ]);

  let tokens: any[] = [];
  if (resultListErc20) {
    tokens = [
      ...tokens,
      ...resultListErc20.map((balance: any) => {
        return {
          contractAddress: balance.address,
          balance: balance.balance,
          decimals: balance.decimals,
          name: balance.name,
          symbol: balance.symbol,
          type: EVMSmartContractType.ERC20,
        };
      }),
    ];
  }
  if (resultListErc721) {
    tokens = [
      ...tokens,
      ...resultListErc721.map((balance: any) => {
        return {
          contractAddress: balance.address,
          balance: balance.balance,
          decimals: balance.decimals,
          name: balance.name,
          symbol: balance.symbol,
          type: EVMSmartContractType.ERC721,
          tokenId: balance.tokenId,
        };
      }),
    ];
  }
  if (resultListErc1155) {
    tokens = [
      ...tokens,
      ...resultListErc1155.map((balance: any) => {
        return {
          contractAddress: balance.address,
          balance: balance.balance,
          decimals: balance.decimals,
          name: balance.name,
          symbol: balance.symbol,
          type: EVMSmartContractType.ERC1155,
          tokenId: balance.tokenId,
        };
      }),
    ];
  }
  return tokens;
};

const getNftTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const [erc721Result, erc1155Result] = await Promise.all([
    (
      await get(
        `https://glacier-api.avax.network/v1/chains/${Number(
          chain.chainId,
        )}/addresses/${walletAddress}/transactions:listErc721?pageSize=100&sortOrder=desc`,
      )
    ).transactions,
    (
      await get(
        `https://glacier-api.avax.network/v1/chains/${Number(
          chain.chainId,
        )}/addresses/${walletAddress}/transactions:listErc1155?pageSize=100&sortOrder=desc`,
      )
    ).transactions,
  ]);

  return [...erc721Result, ...erc1155Result]
    .sort((a, b) => b.timeStamp - a.timeStamp)
    .map((tx: any) => {
      const token = tx.erc721Token ?? tx.erc1155Token;
      return {
        blockHash: tx.blockHash,
        blockNumber: tx.blockNumber,
        from: tx.from.address,
        gasPrice: tx.gasPrice,
        gasUsed: tx.gasUsed,
        hash: tx.txHash,
        timeStamp: tx.blockTimestamp,
        to: tx.to.address,
        txreceipt_status: tx.txStatus,
        value: tx.value,
        contractAddress: token.address,
        token: { ...token, type: token.ercType.replace('-', '') },
      };
    });
};

const getHistory = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const [nativeTx] = await Promise.all([
    getNativeTx(walletAddress, chain, page, offset),
  ]);

  const result = nativeTx.sort((a: any, b: any) => b.timeStamp - a.timeStamp);

  return result.map((tx: any) => {
    return {
      blockHash: tx.blockHash,
      blockNumber: tx.blockNumber,
      from: tx.from.address,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
      hash: tx.txHash,
      timeStamp: tx.blockTimestamp,
      to: tx.to.address,
      txreceipt_status: tx.txStatus,
      value: tx.value,
      method: tx.method?.callType,
    };
  });
};
// TODO add token for next page
const getNativeTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  return (
    await get(
      `https://glacier-api.avax.network/v1/chains/${Number(
        chain.chainId,
      )}/addresses/${walletAddress}/transactions:listNative?pageSize=100&sortOrder=desc`,
    )
  ).transactions;
};

const getTokenTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = (
    await get(
      `https://glacier-api.avax.network/v1/chains/${Number(
        chain.chainId,
      )}/addresses/${walletAddress}/transactions:listErc20?pageSize=100&sortOrder=desc`,
    )
  ).transactions;

  return result.map((tx: any) => {
    return {
      blockHash: tx.blockHash,
      blockNumber: tx.blockNumber,
      from: tx.from.address,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
      hash: tx.txHash,
      timeStamp: tx.blockTimestamp,
      to: tx.to.address,
      txreceipt_status: tx.txStatus,
      value: tx.value,
      token: { ...tx.erc20Token, type: EVMSmartContractType.ERC20 },
    };
  });
};
const getInternalsTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  return [];
};

const getAbi = async (chain: EvmChain, address: string) => {
  return {};
};

const get = async (url: string): Promise<any> => {
  try {
    return await BaseApi.get(url);
  } catch (err) {
    Logger.error(err);
    return null;
  }
};

const getPendingTransactions = async (chain: EvmChain, address: string) => {
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=pendingtxlist&address=${address}&page=1&offset=50`,
  );
  return result;
};

export const AvalancheApi = {
  discoverTokens,
  getNftTx,
  getHistory,
  getTokenTx,
  getAbi,
  getInternalsTx,
  getPendingTransactions,
  getErc20,
  getErc721,
  getErc1155,
};

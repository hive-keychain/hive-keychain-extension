import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import {
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmTokenInfoShort,
  EvmTokenInfoShortErc721,
  EVMTokenType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import {
  AbiList,
  ERC1155Abi,
  Erc20Abi,
  ERC721Abi,
} from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import {
  BlockExporerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import { AsyncUtils } from 'src/utils/async.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getTotalBalanceInUsd = (
  tokens: NativeAndErc20Token[],
  prices: EvmPrices,
) => {
  return tokens.reduce((a, b) => {
    const price = prices[b.tokenInfo.symbol] ?? 0;
    return (
      a +
      price.usd *
        Number(
          ethers.formatUnits(
            b.balance,
            b.tokenInfo.type === EVMTokenType.ERC20 ? b.tokenInfo.decimals : 18,
          ),
        )
    );
  }, 0);
};

const getTotalBalanceInMainToken = (
  tokens: NativeAndErc20Token[],
  chain: EvmChain,
  prices: EvmPrices,
) => {
  const mainToken = tokens.find(
    (token) =>
      token.tokenInfo.symbol.toLowerCase() === chain.mainToken.toLowerCase(),
  );
  if (mainToken) {
    const valueInUsd = getTotalBalanceInUsd(tokens, prices) || 0;
    return valueInUsd / (prices[mainToken.tokenInfo.symbol]?.usd ?? 1);
  } else return 0;
};

const getTokenBalances = async (
  walletAddress: string,
  chain: EvmChain,
  tokensMetadata: EvmTokenInfoShort[],
) => {
  if (
    !tokensMetadata.some(
      (tokenMetadata) => tokenMetadata.type === EVMTokenType.NATIVE,
    )
  ) {
    const mainTokenMetadata = {
      type: EVMTokenType.NATIVE,
      name: chain.mainToken,
      symbol: chain.mainToken,
      chainId: chain.chainId,
      logo: chain.logo,
      backgroundColor: '',
      coingeckoId: '',
    } as EvmTokenInfoShort;
    tokensMetadata.push(mainTokenMetadata);
  }
  const balances: Promise<NativeAndErc20Token | undefined>[] = tokensMetadata
    .filter(
      (token) => token.type === EVMTokenType.NATIVE || !token.possibleSpam,
    )
    .map(async (token) => getTokenBalance(walletAddress, chain, token));

  const result = (await Promise.all(balances)).filter((balance) => !!balance);
  return result;
};

const getTokenBalance = async (
  walletAddress: string,
  chain: EvmChain,
  token: EvmTokenInfoShort,
) => {
  const provider = EthersUtils.getProvider(chain);
  try {
    let formattedBalance;
    let balance;
    let balanceInteger;
    let collection;

    switch (token.type) {
      case EVMTokenType.NATIVE: {
        balance = await provider.getBalance(walletAddress);
        formattedBalance = FormatUtils.withCommas(
          Number(parseFloat(ethers.formatEther(balance))),
          8,
          true,
        );
        balanceInteger = Number(parseFloat(ethers.formatEther(balance)));
        break;
      }

      case EVMTokenType.ERC20: {
        const contract = new ethers.Contract(
          token.address!,
          Erc20Abi,
          provider,
        );
        balance = await contract.balanceOf(walletAddress);
        formattedBalance = FormatUtils.withCommas(
          Number(parseFloat(ethers.formatUnits(balance, token.decimals))),
          token.decimals,
          true,
        );
        balanceInteger = Number(
          parseFloat(ethers.formatUnits(balance, token.decimals)),
        );

        break;
      }
      case EVMTokenType.ERC721: {
        const contract = new ethers.Contract(
          token.address!,
          ERC721Abi,
          provider,
        );
        balance = await contract.balanceOf(walletAddress);
        formattedBalance = FormatUtils.withCommas(
          Number(parseFloat(ethers.formatUnits(balance, token.decimals))),
          token.decimals,
          true,
        );
        balanceInteger = Number(
          parseFloat(ethers.formatUnits(balance, token.decimals)),
        );
        break;
      }
      case EVMTokenType.ERC1155: {
        const contract = new ethers.Contract(
          token.address!,
          ERC1155Abi,
          provider,
        );
        balance = await contract.balanceOf(walletAddress);
        formattedBalance = FormatUtils.withCommas(
          Number(parseFloat(ethers.formatUnits(balance, token.decimals))),
          token.decimals,
          true,
        );
        balanceInteger = Number(
          parseFloat(ethers.formatUnits(balance, token.decimals)),
        );
        break;
      }
    }

    return {
      tokenInfo: token,
      formattedBalance: formattedBalance,
      balance: balance,
      balanceInteger: balanceInteger,
    };
  } catch (err) {
    Logger.error('Error while formatting evm balances', err);
  }
};

const getErc721Tokens = async (
  walletAddress: string,
  chain: EvmChain,
  tokens: EvmTokenInfoShort[],
) => {
  const LIMIT = 1000;
  let finalTransactions: any[] = [];
  let transactions: any[] = [];
  do {
    transactions = await EtherscanApi.getErc721TokenTransactions(
      walletAddress,
      chain,
      1,
      LIMIT,
    );
    finalTransactions = [...finalTransactions, ...transactions];
  } while (transactions.length === LIMIT);

  const idsPerCollection: any = {};

  for (const token of tokens) {
    if (!idsPerCollection[token.address.toLowerCase()]) {
      idsPerCollection[token.address.toLowerCase()] = [];
    }
  }

  for (const tx of finalTransactions) {
    if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
      idsPerCollection[tx.contractAddress.toLowerCase()].push(tx.tokenID);
    } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
      idsPerCollection[tx.contractAddress.toLowerCase()] = idsPerCollection[
        tx.contractAddress
      ].filter((id: string) => id !== tx.tokenID);
    }
  }

  let erc721tokens: EvmErc721Token[] = [];
  for (const contractAddress of Object.keys(idsPerCollection)) {
    const token = tokens.find((token) => token.address === contractAddress);
    const provider = EthersUtils.getProvider(chain);
    const contract = new ethers.Contract(token!.address!, ERC721Abi, provider);
    const collection: EvmErc721TokenCollectionItem[] = [];
    for (const tokenId of idsPerCollection[contractAddress]) {
      const metadata = await EvmNFTUtils.getMetadataFromURI(
        await contract.tokenURI(tokenId),
      );
      collection.push({
        id: tokenId,
        metadata: metadata,
      });
    }
    erc721tokens.push({
      tokenInfo: token as EvmTokenInfoShortErc721,
      collection: collection,
    });
  }

  return erc721tokens;
};

const discoverTokens = async (
  walletAddress: string,
  chain: EvmChain,
): Promise<EvmTokenInfoShort[]> => {
  let allSavedMetadata = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
  );

  if (!allSavedMetadata) allSavedMetadata = {};

  let chainTokenMetaData =
    allSavedMetadata && allSavedMetadata[chain.chainId]
      ? allSavedMetadata[chain.chainId]
      : [];

  const addresses: string[] = [];

  let addressesToFetch: string[] = [];

  switch (chain.blockExplorerApi?.type) {
    case BlockExporerType.ETHERSCAN: {
      const discoveredTokens = await EtherscanApi.discoverTokens(
        walletAddress,
        chain,
      );

      for (const token of discoveredTokens) {
        if (
          !addresses.includes(token.contractAddress) &&
          !!token.contractAddress
        ) {
          addresses.push(token.contractAddress);
        }
      }
      break;
    }
    default:
      return [];
  }

  for (const address of addresses) {
    if (!chainTokenMetaData.find((stm: any) => stm.address)) {
      addressesToFetch.push(address);
    }
  }
  if (addressesToFetch.length === 0) {
    return allSavedMetadata[chain.chainId];
  }
  const tokensMetadata = await KeychainApi.get(
    `evm/tokensInfoShort/${chain.chainId}/${addressesToFetch?.join(',')}`,
  );

  const newMetadata = [...chainTokenMetaData, ...tokensMetadata];
  allSavedMetadata[chain.chainId] = newMetadata;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
    allSavedMetadata,
  );

  return newMetadata;
};

const getTokenListForWalletAddress = async (
  walletAddress: string,
  chain: EvmChain,
): Promise<EvmTokenInfoShort[]> => {
  switch (chain.blockExplorerApi?.type) {
    case BlockExporerType.ETHERSCAN: {
      let result;
      let addresses: string[] = [];

      const limit = 10000;
      let offset = 0;

      do {
        let response = await EtherscanApi.getTokenTx(
          walletAddress,
          chain,
          offset,
        );
        result = response.result;
        for (const token of result) {
          if (
            !addresses.includes(token.contractAddress) &&
            !!token.contractAddress
          ) {
            addresses.push(token.contractAddress);
          }
        }
        await AsyncUtils.sleep(1000);
      } while (result.length === limit);

      let tokensMetadata = [];
      try {
        tokensMetadata = await KeychainApi.get(
          `evm/tokensInfoShort/${chain.chainId}/${addresses?.join(',')}`,
        );
      } catch (err) {
        Logger.error('Error while fetching tokens metadata', err);
        tokensMetadata =
          (
            await LocalStorageUtils.getValueFromLocalStorage(
              LocalStorageKeyEnum.EVM_TOKENS_METADATA,
            )
          )[chain.chainId] ?? [];
      }

      return tokensMetadata;
    }
    default:
      return [];
  }
};

const getTokenInfo = async (
  chainId: EvmChain['chainId'],
  address?: string,
): Promise<EvmTokenInfoShort> => {
  const tokensMetadataPerChain =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_TOKENS_METADATA,
    );

  let tokenMetaData = tokensMetadataPerChain[chainId];
  let token;
  if (!tokenMetaData) {
    tokenMetaData = await KeychainApi.get(
      `evm/tokensInfoShort/${chainId}/${[address?.toLowerCase()].join(',')}`,
    );
  }
  if (tokenMetaData) {
    if (address) {
      token = tokenMetaData.find(
        (t: EvmTokenInfoShort) =>
          t.address?.toLowerCase() === address.toLowerCase(),
      );
    } else {
      token = tokenMetaData.find(
        (t: EvmTokenInfoShort) => !t.address.toLowerCase(),
      );
    }
  }
  return token;
};

const sortTokens = (tokens: NativeAndErc20Token[], prices: EvmPrices) => {
  return tokens.sort((tokenA, tokenB) => {
    const priceA = prices[tokenA.tokenInfo.symbol] ?? 0;
    const priceB = prices[tokenB.tokenInfo.symbol] ?? 0;
    if (tokenA.tokenInfo.type === EVMTokenType.NATIVE) return -1;
    else if (tokenB.tokenInfo.type === EVMTokenType.NATIVE) return 1;
    else {
      const tokenAPrice =
        priceA.usd *
        Number(ethers.formatUnits(tokenA.balance, tokenA.tokenInfo.decimals));
      const tokenBPrice =
        priceB.usd *
        Number(ethers.formatUnits(tokenB.balance, tokenB.tokenInfo.decimals));
      return tokenBPrice - tokenAPrice;
    }
  });
};

const formatTokenValue = (value: number, decimals = 18) => {
  return FormatUtils.withCommas(
    ethers.formatUnits(value, decimals),
    decimals,
    true,
  );
};
const formatEtherValue = (value: string) => {
  return FormatUtils.withCommas(ethers.formatEther(value), 18, true);
};

const getMainTokenInfo = async (chain: EvmChain) => {
  const tokens = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
  );
  if (tokens && tokens[chain.chainId]) {
    return tokens[chain.chainId].find(
      (t: EvmTokenInfoShort) =>
        t.symbol.toLowerCase() === chain.mainToken.toLowerCase(),
    );
  }
};

const displayValue = (value: number, tokenInfo: EvmTokenInfoShort) => {
  const decimals =
    tokenInfo.type === EVMTokenType.NATIVE ? 18 : tokenInfo.decimals;
  return FormatUtils.withCommas(value, decimals, true);
};

const getTokenType = (abi: any) => {
  const parsedAbi = JSON.parse(abi);
  const abiMethods = parsedAbi.map((abiFunctions: any) => abiFunctions.name);

  for (const referenceAbi of AbiList) {
    if (
      referenceAbi.methods.every((method: string) =>
        abiMethods.includes(method),
      )
    )
      return referenceAbi.type;
  }

  return null;
};

export const EvmTokensUtils = {
  getTotalBalanceInMainToken,
  getTotalBalanceInUsd,
  getTokenBalances,
  getTokenBalance,
  sortTokens,
  formatTokenValue,
  formatEtherValue,
  getMainTokenInfo,
  displayValue,
  getTokenInfo,
  getTokenType,
  discoverTokens,
  getErc721Tokens,
};

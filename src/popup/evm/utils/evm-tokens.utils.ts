import { AvalancheApi } from '@popup/evm/api/avalanche.api';
import { BlockscoutApi } from '@popup/evm/api/blockscout.api';
import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import {
  EvmErc1155Token,
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmCustomToken,
  EvmSavedCustomTokens,
} from '@popup/evm/interfaces/evm-custom-tokens.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EvmSmartContractInfoNative,
  EvmSmartContractNonNativeBase,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import {
  AbiList,
  ERC1155Abi,
  Erc20Abi,
  ERC721Abi,
} from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import {
  BlockExplorerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getTotalBalanceInUsd = (
  tokens: NativeAndErc20Token[],
  prices: EvmPrices,
) => {
  return tokens.reduce((a, b) => {
    const price = prices[b.tokenInfo.symbol.toLowerCase()] ?? 0;
    return (
      a +
      price.usd *
        Number(
          ethers.formatUnits(
            b.balance,
            b.tokenInfo.type === EVMSmartContractType.ERC20
              ? b.tokenInfo.decimals
              : 18,
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
  tokensMetadata: EvmSmartContractInfo[],
) => {
  const balancesPromises: Promise<NativeAndErc20Token | undefined>[] =
    tokensMetadata.map(async (token) =>
      getTokenBalance(walletAddress, chain, token),
    );

  const result = await Promise.all(balancesPromises);
  console.log(result, 'result balances');
  return result.filter(
    (balance) =>
      !!balance &&
      (balance.balance > 0 ||
        balance.tokenInfo.type === EVMSmartContractType.NATIVE),
  );
};

const filterTokensBasedOnSettings = async (
  tokens: (NativeAndErc20Token | EvmErc721Token | EvmErc1155Token)[],
) => {
  const evmSettings = await EvmSettingsUtils.getSettings();

  return tokens.filter((token) => {
    if (token.tokenInfo.type !== EVMSmartContractType.NATIVE) {
      if (
        !evmSettings.smartContracts.displayNonVerifiedContracts &&
        !token.tokenInfo.verifiedContract
      )
        return false;

      if (
        !evmSettings.smartContracts.displayPossibleSpam &&
        token.tokenInfo.possibleSpam
      )
        return false;
    }
    return true;
  });
};

const getTokenBalance = async (
  walletAddress: string,
  chain: EvmChain,
  token: EvmSmartContractInfo,
) => {
  const provider = await EthersUtils.getProvider(chain);
  try {
    let formattedBalance;
    let balance;
    let balanceInteger;
    let tokenInfo;
    switch (token.type) {
      case EVMSmartContractType.NATIVE: {
        balance = await provider.getBalance(walletAddress);
        formattedBalance = FormatUtils.withCommas(
          Number(parseFloat(ethers.formatEther(balance))),
          8,
          true,
        );
        balanceInteger = Number(parseFloat(ethers.formatEther(balance)));
        tokenInfo = token as EvmSmartContractInfoNative;
        break;
      }

      case EVMSmartContractType.ERC20: {
        const contract = new ethers.Contract(
          (token as EvmSmartContractInfoErc20).contractAddress,
          Erc20Abi,
          provider,
        );
        balance = await contract.balanceOf(walletAddress);
        formattedBalance = FormatUtils.withCommas(
          Number(
            parseFloat(
              ethers.formatUnits(
                balance,
                (token as EvmSmartContractInfoErc20).decimals,
              ),
            ),
          ),
          (token as EvmSmartContractInfoErc20).decimals,
          true,
        );
        balanceInteger = Number(
          parseFloat(
            ethers.formatUnits(
              balance,
              (token as EvmSmartContractInfoErc20).decimals,
            ),
          ),
        );
        tokenInfo = token as EvmSmartContractInfoErc20;
        break;
      }

      default:
        console.log(token, 'token in default');
        return undefined;
    }

    return {
      tokenInfo: tokenInfo,
      formattedBalance: formattedBalance,
      balance: balance,
      balanceInteger: balanceInteger,
    };
  } catch (err) {
    console.log(token);
    Logger.error('Error while formatting evm balances', err);
  }
};

const getErc721Tokens = async (
  walletAddress: string,
  chain: EvmChain,
  tokens: EvmSmartContractInfoErc721[],
) => {
  console.log({ tokens }, 'in getErc721Tokens');
  const LIMIT = 1000;
  let finalTransactions: any[] = [];
  let transactions: any[] = [];
  const idsPerCollection: any = {};

  switch (chain.blockExplorerApi?.type) {
    case BlockExplorerType.BLOCKSCOUT: {
      do {
        transactions = await BlockscoutApi.getNftTx(
          walletAddress,
          chain,
          1,
          LIMIT,
        );

        finalTransactions = [...finalTransactions, ...transactions];
      } while (transactions.length === LIMIT);

      for (const token of tokens) {
        if (!idsPerCollection[token.contractAddress.toLowerCase()]) {
          idsPerCollection[token.contractAddress.toLowerCase()] = [];
        }
      }

      for (const tx of finalTransactions) {
        if (
          !tokens
            .map((token) => token.contractAddress.toLowerCase())
            .includes(tx.contractAddress)
        )
          continue;

        if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
          idsPerCollection[tx.contractAddress.toLowerCase()].push(tx.tokenID);
        } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
          idsPerCollection[tx.contractAddress.toLowerCase()] = idsPerCollection[
            tx.contractAddress
          ].filter((id: string) => id !== tx.tokenID);
        }
      }

      break;
    }

    case BlockExplorerType.ETHERSCAN: {
      do {
        transactions = await EtherscanApi.getNftTx(
          walletAddress,
          chain,
          1,
          LIMIT,
        );

        finalTransactions = [...finalTransactions, ...transactions];
      } while (transactions.length === LIMIT);

      for (const token of tokens) {
        if (!idsPerCollection[token.contractAddress.toLowerCase()]) {
          idsPerCollection[token.contractAddress.toLowerCase()] = [];
        }
      }

      for (const tx of finalTransactions) {
        if (
          !tokens
            .map((token) => token.contractAddress.toLowerCase())
            .includes(tx.contractAddress)
        )
          continue;

        if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
          idsPerCollection[tx.contractAddress.toLowerCase()].push(tx.tokenID);
        } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
          idsPerCollection[tx.contractAddress.toLowerCase()] = idsPerCollection[
            tx.contractAddress
          ].filter((id: string) => id !== tx.tokenID);
        }
      }

      break;
    }

    case BlockExplorerType.AVALANCHE_SCAN: {
      const result = await AvalancheApi.getErc721(walletAddress, chain);
      for (const token of result) {
        idsPerCollection[token.address.toLowerCase()] = [token.tokenId];
      }
      break;
    }
    default:
      break;
  }

  let erc721tokens: EvmErc721Token[] = [];
  for (const contractAddress of Object.keys(idsPerCollection)) {
    const token = tokens.find(
      (token) => token.contractAddress === contractAddress,
    );
    const provider = await EthersUtils.getProvider(chain);
    const contract = new ethers.Contract(
      token!.contractAddress!,
      ERC721Abi,
      provider,
    );

    const collectionPromises: Promise<EvmErc721TokenCollectionItem>[] = [];

    for (const tokenId of idsPerCollection[contractAddress]) {
      collectionPromises.push(
        EvmNFTUtils.getMetadataFromTokenId(
          EVMSmartContractType.ERC721,
          tokenId,
          contract,
        ),
      );
    }

    erc721tokens.push({
      tokenInfo: token as EvmSmartContractInfoErc721,
      collection: await Promise.all(collectionPromises),
    });
  }

  return erc721tokens;
};
const getErc1155Tokens = async (
  allTokens: any[],
  tokenInfos: EvmSmartContractInfoErc1155[],
  chain: EvmChain,
): Promise<EvmErc1155Token[]> => {
  const erc1155Tokens: EvmErc1155Token[] = [];

  for (const tokenInfo of tokenInfos) {
    const tokens = allTokens.filter(
      (token) => token.contractAddress === tokenInfo.contractAddress,
    );
    const erc1155Token: EvmErc1155Token = {
      tokenInfo: tokenInfo,
      collection: [],
    };
    for (const token of tokens) {
      const provider = await EthersUtils.getProvider(chain);
      const contract = new ethers.Contract(
        tokenInfo.contractAddress,
        ERC1155Abi,
        provider,
      );

      erc1155Token.collection.push(
        (await EvmNFTUtils.getMetadataFromTokenId(
          EVMSmartContractType.ERC1155,
          token.id,
          contract,
          Number(token.balance),
        )) as EvmErc1155TokenCollectionItem,
      );
    }
    erc1155Tokens.push(erc1155Token);
  }
  return erc1155Tokens;
};

const discoverTokens = async (walletAddress: string, chain: EvmChain) => {
  switch (chain.blockExplorerApi?.type) {
    case BlockExplorerType.BLOCKSCOUT:
      return await BlockscoutApi.discoverTokens(walletAddress, chain);
    case BlockExplorerType.AVALANCHE_SCAN:
      return await AvalancheApi.discoverTokens(walletAddress, chain);
    case BlockExplorerType.ETHERSCAN:
      return await EtherscanApi.discoverTokens(walletAddress, chain);
    default:
      return [];
  }
};

const manualDiscoverErc20Tokens = async (
  walletAddress: string,
  chain: EvmChain,
) => {
  if (chain.manualDiscoverAvailable) {
    const tokens = await KeychainApi.get(
      `evm/${chain.chainId}/wallet/${walletAddress}/discover-tokens-erc20`,
    );

    // Save discovery to local storage
    if (tokens) {
      addCustomToken(
        chain,
        walletAddress,
        tokens.map((t: any) => ({ address: t.address, type: t.type })),
      );
    }

    return tokens;
  } else return [];
};
const manualDiscoverNfts = async (walletAddress: string, chain: EvmChain) => {
  if (chain.manualDiscoverAvailable) {
    return await KeychainApi.get(
      `evm/${chain.chainId}/wallet/${walletAddress}/discover-tokens-nfts`,
    );
  } else return [];
};

const getTokensFullDetails = async (
  discoveredTokens: any[],
  chain: EvmChain,
): Promise<EvmSmartContractInfo[]> => {
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

  for (const token of discoveredTokens) {
    if (!addresses.includes(token.contractAddress) && !!token.contractAddress) {
      addresses.push(token.contractAddress);
    }
  }
  for (const address of addresses) {
    if (
      !chainTokenMetaData.find(
        (ctm: any) =>
          ctm.contractAddress &&
          ctm.contractAddress.toLowerCase() === address.toLowerCase(),
      )
    ) {
      addressesToFetch.push(address);
    }
  }
  let tokensMetadata: any = [];
  tokensMetadata = await getMetadataFromBackend(addressesToFetch, chain);

  const missingMetadataAddresses = addressesToFetch.filter(
    (address) =>
      !tokensMetadata.map((t: any) => t.contractAddress).includes(address),
  );

  const missingMetadata = discoveredTokens.filter((t) =>
    missingMetadataAddresses.includes(t.contractAddress),
  );

  const newMetadata = [
    ...chainTokenMetaData.filter(
      (t: any) => t.type !== EVMSmartContractType.NATIVE,
    ),
    ...tokensMetadata,
    ...missingMetadata,
  ];
  if (!newMetadata.find((m) => m.type === EVMSmartContractType.NATIVE)) {
    const mainTokenMetadata = {
      type: EVMSmartContractType.NATIVE,
      name: chain.mainToken,
      symbol: chain.mainToken,
      chainId: chain.chainId,
      logo: chain.logo,
      backgroundColor: '',
      coingeckoId: '',
    } as EvmSmartContractInfo;
    newMetadata.push(mainTokenMetadata);
  }
  allSavedMetadata[chain.chainId] = newMetadata;

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
    allSavedMetadata,
  );

  return newMetadata;
};

// const getTokenListForWalletAddress = async (
//   walletAddress: string,
//   chain: EvmChain,
// ): Promise<EvmSmartContractInfo[]> => {
//   switch (chain.blockExplorerApi?.type) {
//     case BlockExplorerType.BLOCKSCOUT: {
//       let result;
//       let addresses: string[] = [];

//       const limit = 10000;
//       let offset = 0;

//       do {
//         let response = await BlockscoutApi.getTokenTx(
//           walletAddress,
//           chain,
//           0,
//           offset,
//         );
//         result = response.result;
//         for (const token of result) {
//           if (
//             !addresses.includes(token.contractAddress) &&
//             !!token.contractAddress
//           ) {
//             addresses.push(token.contractAddress);
//           }
//         }
//         await AsyncUtils.sleep(1000);
//       } while (result.length === limit);

//       let tokensMetadata = [];
//       try {
//         tokensMetadata = await getMetadataFromBackend(addresses, chain);
//       } catch (err) {
//         Logger.error('Error while fetching tokens metadata', err);
//         tokensMetadata =
//           (
//             await LocalStorageUtils.getValueFromLocalStorage(
//               LocalStorageKeyEnum.EVM_TOKENS_METADATA,
//             )
//           )[chain.chainId] ?? [];
//       }

//       return tokensMetadata;
//     }
//     default:
//       return [];
//   }
// };

const getMetadataFromBackend = async (
  addresses: string[],
  chain: EvmChain,
): Promise<EvmSmartContractInfo[] | null> => {
  try {
    const result = await KeychainApi.get(
      `evm/smart-contracts-info/${chain.chainId}?addresses=${addresses?.join(
        ',',
      )}`,
    );
    return result;
  } catch (err) {
    Logger.error('Error while fetching metadata', err);
    return [];
  }
};

const getTokenInfo = async (
  chainId: EvmChain['chainId'],
  address?: string,
): Promise<EvmSmartContractInfo> => {
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
        (t: EvmSmartContractNonNativeBase) =>
          t.contractAddress?.toLowerCase() === address.toLowerCase(),
      );
    } else {
      token = tokenMetaData.find(
        (t: EvmSmartContractInfoNative) =>
          t.type === EVMSmartContractType.NATIVE,
      );
    }
  }
  return token;
};

const sortTokens = (tokens: NativeAndErc20Token[], prices: EvmPrices) => {
  return tokens.sort((tokenA, tokenB) => {
    const priceA = prices[tokenA.tokenInfo.symbol] ?? 0;
    const priceB = prices[tokenB.tokenInfo.symbol] ?? 0;
    if (tokenA.tokenInfo.type === EVMSmartContractType.NATIVE) return -1;
    else if (tokenB.tokenInfo.type === EVMSmartContractType.NATIVE) return 1;
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
      (t: EvmSmartContractInfo) => t.type === EVMSmartContractType.NATIVE,
    );
  }
};

const displayValue = (value: number, tokenInfo: EvmSmartContractInfo) => {
  let decimals;

  switch (tokenInfo.type) {
    case EVMSmartContractType.NATIVE:
      decimals = 18;
    case EVMSmartContractType.ERC20:
      decimals = (tokenInfo as EvmSmartContractInfoErc20).decimals;
    case EVMSmartContractType.ERC721:
    case EVMSmartContractType.ERC721Enumerable:
    case EVMSmartContractType.ERC1155: {
      decimals = 0;
    }
  }

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

const getMetadataFromStorage = async (
  chain: EvmChain,
): Promise<EvmSmartContractInfo[]> => {
  const allChainsMetadata = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
  );

  if (allChainsMetadata) {
    return allChainsMetadata[chain.chainId];
  } else return [] as EvmSmartContractInfo[];
};

const getPopularTokensForChain = async (chain: EvmChain) => {
  const res = await KeychainApi.get(`evm/token/${chain.chainId}/popular`);
  return res;
};

const addCustomToken = async (
  chain: EvmChain,
  walletAddress: string,
  toAdd: EvmCustomToken | EvmCustomToken[],
  batch?: boolean,
) => {
  let savedCustomTokens: EvmSavedCustomTokens =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    );
  if (!savedCustomTokens) {
    savedCustomTokens = {};
  }
  if (!savedCustomTokens[chain.chainId]) {
    savedCustomTokens[chain.chainId] = {};
  }

  if (!savedCustomTokens[chain.chainId][walletAddress]) {
    savedCustomTokens[chain.chainId][walletAddress] = [];
  }
  const allAddresses = savedCustomTokens[chain.chainId][walletAddress].map(
    (t: EvmCustomToken) => t.address,
  );
  if (batch) {
    for (const token of toAdd as EvmCustomToken[]) {
      if (!allAddresses.includes(token.address)) {
        savedCustomTokens[chain.chainId][walletAddress].push(token);
      }
    }
  } else {
    if (!allAddresses.includes((toAdd as EvmCustomToken).address)) {
      savedCustomTokens[chain.chainId][walletAddress].push(
        toAdd as EvmCustomToken,
      );
    }
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    savedCustomTokens,
  );
};

const getCustomTokens = async (chain: EvmChain, walletAddress: string) => {
  const savedCustomTokens: EvmSavedCustomTokens =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    );

  if (!savedCustomTokens) return [] as EvmCustomToken[];
  if (!savedCustomTokens[chain.chainId]) return [] as EvmCustomToken[];
  if (!savedCustomTokens[chain.chainId][walletAddress])
    return [] as EvmCustomToken[];

  return savedCustomTokens[chain.chainId][walletAddress];
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
  getTokensFullDetails,
  getErc721Tokens,
  getErc1155Tokens,
  filterTokensBasedOnSettings,
  getMetadataFromStorage,
  getMetadataFromBackend,
  getPopularTokensForChain,
  manualDiscoverErc20Tokens,
  manualDiscoverNfts,
  addCustomToken,
  getCustomTokens,
};

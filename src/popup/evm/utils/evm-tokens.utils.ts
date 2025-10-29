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
import { ethers, HDNodeWallet } from 'ethers';
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
              ? Number(b.tokenInfo.decimals)
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
  console.log({ tokensMetadata });
  const balancesPromises: Promise<NativeAndErc20Token | undefined>[] =
    tokensMetadata.map(async (token) =>
      getTokenBalance(walletAddress, chain, token),
    );

  const result = await Promise.all(balancesPromises);
  console.log({ result }, 'in get token balances');
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

  console.log({ tokens }, 'in filter based on settings');

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
    let shortFormattedBalance;
    let tokenInfo;
    switch (token.type) {
      case EVMSmartContractType.NATIVE: {
        balance = await provider.getBalance(walletAddress);
        balanceInteger = Number(parseFloat(ethers.formatEther(balance)));
        formattedBalance = FormatUtils.withCommas(balanceInteger, 8, true);
        const short = FormatUtils.withCommas(balanceInteger, 3, false);
        shortFormattedBalance = `${
          balanceInteger > 0 && short === '0.000' ? '~' : ''
        }${short}`;

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
        console.log(balance);
        balanceInteger = Number(
          parseFloat(
            ethers.formatUnits(
              balance,
              Number((token as EvmSmartContractInfoErc20).decimals),
            ),
          ),
        );
        formattedBalance = FormatUtils.withCommas(
          balanceInteger,
          Number((token as EvmSmartContractInfoErc20).decimals),
          true,
        );
        const short = FormatUtils.withCommas(balanceInteger, 3, false);
        shortFormattedBalance = `${
          balanceInteger > 0 && short === '0.000' ? '~' : ''
        }${short}`;

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
      shortFormattedBalance: shortFormattedBalance,
    };
  } catch (err) {
    console.log(token);
    Logger.error('Error while formatting evm balances', err);
  }
};

const getErc721Tokens = async (
  walletAddress: string,
  chain: EvmChain,
  allDiscoveredTokens: any[],
  tokensInfo: EvmSmartContractInfoErc721[],
) => {
  const LIMIT = 1000;
  let finalTransactions: any[] = [];
  let transactions: any[] = [];
  const idsPerCollection: any = {};

  let erc721tokens: EvmErc721Token[] = [];

  switch (chain.blockExplorerApi?.type) {
    case BlockExplorerType.BLOCKSCOUT: {
      for (const token of tokensInfo) {
        if (!idsPerCollection[token.contractAddress.toLowerCase()]) {
          idsPerCollection[token.contractAddress.toLowerCase()] = [];
        }
      }

      const nfts = await BlockscoutApi.getNftList(
        chain,
        walletAddress,
        EVMSmartContractType.ERC721,
      );

      for (const nftItem of nfts) {
        const item = {
          tokenInfo: tokensInfo.find(
            (token) =>
              token.contractAddress.toLowerCase() ===
              nftItem.token.contractAddress.toLowerCase(),
          )!,
          collection: [],
        } as EvmErc721Token;
        for (const instance of nftItem.tokensInstances) {
          if (!instance.metadata) {
            item.collection.push(
              await EvmNFTUtils.getMetadataFromTokenId(
                EVMSmartContractType.ERC721,
                instance.id,
                new ethers.Contract(
                  nftItem.token.contractAddress,
                  ERC721Abi,
                  await EthersUtils.getProvider(chain),
                ),
                chain,
                nftItem.token.contractAddress,
              ),
            );
          } else {
            item.collection.push({
              id: instance.id,
              metadata: {
                name: instance.metadata?.name,
                description: instance.metadata?.description,
                image: EvmNFTUtils.getImgFromMetadata(instance.metadata),
                attributes: instance.metadata?.attributes,
              },
            });
          }
        }
        erc721tokens.push(item);
      }

      return erc721tokens;
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

      for (const token of tokensInfo) {
        if (!idsPerCollection[token.contractAddress.toLowerCase()]) {
          idsPerCollection[token.contractAddress.toLowerCase()] = [];
        }
      }

      for (const tx of finalTransactions) {
        if (
          !tokensInfo
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
      console.log(result);
      for (const token of result) {
        idsPerCollection[token.address.toLowerCase()] = [token.tokenId];
      }
      break;
    }
    default:
      break;
  }

  for (const contractAddress of Object.keys(idsPerCollection)) {
    const token = tokensInfo.find(
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
          chain,
          token!.contractAddress,
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
  walletAddress: string,
  allDiscoveredTokens: any[],
  tokenInfos: EvmSmartContractInfoErc1155[],
  chain: EvmChain,
): Promise<EvmErc1155Token[]> => {
  const erc1155Tokens: EvmErc1155Token[] = [];

  switch (chain.blockExplorerApi?.type) {
    case BlockExplorerType.BLOCKSCOUT: {
      const nfts = await BlockscoutApi.getNftList(
        chain,
        walletAddress,
        EVMSmartContractType.ERC1155,
      );
      for (const nftItem of nfts) {
        const item = {
          tokenInfo: tokenInfos.find(
            (token) =>
              token.contractAddress.toLowerCase() ===
              nftItem.token.contractAddress.toLowerCase(),
          )!,
          collection: [],
        } as EvmErc1155Token;
        for (const instance of nftItem.tokensInstances) {
          if (!instance.metadata) {
            item.collection.push(
              (await EvmNFTUtils.getMetadataFromTokenId(
                EVMSmartContractType.ERC1155,
                instance.id,
                new ethers.Contract(
                  nftItem.token.contractAddress,
                  ERC1155Abi,
                  await EthersUtils.getProvider(chain),
                ),
                chain,
                nftItem.token.contractAddress,
                Number(instance.amount),
              )) as EvmErc1155TokenCollectionItem,
            );
          } else {
            item.collection.push({
              id: instance.id,
              metadata: {
                name: instance.metadata?.name,
                description: instance.metadata?.description,
                image: EvmNFTUtils.getImgFromMetadata(instance.metadata),
                attributes: instance.metadata?.attributes,
              },
              balance: Number(instance.amount),
            });
          }
        }
        erc1155Tokens.push(item);
      }
      return erc1155Tokens;
    }
    case BlockExplorerType.ETHERSCAN: {
      for (const tokenInfo of tokenInfos) {
        const tokens = allDiscoveredTokens.filter(
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
              chain,
              tokenInfo.contractAddress,
              Number(token.balance),
            )) as EvmErc1155TokenCollectionItem,
          );
        }
        erc1155Tokens.push(erc1155Token);
      }
    }
    default:
      break;
  }

  return erc1155Tokens;
};

const getNfts = async (
  wallet: HDNodeWallet,
  chain: EvmChain,
  allTokensInfo: EvmSmartContractInfo[],
  allDiscoveredTokens: any[],
) => {
  const walletAddress =
    process.env.FORCED_EVM_WALLET_ADDRESS?.toLowerCase() ??
    wallet.address.toLowerCase();
  if (chain.manualDiscoverAvailable) {
    const savedManualDiscoveredNfts =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.EVM_MANUAL_DISCOVERED_NFTS,
      );
    console.log(
      savedManualDiscoveredNfts[chain.chainId],
      'savedManualDiscoveredNfts[chain.chainId]',
    );
    console.log(walletAddress);
    console.log(
      savedManualDiscoveredNfts[chain.chainId][walletAddress],
      'savedManualDiscoveredNfts[chain.chainId][walletAddress]',
    );
    if (
      savedManualDiscoveredNfts &&
      savedManualDiscoveredNfts[chain.chainId] &&
      savedManualDiscoveredNfts[chain.chainId][walletAddress]
    ) {
      return [savedManualDiscoveredNfts[chain.chainId][walletAddress], []];
    } else return [[], []];
  }
  return Promise.all([
    getErc721Tokens(
      walletAddress,
      chain,
      allDiscoveredTokens,
      allTokensInfo.filter(
        (token) => token.type === EVMSmartContractType.ERC721,
      ) as EvmSmartContractInfoErc721[],
    ),
    getErc1155Tokens(
      walletAddress,
      allDiscoveredTokens,
      allTokensInfo.filter(
        (token) => token.type === EVMSmartContractType.ERC1155,
      ) as EvmSmartContractInfoErc1155[],
      chain,
    ),
  ]);
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
    const nfts = await KeychainApi.get(
      `evm/${chain.chainId}/wallet/${walletAddress}/discover-tokens-nfts`,
    );

    const result: (EvmErc721Token | EvmErc1155Token)[] = [];
    console.log({ nfts }, 'in manual discover nfts');
    for (const nft of nfts) {
      let index = result.findIndex(
        (r) => r.tokenInfo.contractAddress === nft.contractAddress,
      );
      if (index === -1) {
        result.push({
          tokenInfo: {
            type: nft.type,
            name: nft.name,
            contractAddress: nft.contractAddress,
            possibleSpam: nft.possibleSpam,
            verifiedContract: nft.verifiedContract,
            symbol: nft.symbol,
            logo: nft.logo,
            chainId: chain.chainId,
          } as EvmSmartContractInfoErc721 | EvmSmartContractInfoErc1155,
          collection: [],
        });

        index = result.length - 1;
      }
      const item: any = {
        id: nft.tokenId,
        metadata:
          nft.metadata ??
          (await EvmNFTUtils.getMetadata(
            nft.type,
            nft.tokenId,
            new ethers.Contract(
              nft.contractAddress,
              nft.type === EVMSmartContractType.ERC721 ? ERC721Abi : ERC1155Abi,
              await EthersUtils.getProvider(chain),
            ),
          )),
      };
      if (nft.amount) {
        item.balance = Number(nft.amount);
      }
      result[index].collection.push(item);
    }

    let savedManualDiscoveredNfts =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.EVM_MANUAL_DISCOVERED_NFTS,
      );
    if (!savedManualDiscoveredNfts) {
      savedManualDiscoveredNfts = {};
    }
    if (!savedManualDiscoveredNfts[chain.chainId]) {
      savedManualDiscoveredNfts[chain.chainId] = {};
    }
    if (
      !savedManualDiscoveredNfts[chain.chainId][walletAddress.toLowerCase()]
    ) {
      savedManualDiscoveredNfts[chain.chainId][walletAddress.toLowerCase()] =
        [];
    }
    savedManualDiscoveredNfts[chain.chainId][walletAddress.toLowerCase()] =
      result;
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_MANUAL_DISCOVERED_NFTS,
      savedManualDiscoveredNfts,
    );

    return result;
  } else return [];
};

const getTokensFullDetails = async (
  discoveredTokens: any[],
  chain: EvmChain,
  forceAll: boolean = false,
): Promise<EvmSmartContractInfo[]> => {
  let allSavedMetadata = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
  );

  if (!allSavedMetadata) allSavedMetadata = {};

  let chainTokenMetaData =
    allSavedMetadata && allSavedMetadata[chain.chainId]
      ? allSavedMetadata[chain.chainId]
      : [];

  const addresses: { address: string; tokenId?: string }[] = [];

  let addressesToFetch: { address: string; tokenId?: string }[] = [];

  console.log({ discoveredTokens });

  for (const token of discoveredTokens) {
    if (!addresses.includes(token.contractAddress) && !!token.contractAddress) {
      addresses.push({
        address: token.contractAddress,
        tokenId: token.tokenId,
      });
    }
  }
  for (const address of addresses) {
    if (
      !chainTokenMetaData.find(
        (ctm: any) =>
          ctm.contractAddress &&
          ctm.contractAddress.toLowerCase() === address.address.toLowerCase(),
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

  console.log({ missingMetadataAddresses });

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

  const allDiscoveredAddresses = discoveredTokens.map((t) => t.contractAddress);
  return newMetadata.filter(
    (t) =>
      forceAll ||
      allDiscoveredAddresses.includes(t.contractAddress) ||
      t.type === EVMSmartContractType.NATIVE,
  );
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
  addresses: { address: string; tokenId?: string }[],
  chain: EvmChain,
): Promise<EvmSmartContractInfo[] | null> => {
  try {
    const result = await KeychainApi.post(
      `evm/smart-contracts-info/${chain.chainId}`,
      { addresses },
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
  getNfts,
};

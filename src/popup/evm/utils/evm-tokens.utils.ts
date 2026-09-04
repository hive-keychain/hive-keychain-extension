import { EvmLightNodeApi } from '@api/evm-light-node';
import type {
  BalanceDetails,
  BalanceInfo,
} from '@dialog/components/balance-change-card/balance-change-card.interface';
import {
  EvmErc1155Token,
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmCustomErc20TokenMetadata,
  EvmCustomNft,
  EvmCustomToken,
  EvmCustomTokenMetadataErc20,
  EvmSavedCustomNfts,
  EvmSavedCustomTokens,
} from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EvmLightNodeContractResponse } from '@popup/evm/interfaces/evm-light-node.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import {
  AbiList,
  ERC1155Abi,
  Erc20Abi,
  ERC721Abi,
} from '@popup/evm/reference-data/abi.data';
import { CoingeckoUtils } from '@popup/evm/utils/coingecko.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const SHORT_BALANCE_DECIMALS = 5;
const NATIVE_TOKEN_PLACEHOLDER_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';
const ERC165Abi = [
  {
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
const ContractMetadataAbi = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type ContractProbeResult = 'success' | 'reverted' | 'missing';

const normalizeCustomTokenAddress = (address: string) => {
  const trimmedAddress = address.trim();
  if (!trimmedAddress.length) {
    return '';
  }

  return ethers.isAddress(trimmedAddress)
    ? ethers.getAddress(trimmedAddress)
    : trimmedAddress;
};

const normalizeOptionalCoingeckoId = (value: string | undefined) => {
  const normalizedValue = value?.trim();
  return normalizedValue?.length ? normalizedValue : undefined;
};

const isNativeTokenPlaceholderAddress = (address?: string) =>
  address?.trim().toLowerCase() === NATIVE_TOKEN_PLACEHOLDER_ADDRESS;

const normalizeCustomWalletKey = (walletAddress: string) =>
  walletAddress.toLowerCase();

const normalizeCustomNftTokenId = (tokenId: string) => {
  const trimmedTokenId = tokenId.trim();
  if (!trimmedTokenId.length) {
    return '';
  }

  try {
    return BigInt(trimmedTokenId).toString(10);
  } catch {
    return trimmedTokenId;
  }
};

/** Native token metadata from chain fields only (no EvmLightNode), for custom chains. */
const buildFallbackNativeTokenInfo = (
  chain: EvmChain,
): EvmSmartContractInfoNative => ({
  type: EVMSmartContractType.NATIVE,
  name: chain.name,
  symbol: chain.mainToken,
  logo: chain.logo ?? '',
  chainId: chain.chainId,
  backgroundColor: '',
  coingeckoId: chain.nativeCoinId ?? '',
  priceUsd: null,
  createdAt: new Date(0).toISOString(),
  categories: [],
});

/** Legacy storage: metadata nested under `erc20` */
interface LegacyEvmCustomTokenMetadata {
  erc20?: EvmCustomErc20TokenMetadata;
}

const normalizeCustomTokenMetadata = (
  token: EvmCustomToken,
): EvmCustomTokenMetadataErc20 | undefined => {
  const { metadata, type } = token;
  if (!metadata || type !== EVMSmartContractType.ERC20) {
    return undefined;
  }
  if (
    'type' in metadata &&
    (metadata as EvmCustomTokenMetadataErc20).type ===
      EVMSmartContractType.ERC20
  ) {
    return metadata as EvmCustomTokenMetadataErc20;
  }
  const legacy = metadata as LegacyEvmCustomTokenMetadata;
  if (legacy.erc20) {
    return {
      type: EVMSmartContractType.ERC20,
      name: legacy.erc20.name,
      symbol: legacy.erc20.symbol,
      decimals: legacy.erc20.decimals,
      logo: legacy.erc20.logo,
      coingeckoId: normalizeOptionalCoingeckoId(legacy.erc20.coingeckoId),
    };
  }
  return undefined;
};

const normalizeCustomToken = (token: EvmCustomToken): EvmCustomToken => ({
  ...token,
  metadata: normalizeCustomTokenMetadata(token),
});

const normalizeCustomNft = (nft: EvmCustomNft): EvmCustomNft => {
  const trimmedCollectionName = nft.collectionName?.trim();
  return {
    address: normalizeCustomTokenAddress(nft.address),
    type: nft.type,
    tokenIds: Array.from(
      new Set(nft.tokenIds.map(normalizeCustomNftTokenId).filter(Boolean)),
    ),
    ...(trimmedCollectionName ? { collectionName: trimmedCollectionName } : {}),
  };
};

const buildCustomErc20TokenInfo = (
  chain: EvmChain,
  address: string,
  metadata: EvmCustomErc20TokenMetadata,
): EvmSmartContractInfoErc20 => ({
  type: EVMSmartContractType.ERC20,
  name: metadata.name.trim(),
  symbol: metadata.symbol.trim(),
  decimals: metadata.decimals,
  logo: metadata.logo?.trim() ?? '',
  chainId: chain.chainId,
  contractAddress: normalizeCustomTokenAddress(address),
  backgroundColor: '',
  coingeckoId: normalizeOptionalCoingeckoId(metadata.coingeckoId),
  priceUsd: null,
  possibleSpam: false,
  verifiedContract: true,
  isProxy: false,
  proxyTarget: null,
  validated: 0,
});

const getContractProbeResult = async (
  callback: () => Promise<unknown>,
): Promise<ContractProbeResult> => {
  try {
    await callback();
    return 'success';
  } catch (error: unknown) {
    const err = error as {
      code?: string;
      shortMessage?: string;
      message?: string;
    };
    const message = String(
      err?.shortMessage ?? err?.message ?? '',
    ).toLowerCase();
    if (
      err?.code === 'BAD_DATA' ||
      message.includes('could not decode result data') ||
      message.includes('returned no data') ||
      message.includes('missing revert data')
    ) {
      return 'missing';
    }
    return 'reverted';
  }
};

const safeGetContractTextValue = async (
  contract: ethers.Contract,
  method: 'name' | 'symbol',
) => {
  try {
    const value = await contract[method]();
    return String(value ?? '').trim();
  } catch {
    return '';
  }
};

const detectCustomNftType = async (
  chain: EvmChain,
  walletAddress: string,
  contractAddress: string,
  tokenIds: string[],
): Promise<EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155> => {
  const normalizedAddress = normalizeCustomTokenAddress(contractAddress);
  const provider = await EthersUtils.getProvider(chain);
  const erc165Contract = new ethers.Contract(
    normalizedAddress,
    ERC165Abi,
    provider,
  );

  try {
    if (await erc165Contract.supportsInterface(ERC721_INTERFACE_ID)) {
      return EVMSmartContractType.ERC721;
    }
    if (await erc165Contract.supportsInterface(ERC1155_INTERFACE_ID)) {
      return EVMSmartContractType.ERC1155;
    }
  } catch {
    // Continue with method probes when ERC165 is unavailable.
  }

  const probeTokenId = tokenIds[0];
  const erc1155Contract = new ethers.Contract(
    normalizedAddress,
    ERC1155Abi,
    provider,
  );
  const [erc1155BalanceProbe, erc1155UriProbe] = await Promise.all([
    getContractProbeResult(() =>
      erc1155Contract.balanceOf(walletAddress, probeTokenId),
    ),
    getContractProbeResult(() => erc1155Contract.uri(probeTokenId)),
  ]);

  if (
    erc1155BalanceProbe === 'success' ||
    erc1155UriProbe === 'success' ||
    (erc1155BalanceProbe !== 'missing' && erc1155UriProbe !== 'missing')
  ) {
    return EVMSmartContractType.ERC1155;
  }

  const erc721Contract = new ethers.Contract(
    normalizedAddress,
    ERC721Abi,
    provider,
  );
  const [erc721OwnerProbe, erc721UriProbe] = await Promise.all([
    getContractProbeResult(() => erc721Contract.ownerOf(probeTokenId)),
    getContractProbeResult(() => erc721Contract.tokenURI(probeTokenId)),
  ]);

  if (
    erc721OwnerProbe === 'success' ||
    erc721UriProbe === 'success' ||
    (erc721OwnerProbe !== 'missing' && erc721UriProbe !== 'missing')
  ) {
    return EVMSmartContractType.ERC721;
  }

  throw new Error('custom_nft_unknown_type');
};

const getOwnedCustomNftTokenIds = async (
  chain: EvmChain,
  walletAddress: string,
  contractAddress: string,
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155,
  tokenIds: string[],
) => {
  const normalizedAddress = normalizeCustomTokenAddress(contractAddress);
  const normalizedWalletAddress = walletAddress.toLowerCase();
  const provider = await EthersUtils.getProvider(chain);
  const contract = new ethers.Contract(
    normalizedAddress,
    type === EVMSmartContractType.ERC1155 ? ERC1155Abi : ERC721Abi,
    provider,
  );

  const ownershipChecks = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        if (type === EVMSmartContractType.ERC721) {
          const owner = await contract.ownerOf(tokenId);
          return String(owner).toLowerCase() === normalizedWalletAddress
            ? tokenId
            : null;
        }

        const balance = await contract.balanceOf(walletAddress, tokenId);
        return BigInt(balance) > BigInt(0) ? tokenId : null;
      } catch {
        return null;
      }
    }),
  );

  return ownershipChecks.filter(Boolean) as string[];
};

const getTotalBalanceInUsd = (tokens: NativeAndErc20Token[]) => {
  return tokens.reduce((a, b) => {
    let price = b.tokenInfo.priceUsd ?? 0;

    const tokenValue =
      price *
      Number(
        ethers.formatUnits(
          b.balance,
          b.tokenInfo.type === EVMSmartContractType.ERC20
            ? Number(b.tokenInfo.decimals)
            : 18,
        ),
      );
    return a + tokenValue;
  }, 0);
};

const getTotalBalanceInMainToken = (
  tokens: NativeAndErc20Token[],
  chain: EvmChain,
) => {
  const normalizedMainTokenSymbol = chain?.mainToken?.toLowerCase();
  if (!normalizedMainTokenSymbol) {
    return 0;
  }

  const mainToken =
    tokens.find((token) => {
      const symbol = token?.tokenInfo?.symbol;
      return (
        typeof symbol === 'string' &&
        symbol.toLowerCase() === normalizedMainTokenSymbol
      );
    }) ??
    tokens.find(
      (token) => token?.tokenInfo?.type === EVMSmartContractType.NATIVE,
    );

  if (mainToken) {
    const valueInUsd = getTotalBalanceInUsd(tokens) || 0;

    let price = mainToken?.tokenInfo.priceUsd ?? 0;

    if (!price || price === 0) return 0;
    return valueInUsd / price;
  } else return 0;
};

interface EvmTokenBalanceResult {
  tokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20;
  formattedBalance: string;
  balance: bigint;
  balanceInteger: number;
  shortFormattedBalance: string;
}

const isNativeTokenPlaceholder = (token: EvmSmartContractInfo) =>
  token.type === EVMSmartContractType.ERC20 &&
  isNativeTokenPlaceholderAddress(
    (token as EvmSmartContractInfoErc20).contractAddress,
  );

const normalizeTokensMetadataForBalances = async (
  chain: EvmChain,
  tokensMetadata: EvmSmartContractInfo[],
) => {
  const hasNativeToken = tokensMetadata.some(
    (token) => token.type === EVMSmartContractType.NATIVE,
  );
  let nativeTokenInfo: EvmSmartContractInfoNative | undefined;
  const normalizedTokensMetadata: EvmSmartContractInfo[] = [];

  for (const token of tokensMetadata) {
    if (isNativeTokenPlaceholder(token)) {
      if (hasNativeToken || nativeTokenInfo) {
        continue;
      }

      nativeTokenInfo = await getMainTokenInfo(chain);
      normalizedTokensMetadata.push(nativeTokenInfo);
      continue;
    }

    normalizedTokensMetadata.push(token);
  }

  return normalizedTokensMetadata;
};

const getTokenBalances = async (
  walletAddress: string,
  chain: EvmChain,
  tokensMetadata: EvmSmartContractInfo[],
) => {
  const normalizedTokensMetadata = await normalizeTokensMetadataForBalances(
    chain,
    tokensMetadata,
  );
  const balancesPromises: Promise<EvmTokenBalanceResult | undefined>[] =
    normalizedTokensMetadata.map(async (token) =>
      getTokenBalance(walletAddress, chain, token),
    );

  const result = await Promise.all(balancesPromises);
  const successfulBalances = result.filter(
    (balance): balance is EvmTokenBalanceResult => !!balance,
  );

  const needCoingeckoPrices = successfulBalances.filter(
    (balance) =>
      !!balance.tokenInfo.coingeckoId && balance.tokenInfo.priceUsd === null,
  );
  const coingeckoPrices = await CoingeckoUtils.fetchCoingeckoPrices(
    needCoingeckoPrices.map((balance) => balance.tokenInfo.coingeckoId!),
  );

  const updatedBalances = successfulBalances.map((balance) => {
    if (balance.tokenInfo.coingeckoId && balance.tokenInfo.priceUsd === null) {
      return {
        ...balance,
        tokenInfo: {
          ...balance.tokenInfo,
          priceUsd:
            coingeckoPrices &&
            coingeckoPrices[balance.tokenInfo.coingeckoId] &&
            coingeckoPrices[balance.tokenInfo.coingeckoId]?.usd
              ? coingeckoPrices[balance.tokenInfo.coingeckoId].usd
              : 0,
        },
      };
    }

    return balance;
  });

  return updatedBalances.filter(
    (balance) =>
      balance.balance > BigInt(0) ||
      balance.tokenInfo.type === EVMSmartContractType.NATIVE,
  );
};

interface EvmTokenSettingsFilterOptions {
  customTokenAddresses?: string[];
  hiddenAutoDetectedTokenAddresses?: string[];
}

const normalizeTokenFilterAddress = (address: string) =>
  address.trim().toLowerCase();

const getErc20FilterAddress = (
  token: NativeAndErc20Token | EvmErc721Token | EvmErc1155Token,
) => {
  if (token.tokenInfo.type !== EVMSmartContractType.ERC20) {
    return '';
  }

  return normalizeTokenFilterAddress(
    (token.tokenInfo as EvmSmartContractInfoErc20).contractAddress,
  );
};

const filterTokensBasedOnSettings = async (
  tokens: (NativeAndErc20Token | EvmErc721Token | EvmErc1155Token)[],
  options: EvmTokenSettingsFilterOptions = {},
) => {
  const evmSettings = await EvmSettingsUtils.getSettings();
  const hiddenAutoDetectedTokenAddresses = new Set(
    (options.hiddenAutoDetectedTokenAddresses ?? [])
      .map(normalizeTokenFilterAddress)
      .filter(Boolean),
  );
  const customTokenAddresses = new Set(
    (options.customTokenAddresses ?? [])
      .map(normalizeTokenFilterAddress)
      .filter(Boolean),
  );

  return tokens.filter((token) => {
    if (token.tokenInfo.type === EVMSmartContractType.NATIVE) {
      return true;
    }

    const erc20Address = getErc20FilterAddress(token);
    if (
      erc20Address &&
      hiddenAutoDetectedTokenAddresses.has(erc20Address)
    ) {
      return false;
    }

    if (erc20Address && customTokenAddresses.has(erc20Address)) {
      return true;
    }

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

    return true;
  });
};

const getTokenBalance = async (
  walletAddress: string,
  chain: EvmChain,
  token: EvmSmartContractInfo,
): Promise<EvmTokenBalanceResult | undefined> => {
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
        const balanceValue = ethers.formatEther(balance);
        balanceInteger = Number(balanceValue);

        formattedBalance = EvmFormatUtils.formatTokenBalance(balanceValue, 8);
        shortFormattedBalance = EvmFormatUtils.formatTokenBalance(
          balanceValue,
          SHORT_BALANCE_DECIMALS,
        );

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
        const decimals = Number((token as EvmSmartContractInfoErc20).decimals);
        const balanceValue = ethers.formatUnits(balance, decimals);
        balanceInteger = Number(balanceValue);
        formattedBalance = EvmFormatUtils.formatTokenBalance(
          balanceValue,
          decimals,
        );
        shortFormattedBalance = EvmFormatUtils.formatTokenBalance(
          balanceValue,
          SHORT_BALANCE_DECIMALS,
        );

        tokenInfo = token as EvmSmartContractInfoErc20;
        break;
      }

      default:
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
    Logger.error('Error while formatting evm balances', err);
    return undefined;
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
            isProxy: false,
            proxyTarget: null,
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

const getTokenInfo = async (
  chainId: EvmChain['chainId'],
  address: string,
  /** When callers already fetched contract metadata; avoids duplicate light-node contract GET */
  preFetchedContract?: EvmLightNodeContractResponse,
): Promise<EvmSmartContractInfo> => {
  const result =
    preFetchedContract ??
    (await EvmLightNodeUtils.getContract(chainId, address));
  const tokenInfo = mapLightNodeContractToTokenInfo(chainId, result);
  if (
    tokenInfo.type !== EVMSmartContractType.ERC20 ||
    !('decimals' in tokenInfo)
  ) {
    return tokenInfo;
  }

  const metadata = result.metadata;
  const missingName = !metadata?.name?.trim();
  const missingSymbol = !metadata?.symbol?.trim();
  const missingDecimals = !metadata || metadata.decimals == null;
  if (!missingName && !missingSymbol && !missingDecimals) return tokenInfo;

  try {
    const chain = await ChainUtils.getChain<EvmChain>(
      ethers.toQuantity(chainId),
    );
    if (!chain) throw new Error('Chain unavailable for ERC20 metadata lookup');
    const provider = await EthersUtils.getProvider(chain);
    const contract = new ethers.Contract(
      address.toLowerCase(),
      Erc20Abi,
      provider,
    );
    const [name, symbol, decimals] = await Promise.all([
      missingName
        ? safeGetContractTextValue(contract, 'name')
        : tokenInfo.name,
      missingSymbol
        ? safeGetContractTextValue(contract, 'symbol')
        : tokenInfo.symbol,
      missingDecimals
        ? fetchErc20DecimalsFromContract(contract)
        : tokenInfo.decimals,
    ]);
    return { ...tokenInfo, name, symbol, decimals };
  } catch (error) {
    // Do not return the mapper's default of 18 when the token precision is unknown.
    if (missingDecimals) throw error;
    Logger.warn(
      'ERC20 metadata RPC fallback failed; using light-node metadata',
    );
    return tokenInfo;
  }
};

const fetchErc20DecimalsFromContract = async (
  contract: ethers.Contract,
): Promise<number> => {
  const result: unknown = await contract.decimals();
  const decimals = Number(result);
  if (
    (typeof result !== 'bigint' && typeof result !== 'number') ||
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 255
  ) {
    throw new Error('Invalid ERC20 decimals from contract');
  }
  return decimals;
};

const fetchErc20NameAndDecimalsFromChain = async (
  chain: EvmChain,
  contractAddress: string,
): Promise<{ name: string; decimals: number }> => {
  const provider = await EthersUtils.getProvider(chain);
  const contract = new ethers.Contract(
    contractAddress.toLowerCase(),
    Erc20Abi,
    provider,
  );
  const [nameResult, decimals] = await Promise.all([
    contract.name(),
    fetchErc20DecimalsFromContract(contract),
  ]);
  const name = String(nameResult ?? '').trim();
  return { name, decimals };
};

const mergeCustomErc20TokenInfos = (
  tokenInfos: (EvmSmartContractInfoNative | EvmSmartContractInfoErc20)[],
  customTokenInfos: EvmSmartContractInfoErc20[],
) => {
  const existingAddresses = new Set(
    tokenInfos
      .filter((tokenInfo) => tokenInfo.type === EVMSmartContractType.ERC20)
      .map((tokenInfo) =>
        (tokenInfo as EvmSmartContractInfoErc20).contractAddress.toLowerCase(),
      ),
  );

  return [
    ...tokenInfos,
    ...customTokenInfos.filter(
      (tokenInfo) =>
        !existingAddresses.has(tokenInfo.contractAddress.toLowerCase()),
    ),
  ];
};

const sortTokens = (tokens: NativeAndErc20Token[]) => {
  return tokens.sort((tokenA, tokenB) => {
    const priceA = tokenA.tokenInfo.priceUsd ?? 0;
    const priceB = tokenB.tokenInfo.priceUsd ?? 0;
    if (tokenA.tokenInfo.type === EVMSmartContractType.NATIVE) return -1;
    else if (tokenB.tokenInfo.type === EVMSmartContractType.NATIVE) return 1;
    else {
      const tokenAPrice =
        priceA *
        Number(ethers.formatUnits(tokenA.balance, tokenA.tokenInfo.decimals));
      const tokenBPrice =
        priceB *
        Number(ethers.formatUnits(tokenB.balance, tokenB.tokenInfo.decimals));
      return tokenBPrice - tokenAPrice;
    }
  });
};

const formatTokenValue = (value: number, decimals = 18) => {
  return EvmFormatUtils.formatTokenBalance(
    ethers.formatUnits(value, decimals),
    decimals,
  );
};
const formatEtherValue = (value: string) => {
  return EvmFormatUtils.formatTokenBalance(ethers.formatEther(value), 18);
};

type NativeTokenApiResponse = {
  chainId: number;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    logoUrl: string;
    wrappedNativeTokenAddress: string;
  };
  price: { priceUsd: number; fetchedAt: string };
};

/** Light-node `native/{chainId}` timeout before using local chain metadata. */
export const MAIN_TOKEN_LIGHT_NODE_TIMEOUT_MS = 5000;

const rejectAfterMs = (ms: number, reason: string) =>
  new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(reason)), ms);
  });

const isValidNativeTokenApiResponse = (
  response: unknown,
): response is NativeTokenApiResponse => {
  if (!response || typeof response !== 'object') return false;
  const meta = (response as { metadata?: unknown }).metadata;
  if (!meta || typeof meta !== 'object') return false;
  const name = (meta as { name?: unknown }).name;
  const symbol = (meta as { symbol?: unknown }).symbol;
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    typeof symbol === 'string' &&
    symbol.length > 0
  );
};

const mainTokenInfoInflight = new Map<
  string,
  Promise<EvmSmartContractInfoNative>
>();

const getMainTokenInfo = async (
  chain: EvmChain,
): Promise<EvmSmartContractInfoNative> => {
  if (chain.isCustom === true) {
    return buildFallbackNativeTokenInfo(chain);
  }

  const key = String(Number(chain.chainId));
  let pending = mainTokenInfoInflight.get(key);
  if (!pending) {
    const run = async (): Promise<EvmSmartContractInfoNative> => {
      try {
        const response = await Promise.race([
          EvmLightNodeApi.get(`native/${Number(chain.chainId)}`),
          rejectAfterMs(
            MAIN_TOKEN_LIGHT_NODE_TIMEOUT_MS,
            'main_token_native_fetch_timeout',
          ),
        ]);

        if (!isValidNativeTokenApiResponse(response)) {
          Logger.warn(
            `Native token metadata invalid or missing for chain ${chain.chainId}; using local fallback`,
          );
          return buildFallbackNativeTokenInfo(chain);
        }

        const logoUrl = response.metadata.logoUrl;
        return {
          type: EVMSmartContractType.NATIVE,
          name: response.metadata.name,
          symbol: response.metadata.symbol,
          logo: typeof logoUrl === 'string' ? logoUrl : '',
          chainId: chain.chainId,
          backgroundColor: '',
          coingeckoId: '',
          priceUsd: response.price?.priceUsd ?? 0,
          createdAt: response.price?.fetchedAt ?? Date.now(),
          categories: [],
        };
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        Logger.warn(
          `Native token metadata fetch failed for chain ${chain.chainId} (${detail}); using local fallback`,
        );
        return buildFallbackNativeTokenInfo(chain);
      }
    };
    pending = run().finally(() => {
      mainTokenInfoInflight.delete(key);
    });
    mainTokenInfoInflight.set(key, pending);
  }
  return pending!;
};

const getStoredCustomTokenCoingeckoId = (
  tokens: EvmCustomToken[],
  tokenType: EVMSmartContractType,
  tokenAddress: string,
) => {
  const matchKey = `${tokenType}:${normalizeCustomTokenAddress(
    tokenAddress,
  ).toLowerCase()}`;

  for (const token of tokens) {
    if (
      `${token.type}:${normalizeCustomTokenAddress(token.address).toLowerCase()}` ===
        matchKey &&
      token.metadata?.type === EVMSmartContractType.ERC20
    ) {
      return normalizeOptionalCoingeckoId(token.metadata.coingeckoId);
    }
  }

  return undefined;
};

const enrichCustomErc20MetadataWithCoingeckoId = async (
  chain: EvmChain,
  tokenAddress: string,
  metadata: EvmCustomTokenMetadataErc20,
  existingTokens: EvmCustomToken[] = [],
): Promise<EvmCustomTokenMetadataErc20> => {
  let coingeckoId: string | undefined;

  try {
    coingeckoId = await EvmLightNodeUtils.getCoingeckoTokenId(
      chain.chainId,
      tokenAddress,
    );
  } catch (error) {
    Logger.warn('Error while fetching custom token CoinGecko id');
  }

  const resolvedCoingeckoId =
    normalizeOptionalCoingeckoId(coingeckoId) ??
    getStoredCustomTokenCoingeckoId(
      existingTokens,
      EVMSmartContractType.ERC20,
      tokenAddress,
    ) ??
    normalizeOptionalCoingeckoId(metadata.coingeckoId);

  return resolvedCoingeckoId
    ? { ...metadata, coingeckoId: resolvedCoingeckoId }
    : metadata;
};

const mapLightNodeContractToTokenInfo = (
  chainId: EvmChain['chainId'],
  contract: EvmLightNodeContractResponse,
): EvmSmartContractInfo => {
  const metadata = contract.metadata;
  const name = metadata?.name ?? '';
  const symbol = metadata?.symbol ?? '';
  const logo =
    metadata && 'logoUrl' in metadata ? (metadata.logoUrl ?? '') : '';
  const priceUsd = contract.price?.priceUsd ?? 0;
  const contractAddress = contract.address;
  const verifiedContract = contract.verified ?? false;
  const possibleSpam = contract.possibleSpam ?? false;
  const isProxy = contract.isProxy ?? false;
  const proxyTarget = contract.proxyTarget ?? null;
  const normalizedContractType = contract.contractType?.toUpperCase() ?? null;

  const base = {
    name,
    symbol,
    logo,
    chainId: String(chainId),
    backgroundColor: '',
    priceUsd,
  };

  const nonNativeBase = {
    ...base,
    contractAddress,
    possibleSpam,
    verifiedContract,
    isProxy,
    proxyTarget,
  };

  if (normalizedContractType === 'ERC721') {
    return {
      ...nonNativeBase,
      type: EVMSmartContractType.ERC721,
    } as EvmSmartContractInfoErc721;
  }

  if (
    normalizedContractType === 'ERC721ENUMERABLE' ||
    normalizedContractType === 'ERC721_ENUMERABLE'
  ) {
    return {
      ...nonNativeBase,
      type: EVMSmartContractType.ERC721Enumerable,
    } as EvmSmartContractInfoErc721;
  }

  if (normalizedContractType === 'ERC1155') {
    return {
      ...nonNativeBase,
      type: EVMSmartContractType.ERC1155,
    } as EvmSmartContractInfoErc1155;
  }

  const isTokenMetadata = !!metadata && 'decimals' in metadata;
  const decimals = isTokenMetadata ? (metadata.decimals ?? 18) : 18;
  const coingeckoId = isTokenMetadata
    ? (metadata.coingeckoId ?? undefined)
    : undefined;

  return {
    ...nonNativeBase,
    type: EVMSmartContractType.ERC20,
    decimals,
    validated: 0,
    coingeckoId,
  } as EvmSmartContractInfoErc20;
};

const displayValue = (value: number, tokenInfo: EvmSmartContractInfo) => {
  let decimals;

  switch (tokenInfo.type) {
    case EVMSmartContractType.NATIVE:
      decimals = 18;
      break;
    case EVMSmartContractType.ERC20:
      decimals = (tokenInfo as EvmSmartContractInfoErc20).decimals;
      break;
    case EVMSmartContractType.ERC721:
    case EVMSmartContractType.ERC721Enumerable:
    case EVMSmartContractType.ERC1155:
    case EVMSmartContractType.PROTOCOL: {
      decimals = 0;
      break;
    }
  }

  return EvmFormatUtils.formatTokenBalance(value, decimals);
};

const normalizeAbi = (abi: any): any[] | null => {
  if (!abi) return null;
  if (Array.isArray(abi)) return abi;

  if (typeof abi === 'string') {
    try {
      return normalizeAbi(JSON.parse(abi));
    } catch (error) {
      Logger.error('Error while parsing ABI', error);
      return null;
    }
  }

  if (typeof abi === 'object' && 'abi' in abi) {
    return normalizeAbi(abi.abi);
  }

  return null;
};

const getTokenType = (abi: any) => {
  const parsedAbi = normalizeAbi(abi);
  if (!parsedAbi) return null;

  const abiMethods = parsedAbi
    .map((abiFunctions: any) => abiFunctions.name)
    .filter(Boolean);

  for (const referenceAbi of AbiList) {
    if (referenceAbi.decodeOnly) {
      continue;
    }
    if (
      referenceAbi.methods.every((method: string) =>
        abiMethods.includes(method),
      )
    )
      return referenceAbi.type;
  }

  return null;
};

const addCustomToken = async (
  chain: EvmChain,
  walletAddress: string,
  toAdd: EvmCustomToken | EvmCustomToken[],
  batch?: boolean,
) => {
  void walletAddress;
  let savedCustomTokens: EvmSavedCustomTokens =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    );
  if (!savedCustomTokens) {
    savedCustomTokens = {};
  }
  if (!savedCustomTokens[chain.chainId]) {
    savedCustomTokens[chain.chainId] = [];
  }

  const savedChainTokens = savedCustomTokens[chain.chainId];
  const allAddresses = new Set(
    savedChainTokens.map(
      (token: EvmCustomToken) =>
        `${token.type}:${normalizeCustomTokenAddress(token.address).toLowerCase()}`,
    ),
  );

  const nextEntries = [...savedChainTokens];

  if (batch) {
    for (const token of toAdd as EvmCustomToken[]) {
      const normalizedAddress = normalizeCustomTokenAddress(token.address);
      const key = `${token.type}:${normalizedAddress.toLowerCase()}`;
      if (!allAddresses.has(key)) {
        nextEntries.push({
          ...token,
          address: normalizedAddress,
        });
        allAddresses.add(key);
      }
    }
  } else {
    const tokenToAdd = toAdd as EvmCustomToken;
    const normalizedAddress = normalizeCustomTokenAddress(tokenToAdd.address);
    const key = `${tokenToAdd.type}:${normalizedAddress.toLowerCase()}`;
    if (!allAddresses.has(key)) {
      const normalizedToken =
        tokenToAdd.type === EVMSmartContractType.ERC20 &&
        tokenToAdd.metadata?.type === EVMSmartContractType.ERC20
          ? {
              ...tokenToAdd,
              address: normalizedAddress,
              metadata: await enrichCustomErc20MetadataWithCoingeckoId(
                chain,
                normalizedAddress,
                tokenToAdd.metadata,
                savedChainTokens,
              ),
            }
          : {
              ...tokenToAdd,
              address: normalizedAddress,
            };
      nextEntries.push({
        ...normalizedToken,
      });
    }
  }

  savedCustomTokens[chain.chainId] = nextEntries.map(normalizeCustomToken);

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    savedCustomTokens,
  );
};

const removeCustomToken = async (
  chain: EvmChain,
  walletAddress: string,
  tokenAddress: string,
  tokenType: EVMSmartContractType,
) => {
  void walletAddress;
  const normalizedAddress = normalizeCustomTokenAddress(tokenAddress);
  const removeKey = `${tokenType}:${normalizedAddress.toLowerCase()}`;

  let savedCustomTokens: EvmSavedCustomTokens =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    );
  if (!savedCustomTokens?.[chain.chainId]) {
    return;
  }

  savedCustomTokens[chain.chainId] = savedCustomTokens[chain.chainId]
    .filter(
      (t) =>
        `${t.type}:${normalizeCustomTokenAddress(t.address).toLowerCase()}` !==
        removeKey,
    )
    .map(normalizeCustomToken);

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    savedCustomTokens,
  );
};

const updateCustomToken = async (
  chain: EvmChain,
  walletAddress: string,
  tokenAddress: string,
  tokenType: EVMSmartContractType,
  metadata: EvmCustomTokenMetadataErc20,
) => {
  void walletAddress;
  const normalizedAddress = normalizeCustomTokenAddress(tokenAddress);
  const matchKey = `${tokenType}:${normalizedAddress.toLowerCase()}`;

  let savedCustomTokens: EvmSavedCustomTokens =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    );
  if (!savedCustomTokens?.[chain.chainId]) {
    return;
  }

  const savedChainTokens = savedCustomTokens[chain.chainId];
  const nextMetadata =
    tokenType === EVMSmartContractType.ERC20
      ? await enrichCustomErc20MetadataWithCoingeckoId(
          chain,
          normalizedAddress,
          metadata,
          savedChainTokens,
        )
      : metadata;

  savedCustomTokens[chain.chainId] = savedChainTokens.map((t) => {
    if (
      `${t.type}:${normalizeCustomTokenAddress(t.address).toLowerCase()}` ===
      matchKey
    ) {
      return normalizeCustomToken({
        ...t,
        address: normalizedAddress,
        type: tokenType,
        metadata: nextMetadata,
      });
    }
    return normalizeCustomToken(t);
  });

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    savedCustomTokens,
  );
};

const getCustomTokens = async (chain: EvmChain, walletAddress: string) => {
  void walletAddress;
  const savedCustomTokens: EvmSavedCustomTokens =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
    );

  if (!savedCustomTokens) return [] as EvmCustomToken[];
  const tokens = savedCustomTokens[chain.chainId];
  if (!tokens) return [] as EvmCustomToken[];

  const dedupedTokens: EvmCustomToken[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const normalizedAddress = normalizeCustomTokenAddress(token.address);
    const key = `${token.type}:${normalizedAddress.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    dedupedTokens.push(
      normalizeCustomToken({
        ...token,
        address: normalizedAddress,
      }),
    );
    seen.add(key);
  }

  return dedupedTokens;
};

const getCustomTokensForAllWallets = async (chain: EvmChain) => {
  return getCustomTokens(chain, '');
};

const addCustomNft = async (
  chain: EvmChain,
  walletAddress: string,
  nftToAdd: EvmCustomNft,
) => {
  const normalizedWalletAddress = normalizeCustomWalletKey(walletAddress);
  let savedCustomNfts: EvmSavedCustomNfts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    );

  if (!savedCustomNfts) {
    savedCustomNfts = {};
  }
  if (!savedCustomNfts[chain.chainId]) {
    savedCustomNfts[chain.chainId] = {};
  }

  const legacyWalletEntries =
    walletAddress !== normalizedWalletAddress
      ? savedCustomNfts[chain.chainId][walletAddress]
      : undefined;
  const normalizedWalletEntries =
    savedCustomNfts[chain.chainId][normalizedWalletAddress];

  const mergedWalletEntries = [
    ...(normalizedWalletEntries ?? []),
    ...(legacyWalletEntries ?? []),
  ];
  const normalizedNft = normalizeCustomNft(nftToAdd);
  const upsertKey = `${normalizedNft.type}:${normalizedNft.address.toLowerCase()}`;
  const nextEntries = mergedWalletEntries.filter(
    (entry) =>
      `${entry.type}:${normalizeCustomTokenAddress(entry.address).toLowerCase()}` !==
      upsertKey,
  );

  nextEntries.push(normalizedNft);
  savedCustomNfts[chain.chainId][normalizedWalletAddress] =
    nextEntries.map(normalizeCustomNft);
  if (walletAddress !== normalizedWalletAddress) {
    delete savedCustomNfts[chain.chainId][walletAddress];
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    savedCustomNfts,
  );
};

const updateCustomNft = async (
  chain: EvmChain,
  walletAddress: string,
  contractAddress: string,
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155,
  tokenIds: string[],
  collectionName?: string,
) => {
  const normalizedWalletAddress = normalizeCustomWalletKey(walletAddress);
  const normalizedAddress = normalizeCustomTokenAddress(contractAddress);
  const matchKey = `${type}:${normalizedAddress.toLowerCase()}`;

  let savedCustomNfts: EvmSavedCustomNfts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    );
  if (!savedCustomNfts?.[chain.chainId]) {
    return;
  }

  const replaceInList = (entries: EvmCustomNft[]) =>
    entries.map((entry) => {
      if (
        `${entry.type}:${normalizeCustomTokenAddress(entry.address).toLowerCase()}` ===
        matchKey
      ) {
        return normalizeCustomNft({
          address: normalizedAddress,
          type,
          tokenIds,
          collectionName,
        });
      }
      return normalizeCustomNft(entry);
    });

  const applyToKey = (addr: string) => {
    const entries = savedCustomNfts![chain.chainId][addr];
    if (!entries?.length) {
      return;
    }
    savedCustomNfts![chain.chainId][addr] = replaceInList(entries);
  };

  applyToKey(normalizedWalletAddress);
  if (walletAddress !== normalizedWalletAddress) {
    applyToKey(walletAddress);
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    savedCustomNfts,
  );
};

const removeCustomNft = async (
  chain: EvmChain,
  walletAddress: string,
  contractAddress: string,
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155,
) => {
  const normalizedWalletAddress = normalizeCustomWalletKey(walletAddress);
  const normalizedAddress = normalizeCustomTokenAddress(contractAddress);
  const removeKey = `${type}:${normalizedAddress.toLowerCase()}`;

  let savedCustomNfts: EvmSavedCustomNfts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    );
  if (!savedCustomNfts?.[chain.chainId]) {
    return;
  }

  const filterOut = (entries: EvmCustomNft[]) =>
    entries.filter(
      (entry) =>
        `${entry.type}:${normalizeCustomTokenAddress(entry.address).toLowerCase()}` !==
        removeKey,
    );

  const applyToKey = (addr: string) => {
    const entries = savedCustomNfts![chain.chainId][addr];
    if (!entries?.length) {
      return;
    }
    const next = filterOut(entries);
    if (next.length === 0) {
      delete savedCustomNfts![chain.chainId][addr];
    } else {
      savedCustomNfts![chain.chainId][addr] = next.map(normalizeCustomNft);
    }
  };

  applyToKey(normalizedWalletAddress);
  if (walletAddress !== normalizedWalletAddress) {
    applyToKey(walletAddress);
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    savedCustomNfts,
  );
};

const getCustomNfts = async (chain: EvmChain, walletAddress: string) => {
  const normalizedWalletAddress = normalizeCustomWalletKey(walletAddress);
  const savedCustomNfts: EvmSavedCustomNfts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
    );

  if (!savedCustomNfts?.[chain.chainId]) {
    return [] as EvmCustomNft[];
  }

  const nfts = [
    ...(savedCustomNfts[chain.chainId][normalizedWalletAddress] ?? []),
    ...(walletAddress !== normalizedWalletAddress
      ? (savedCustomNfts[chain.chainId][walletAddress] ?? [])
      : []),
  ];

  const dedupedNfts: EvmCustomNft[] = [];
  const seen = new Set<string>();

  for (const nft of nfts) {
    const normalizedNft = normalizeCustomNft(nft);
    const key = `${normalizedNft.type}:${normalizedNft.address.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    dedupedNfts.push(normalizedNft);
    seen.add(key);
  }

  return dedupedNfts;
};

const getCustomNftCollectionsForWallet = async (
  chain: EvmChain,
  walletAddress: string,
) => {
  const customNfts = await getCustomNfts(chain, walletAddress);
  const provider = await EthersUtils.getProvider(chain);

  const collections = await Promise.all(
    customNfts.map(async (nft) => {
      const normalizedNft = normalizeCustomNft(nft);
      const ownedTokenIds = await getOwnedCustomNftTokenIds(
        chain,
        walletAddress,
        normalizedNft.address,
        normalizedNft.type,
        normalizedNft.tokenIds,
      );

      if (!ownedTokenIds.length) {
        return undefined;
      }

      const metadataContract = new ethers.Contract(
        normalizedNft.address,
        ContractMetadataAbi,
        provider,
      );
      const [name, symbol] = await Promise.all([
        safeGetContractTextValue(metadataContract, 'name'),
        safeGetContractTextValue(metadataContract, 'symbol'),
      ]);
      const nftContract = new ethers.Contract(
        normalizedNft.address,
        normalizedNft.type === EVMSmartContractType.ERC1155
          ? ERC1155Abi
          : ERC721Abi,
        provider,
      );

      const collectionItems = await Promise.all(
        ownedTokenIds.map(async (tokenId) => {
          const metadata = await EvmNFTUtils.getMetadata(
            normalizedNft.type,
            tokenId,
            nftContract,
          );

          if (normalizedNft.type === EVMSmartContractType.ERC1155) {
            const balance = await nftContract.balanceOf(walletAddress, tokenId);
            return {
              id: tokenId,
              balance: Number(balance),
              metadata,
            } as EvmErc1155TokenCollectionItem;
          }

          return {
            id: tokenId,
            metadata,
          } as EvmErc721TokenCollectionItem;
        }),
      );

      const tokenInfo = {
        type: normalizedNft.type,
        name:
          normalizedNft.collectionName?.trim() ||
          name ||
          EvmFormatUtils.formatAddress(normalizedNft.address),
        symbol,
        logo: '',
        chainId: chain.chainId,
        backgroundColor: '',
        priceUsd: 0,
        contractAddress: normalizedNft.address,
        possibleSpam: false,
        verifiedContract: true,
        isProxy: false,
        proxyTarget: null,
      };

      if (normalizedNft.type === EVMSmartContractType.ERC1155) {
        return {
          tokenInfo: tokenInfo as EvmSmartContractInfoErc1155,
          collection: collectionItems as EvmErc1155TokenCollectionItem[],
        } as EvmErc1155Token;
      }

      return {
        tokenInfo: tokenInfo as EvmSmartContractInfoErc721,
        collection: collectionItems as EvmErc721TokenCollectionItem[],
      } as EvmErc721Token;
    }),
  );

  return collections.filter(Boolean) as (EvmErc721Token | EvmErc1155Token)[];
};

const getCustomErc20TokenInfos = async (
  chain: EvmChain,
  walletAddress: string,
) => {
  const customTokens = await getCustomTokens(chain, walletAddress);
  const tokenInfos = await Promise.all(
    customTokens
      .filter((token) => token.type === EVMSmartContractType.ERC20)
      .map(async (token) => {
        if (token.metadata?.type === EVMSmartContractType.ERC20) {
          const m = token.metadata;
          return buildCustomErc20TokenInfo(chain, token.address, {
            name: m.name,
            symbol: m.symbol,
            decimals: m.decimals,
            logo: m.logo,
            coingeckoId: m.coingeckoId,
          });
        }

        if (chain.isCustom === true) {
          return undefined;
        }

        const tokenInfo = await getTokenInfo(chain.chainId, token.address);
        return tokenInfo.type === EVMSmartContractType.ERC20
          ? (tokenInfo as EvmSmartContractInfoErc20)
          : undefined;
      }),
  );

  return tokenInfos.filter(Boolean) as EvmSmartContractInfoErc20[];
};

const getAllowance = async (
  chain: EvmChain,
  walletAddress: string,
  tokenAddress: string,
  spenderAddress: string,
) => {
  const provider = await EthersUtils.getProvider(chain);
  const contract = new ethers.Contract(tokenAddress, Erc20Abi, provider);
  const allowance = await contract.allowance(walletAddress, spenderAddress);
  return allowance;
};

const getBalanceDecimals = (
  tokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20,
) => {
  return tokenInfo.type === EVMSmartContractType.ERC20 ? tokenInfo.decimals : 8;
};

const buildBalanceDetails = (
  balance: EvmTokenBalanceResult,
  amount: number,
  tokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20,
): BalanceDetails => {
  const estimatedAfterBalance = new Decimal(balance.balanceInteger).sub(amount);

  return {
    symbol: tokenInfo.symbol,
    before: `${balance.formattedBalance} ${tokenInfo.symbol}`,
    estimatedAfter: `${EvmFormatUtils.formatTokenBalance(
      estimatedAfterBalance.toString(),
      getBalanceDecimals(tokenInfo),
    )}  ${tokenInfo.symbol}`,
    insufficientBalance: estimatedAfterBalance.toNumber() < 0,
  };
};

const getEstimatedGasFee = (selectedFee?: GasFeeEstimationBase) => {
  if (!selectedFee || GasFeeUtils.isGasFeeEstimateInvalid(selectedFee)) {
    return undefined;
  }
  return new Decimal(selectedFee.estimatedFeeInEth.toString());
};

const getBalanceInfo = async (
  walletAddress: string,
  chain: EvmChain,
  tokenInfo: EvmSmartContractInfo,
  amount: number,
  selectedFee?: GasFeeEstimationBase,
  /** When ERC20 pays gas in native currency; skips duplicate native/light-node fetch when already loaded (e.g. send-tx dialog) */
  prefetchedNativeForGasFee?: EvmSmartContractInfoNative,
): Promise<BalanceInfo> => {
  const balance = (await EvmTokensUtils.getTokenBalance(
    walletAddress,
    chain,
    tokenInfo,
  )) as EvmTokenBalanceResult;
  const transferAmount = new Decimal(amount);
  const estimatedGasFee = getEstimatedGasFee(selectedFee);

  if (tokenInfo.type === EVMSmartContractType.NATIVE) {
    return {
      mainBalance: buildBalanceDetails(
        balance,
        estimatedGasFee
          ? transferAmount.add(estimatedGasFee).toNumber()
          : transferAmount.toNumber(),
        tokenInfo as EvmSmartContractInfoNative,
      ),
    };
  }

  const transferTokenInfo = tokenInfo as EvmSmartContractInfoErc20;
  const balanceInfo: BalanceInfo = {
    mainBalance: buildBalanceDetails(
      balance,
      transferAmount.toNumber(),
      transferTokenInfo,
    ),
  };

  if (!estimatedGasFee) return balanceInfo;

  const mainTokenInfo =
    prefetchedNativeForGasFee ??
    ((await EvmTokensUtils.getMainTokenInfo(
      chain,
    )) as EvmSmartContractInfoNative);
  const mainTokenBalance = (await EvmTokensUtils.getTokenBalance(
    walletAddress,
    chain,
    mainTokenInfo,
  )) as EvmTokenBalanceResult;

  balanceInfo.feeBalance = buildBalanceDetails(
    mainTokenBalance,
    estimatedGasFee.toNumber(),
    mainTokenInfo,
  );

  return balanceInfo;
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
  buildFallbackNativeTokenInfo,
  displayValue,
  getTokenInfo,
  fetchErc20NameAndDecimalsFromChain,
  getTokenType,
  normalizeAbi,
  filterTokensBasedOnSettings,
  manualDiscoverErc20Tokens,
  manualDiscoverNfts,
  addCustomToken,
  removeCustomToken,
  updateCustomToken,
  getCustomTokens,
  addCustomNft,
  updateCustomNft,
  removeCustomNft,
  getCustomNfts,
  detectCustomNftType,
  getOwnedCustomNftTokenIds,
  getCustomNftCollectionsForWallet,
  getCustomErc20TokenInfos,
  mergeCustomErc20TokenInfos,
  getAllowance,
  getBalanceInfo,
  getCustomTokensForAllWallets,
};

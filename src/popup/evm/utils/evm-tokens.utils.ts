import {
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmCustomToken,
  EvmSavedCustomTokens,
} from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EvmLightNodeContractResponse } from '@popup/evm/interfaces/evm-light-node.interface';
import type {
  BalanceDetails,
  BalanceInfo,
} from '@dialog/components/balance-change-card/balance-change-card.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import {
  AbiList,
  ERC1155Abi,
  Erc20Abi,
  ERC721Abi,
} from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const SHORT_BALANCE_DECIMALS = 5;
const SHORT_BALANCE_ZERO_DISPLAY = FormatUtils.withCommas(
  0,
  SHORT_BALANCE_DECIMALS,
  false,
);

const formatShortBalance = (balanceInteger: number) => {
  const short = FormatUtils.withCommas(
    balanceInteger,
    SHORT_BALANCE_DECIMALS,
    false,
  );

  return `${
    balanceInteger > 0 && short === SHORT_BALANCE_ZERO_DISPLAY ? '~' : ''
  }${short}`;
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
  const mainToken = tokens.find(
    (token) =>
      token.tokenInfo.symbol.toLowerCase() === chain.mainToken.toLowerCase(),
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

const getTokenBalances = async (
  walletAddress: string,
  chain: EvmChain,
  tokensMetadata: EvmSmartContractInfo[],
) => {
  const balancesPromises: Promise<EvmTokenBalanceResult | undefined>[] =
    tokensMetadata.map(async (token) =>
      getTokenBalance(walletAddress, chain, token),
    );

  const result = await Promise.all(balancesPromises);
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
        balanceInteger = Number(parseFloat(ethers.formatEther(balance)));
        formattedBalance = FormatUtils.withCommas(balanceInteger, 8, true);
        shortFormattedBalance = formatShortBalance(balanceInteger);

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
        shortFormattedBalance = formatShortBalance(balanceInteger);

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
): Promise<EvmSmartContractInfo> => {
  const result = await EvmLightNodeUtils.getContract(chainId, address);
  return mapLightNodeContractToTokenInfo(chainId, result);
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
  return FormatUtils.withCommas(
    ethers.formatUnits(value, decimals),
    decimals,
    true,
  );
};
const formatEtherValue = (value: string) => {
  return FormatUtils.withCommas(ethers.formatEther(value), 18, true);
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

const getMainTokenInfo = async (
  chain: EvmChain,
): Promise<EvmSmartContractInfoNative> => {
  const response = (await KeychainApi.get(
    `evm/light-node/native/${Number(chain.chainId)}`,
  )) as NativeTokenApiResponse;
  return {
    type: EVMSmartContractType.NATIVE,
    name: response.metadata.name,
    symbol: response.metadata.symbol,
    logo: response.metadata.logoUrl,
    chainId: chain.chainId,
    backgroundColor: '',
    coingeckoId: '',
    priceUsd: response.price?.priceUsd ?? 0,
    createdAt: response.price?.fetchedAt ?? Date.now(),
    categories: [],
  };
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
    if (
      referenceAbi.methods.every((method: string) =>
        abiMethods.includes(method),
      )
    )
      return referenceAbi.type;
  }

  return null;
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
    estimatedAfter: `${FormatUtils.withCommas(
      estimatedAfterBalance.toString(),
      getBalanceDecimals(tokenInfo),
      true,
    )}  ${tokenInfo.symbol}`,
    insufficientBalance: estimatedAfterBalance.toNumber() < 0,
  };
};

const getEstimatedGasFee = (selectedFee?: GasFeeEstimationBase) => {
  if (!selectedFee || selectedFee.estimatedFeeInEth.equals(-1)) return undefined;
  return new Decimal(selectedFee.estimatedFeeInEth.toString());
};

const getBalanceInfo = async (
  walletAddress: string,
  chain: EvmChain,
  tokenInfo: EvmSmartContractInfo,
  amount: number,
  selectedFee?: GasFeeEstimationBase,
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

  const mainTokenInfo = (await EvmTokensUtils.getMainTokenInfo(
    chain,
  )) as EvmSmartContractInfoNative;
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
  displayValue,
  getTokenInfo,
  getTokenType,
  normalizeAbi,
  filterTokensBasedOnSettings,
  getPopularTokensForChain,
  manualDiscoverErc20Tokens,
  manualDiscoverNfts,
  addCustomToken,
  getCustomTokens,
  getAllowance,
  getBalanceInfo,
};

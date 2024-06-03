import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  EVMTokenType,
  EvmTokenInfoShort,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import {
  BlockExporerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SigningKey, Wallet, ethers } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import { AsyncUtils } from 'src/utils/async.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getTotalBalanceInUsd = (tokens: EVMToken[], prices: EvmPrices) => {
  return tokens.reduce((a, b) => {
    const price = prices[b.tokenInfo.symbol] ?? 0;
    return (
      a +
        price.usd *
          Number(
            ethers.formatUnits(
              b.balance,
              b.tokenInfo.type === EVMTokenType.ERC20
                ? b.tokenInfo.decimals
                : 18,
            ),
          ) ?? 1
    );
  }, 0);
};

const getTotalBalanceInMainToken = (
  tokens: EVMToken[],
  chain: EvmChain,
  prices: EvmPrices,
) => {
  const mainToken = tokens.find(
    (token) =>
      token.tokenInfo.symbol.toLowerCase() === chain.mainToken.toLowerCase(),
  );
  if (mainToken) {
    const valueInUsd = getTotalBalanceInUsd(tokens, prices);
    return valueInUsd / (prices[mainToken.tokenInfo.symbol]?.usd ?? 1);
  } else return 0;
};

const getTokenBalances = async (
  walletAddress: string,
  walletSigningKey: SigningKey,
  chain: EvmChain,
) => {
  let tokensMetadata = await getTokenListForWalletAddress(walletAddress, chain);

  const balances: EVMToken[] = [];

  const provider = EthersUtils.getProvider(chain.network);
  const connectedWallet = new Wallet(walletSigningKey, provider);
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
  for (const token of tokensMetadata) {
    try {
      let formattedBalance;
      let balance;
      if (token.type === EVMTokenType.NATIVE) {
        balance = await provider.getBalance(walletAddress);
        formattedBalance = FormatUtils.formatCurrencyValue(
          Number(parseFloat(ethers.formatEther(balance))),
        );
      } else {
        const contract = new ethers.Contract(
          token.address!,
          Erc20Abi,
          connectedWallet,
        );
        balance = await contract.balanceOf(walletAddress);
        formattedBalance = FormatUtils.formatCurrencyValue(
          Number(parseFloat(ethers.formatUnits(balance, token.decimals))),
        );
      }

      balances.push({
        tokenInfo: token,
        formattedBalance: formattedBalance,
        balance: balance,
      });
    } catch (err) {
      Logger.error('Error while formatting evm balances', err);
    }
  }

  let localTokens = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
  );
  if (!localTokens) localTokens = {};
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_TOKENS_METADATA,
    { ...localTokens, [chain.chainId]: [...tokensMetadata] },
  );

  return [...balances];
};

const getTokenListForWalletAddress = async (
  walletAddress: string,
  chain: EvmChain,
): Promise<EvmTokenInfoShort[]> => {
  switch (chain.blockExplorer?.type) {
    case BlockExporerType.ETHERSCAN: {
      let result;
      let addresses: string[] = [];

      const limit = 10000;
      let offset = 0;

      do {
        let response = await EtherscanApi.get(walletAddress, chain, offset);
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
      if (addresses.length > 0) {
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
      }

      return tokensMetadata;
    }
    default:
      return [];
  }
};

const sortTokens = (tokens: EVMToken[], prices: EvmPrices) => {
  return tokens.sort((tokenA, tokenB) => {
    const priceA = prices[tokenA.tokenInfo.symbol] ?? 0;
    const priceB = prices[tokenB.tokenInfo.symbol] ?? 0;
    // console.log({ priceA, priceB });
    if (tokenA.tokenInfo.type === EVMTokenType.NATIVE) return -1;
    else if (tokenB.tokenInfo.type === EVMTokenType.NATIVE) return 1;
    else {
      const tokenAPrice =
        priceA.usd *
          Number(
            ethers.formatUnits(tokenA.balance, tokenA.tokenInfo.decimals ?? 18),
          ) ?? 1;
      const tokenBPrice =
        priceB.usd *
          Number(
            ethers.formatUnits(tokenB.balance, tokenB.tokenInfo.decimals ?? 18),
          ) ?? 1;
      // console.log({ name: tokenB.tokenInfo.symbol, tokenAPrice });
      // console.log({ name: tokenA.tokenInfo.symbol, tokenBPrice });
      return tokenBPrice - tokenAPrice;
    }
  });
};

export const EvmTokensUtils = {
  getTotalBalanceInMainToken,
  getTotalBalanceInUsd,
  getTokenBalances,
  sortTokens,
};

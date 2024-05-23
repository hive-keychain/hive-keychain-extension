import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  EVMTokenInfoShort,
  EVMTokenType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { KeychainApi } from '@popup/hive/api/keychain';
import {
  BlockExporerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SigningKey, Wallet, ethers } from 'ethers';
import ArrayUtils from 'src/utils/array.utils';
import { AsyncUtils } from 'src/utils/async.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getTotalBalanceInUsd = (tokens: EVMToken[]) => {
  // TODO fix when get price done
  // return tokens.reduce((a, b) => a + b.usdValue ?? 1, 0);
  return tokens.reduce((a, b) => a + 1, 0);
};

const getTotalBalanceInMainToken = (tokens: EVMToken[], chain: EvmChain) => {
  const mainToken = tokens.find(
    (token) => token.tokenInfo.symbol === chain.mainToken,
  );
  if (mainToken) {
    const valueInUsd = getTotalBalanceInUsd(tokens);
    // TODO fix when get price done
    // return valueInUsd / parseFloat(mainToken?.usdPrice);
    return valueInUsd / 1;
  } else return 0;
};

const getTokenBalances = async (
  walletAddress: string,
  walletSigningKey: SigningKey,
  chain: EvmChain,
) => {
  // TODO get tokens from local storage
  const tokens = await getTokenListForWalletAddress(walletAddress, chain);

  const balances: EVMToken[] = [];

  const provider = EthersUtils.getProvider(chain.network);
  const connectedWallet = new Wallet(walletSigningKey, provider);

  for (const token of tokens) {
    const contract = new ethers.Contract(
      token.address!,
      Erc20Abi,
      connectedWallet,
    );

    let formattedBalance;
    let balance;
    try {
      balance = await contract.balanceOf(walletAddress);
      formattedBalance = FormatUtils.formatCurrencyValue(
        Number(parseFloat(ethers.formatUnits(balance, token.decimals))),
      );
      balances.push({
        tokenInfo: token,
        formattedBalance: formattedBalance,
        balance: balance,
      });
    } catch (err) {
      Logger.error('Error while formatting evm balances', err);
    }
  }
  // TODO sort by usdValue

  const mainTokenBalance = await provider.getBalance(walletAddress);
  const mainTokenFormatedBalance = FormatUtils.formatCurrencyValue(
    Number(parseFloat(ethers.formatEther(mainTokenBalance))),
  );

  return [
    {
      tokenInfo: {
        type: EVMTokenType.NATIVE,
        name: chain.mainToken,
        symbol: chain.mainToken,
        chainId: chain.chainId,
        logo: chain.logo,
        backgroundColor: '',
      } as EVMTokenInfoShort,
      formattedBalance: mainTokenFormatedBalance,
      balance: mainTokenBalance,
    } as EVMToken,
    ...balances,
  ];
};

const getTokenListForWalletAddress = async (
  walletAddress: string,
  chain: EvmChain,
): Promise<EVMTokenInfoShort[]> => {
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
          if (!addresses.includes(token.contractAddress)) {
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
          const localTokens = await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.EVM_TOKENS_METADATA,
          );
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.EVM_TOKENS_METADATA,
            ArrayUtils.mergeWithoutDuplicate(
              localTokens,
              tokensMetadata,
              'symbol',
            ),
          );
        } catch (err) {
          Logger.error('Error while fetching tokens metadata', err);
          tokensMetadata =
            (await LocalStorageUtils.getValueFromLocalStorage(
              LocalStorageKeyEnum.EVM_TOKENS_METADATA,
            )) ?? [];
        }
      }

      return tokensMetadata;
    }
    default:
      return [];
  }
};

export const EvmTokensUtils = {
  getTotalBalanceInMainToken,
  getTotalBalanceInUsd,
  getTokenBalances,
};

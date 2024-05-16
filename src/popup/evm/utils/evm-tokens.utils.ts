import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import { EVMBalances } from '@popup/evm/interfaces/active-account.interface';
import {
  EVMTokenInfoShort,
  EVMTokenType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import EthersUtils from '@popup/evm/utils/ethers.utils';
import { KeychainApi } from '@popup/hive/api/keychain';
import {
  BlockExporerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { SigningKey, Wallet, ethers } from 'ethers';
import { AsyncUtils } from 'src/utils/async.utils';
import FormatUtils from 'src/utils/format.utils';

const getTotalBalanceInUsd = (tokens: EVMBalances[]) => {
  // TODO fix when get price done
  // return tokens.reduce((a, b) => a + b.usdValue ?? 1, 0);
  return tokens.reduce((a, b) => a + 1, 0);
};

const getTotalBalanceInMainToken = (tokens: EVMBalances[], chain: EvmChain) => {
  const mainToken = tokens.find(
    (token) => token.tokenInfo.symbol === chain.mainToken,
  );
  if (mainToken) {
    const valueInUsd = getTotalBalanceInUsd(tokens);
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

  const balances = [];

  const provider = EthersUtils.getProvider(chain.network);
  const connectedWallet = new Wallet(walletSigningKey, provider);

  for (const token of tokens) {
    const contract = new ethers.Contract(
      token.address!,
      Erc20Abi,
      connectedWallet,
    );

    let formatedBalance;
    let balance;
    try {
      balance = await contract.balanceOf(walletAddress);
      formatedBalance = FormatUtils.formatCurrencyValue(
        Number(parseFloat(ethers.formatUnits(balance, token.decimals))),
      );
    } catch (err) {}
    balances.push({
      tokenInfo: token,
      formatedBalance: formatedBalance,
      balance: balance,
    });
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
      formatedBalance: mainTokenFormatedBalance,
      balance: mainTokenBalance,
    },
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
      if (addresses.length > 0)
        tokensMetadata = await KeychainApi.get(
          `evm/tokensInfoShort/${chain.chainId}/${addresses?.join(',')}`,
        );

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

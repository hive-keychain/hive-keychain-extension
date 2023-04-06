import { KeychainSwapApi } from '@api/keychain-swap';
import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import Config from 'src/config';
import { BaseCurrencies } from 'src/utils/currency.utils';
import TokensUtils from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';

export interface SwapStep {
  step: SwapStepType;
  estimate: number;
  startToken: string;
  endToken: string;
  provider: string;
}

export enum SwapStepType {
  DEPOSIT_TO_HIVE_ENGINE = 'DEPOSIT_TO_HIVE_ENGINE',
  WITHDRAWAL_FROM_HIVE_ENGINE = 'WITHDRAWAL_FROM_HIVE_ENGINE',
  CONVERT_INTERNAL_MARKET = 'CONVERT_INTERNAL_MARKET',
  SWAP_TOKEN = 'SWAP',
  BUY_ON_HIVE_ENGINE_MARKET = 'BUY_ON_HIVE_ENGINE_MARKET',
  SELL_ON_HIVE_ENGINE_MARKET = 'SELL_ON_HIVE_ENGINE_MARKET',
  BUY_ON_MARKET = 'BUY_ON_MARKET',
  SELL_ON_MARKET = 'SELL_ON_MARKET',
}

const getSwapTokenStartList = async (account: ExtendedAccount) => {
  let userTokenList: TokenBalance[] = await TokensUtils.getUserBalance(
    account.name,
  );
  userTokenList = userTokenList.filter(
    (token) => parseFloat(token.balance) > 0,
  );
  userTokenList = userTokenList.sort((a, b) =>
    b.symbol.toLowerCase() > a.symbol.toLowerCase() ? -1 : 1,
  );

  if (Asset.fromString(account.balance.toString()).amount > 0) {
    userTokenList.unshift({
      account: account.name,
      balance: Asset.fromString(account.balance.toString()).amount.toString(),
      symbol: BaseCurrencies.HIVE.toUpperCase(),
    } as TokenBalance);
  }
  if (Asset.fromString(account.hbd_balance.toString()).amount > 0) {
    userTokenList.unshift({
      account: account.name,
      balance: Asset.fromString(
        account.hbd_balance.toString(),
      ).amount.toString(),
      symbol: BaseCurrencies.HBD.toUpperCase(),
    } as TokenBalance);
  }

  return userTokenList;
};

const getSwapTokenEndList = () => {};

const getEstimate = async (
  startToken: string,
  endToken: string,
  amount: string,
) => {
  if (startToken && endToken && amount.length && parseFloat(amount) > 0) {
    const estimate = await KeychainSwapApi.get(
      `token-swap/estimate/${startToken}/${endToken}/${parseFloat(amount)}`,
    );
    return estimate;
  }
};

const saveEstimate = async (
  steps: SwapStep[],
  slipperage: number,
  startToken: string,
  endToken: string,
  amount: number,
): Promise<string> => {
  return await KeychainSwapApi.post(`token-swap/estimate/save`, {
    slipperage,
    steps,
    startToken,
    endToken,
    amount,
  });
};

const processSwap = async (
  estimateId: string,
  startToken: string,
  amount: number,
  activeAccount: ActiveAccount,
) => {
  if (
    startToken === BaseCurrencies.HBD.toUpperCase() ||
    startToken === BaseCurrencies.HIVE.toUpperCase()
  ) {
    const status = await TransferUtils.sendTransfer(
      activeAccount.name!,
      Config.swaps.swapAccount,
      `${amount.toFixed(3)} ${startToken}`,
      estimateId,
      false,
      0,
      0,
      activeAccount.keys.active!,
    );
    return status?.tx_id;
  } else {
    const tokenInfo = await TokensUtils.getTokenInfo(startToken);
    const status = await TokensUtils.sendToken(
      startToken,
      Config.swaps.swapAccount,
      `${amount.toFixed(tokenInfo.precision)}`,
      estimateId,
      activeAccount.keys.active!,
      activeAccount.name!,
    );
    return status.tx_id;
  }
};

export const SwapTokenUtils = {
  getSwapTokenStartList,
  getSwapTokenEndList,
  processSwap,
  getEstimate,
  saveEstimate,
};

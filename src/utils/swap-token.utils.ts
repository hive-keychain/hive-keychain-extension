import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { TokenBalance } from '@interfaces/tokens.interface';
import { BaseCurrencies } from 'src/utils/currency.utils';
import TokensUtils from 'src/utils/tokens.utils';

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
      symbol: BaseCurrencies.HIVE,
    } as TokenBalance);
  }
  if (Asset.fromString(account.hbd_balance.toString()).amount > 0) {
    userTokenList.unshift({
      account: account.name,
      balance: Asset.fromString(
        account.hbd_balance.toString(),
      ).amount.toString(),
      symbol: BaseCurrencies.HBD,
    } as TokenBalance);
  }

  return userTokenList;
};

const getSwapTokenEndList = () => {};

const processSwap = () => {};

const getFinalValue = async (
  startToken: BaseCurrencies,
  endToken: BaseCurrencies,
  amount: string,
) => {
  if (amount.length && parseFloat(amount) > 0) return 13.5;
};

export const SwapTokenUtils = {
  getSwapTokenStartList,
  getSwapTokenEndList,
  processSwap,
  getFinalValue,
};

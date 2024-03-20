import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import HiveUtils from '@popup/hive/utils/hive.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import {
  PortfolioBalance,
  UserPortfolio,
} from 'src/portfolio/portfolio.interface';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const loadAndSetRPCsAndApis = async () => {
  //load rpc.
  const current_rpc: Rpc = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
  let rpc = current_rpc || Config.rpc.DEFAULT;
  const HiveEngineConfig = {
    rpc: Config.hiveEngine.rpc,
    mainnet: Config.hiveEngine.mainnet,
    accountHistoryApi: Config.hiveEngine.accountHistoryApi,
  };

  //set rpcs by hand
  HiveTxUtils.setRpc(rpc);
  HiveEngineConfigUtils.setActiveApi(HiveEngineConfig.rpc);
  HiveEngineConfigUtils.setActiveAccountHistoryApi(
    HiveEngineConfig.accountHistoryApi,
  );
};

const loadUsersTokens = async (accountNames: string[]) => {
  let tempTokenBalanceList: any[] = [];

  for (const username of accountNames) {
    let tokensBalance: TokenBalance[] = await TokensUtils.getUserBalance(
      username,
    );
    tempTokenBalanceList.push({
      username: username,
      tokensBalance: tokensBalance,
    });
  }

  return tempTokenBalanceList;
};

const getPortfolio = async (extendedAccounts: ExtendedAccount[]) => {
  await PortfolioUtils.loadAndSetRPCsAndApis();
  const [globals, price, rewardFund] = await Promise.all([
    DynamicGlobalPropertiesUtils.getDynamicGlobalProperties(),
    HiveUtils.getCurrentMedianHistoryPrice(),
    HiveUtils.getRewardFund(),
  ]);
  const [prices, usersTokens, tokensMarket] = await Promise.all([
    CurrencyPricesUtils.getPrices() as unknown as CurrencyPrices,
    loadUsersTokens(extendedAccounts.map((acc: ExtendedAccount) => acc.name)),
    TokensUtils.getTokensMarket({}, 1000, 0, []),
  ]);

  const tokensFullList = getTokensFullList(usersTokens);

  const portfolio: UserPortfolio[] = [];

  for (const userTokens of usersTokens) {
    const userPortfolio = generateUserLayerTwoPortolio(
      userTokens,
      prices,
      tokensMarket,
    );
    portfolio.push({
      account: userTokens.username,
      balances: userPortfolio,
    });
  }

  const orderedTokenList = [
    'HIVE',
    'HBD',
    'HP',
    ...getOrderedTokenFullList(tokensFullList, portfolio),
  ];

  for (const userPortfolio of portfolio) {
    const {
      balance,
      savings_balance,
      savings_hbd_balance,
      vesting_shares,
      hbd_balance,
    } = extendedAccounts.find(
      (extAcc) => extAcc.name === userPortfolio.account,
    )!;
    const totalHIVE =
      Asset.fromString(balance.toString()).amount +
      Asset.fromString(savings_balance.toString()).amount;
    const totalHBD =
      Asset.fromString(hbd_balance.toString()).amount +
      Asset.fromString(savings_hbd_balance.toString()).amount;
    const totalVESTS = Asset.fromString(vesting_shares.toString()).amount;
    const totalHP = FormatUtils.toHP(totalVESTS.toString(), globals);
    userPortfolio.balances.push({
      symbol: 'HIVE',
      balance: totalHIVE,
      usdValue: totalHIVE * (prices.hive.usd ?? 1),
    });
    userPortfolio.balances.push({
      symbol: 'HBD',
      balance: totalHBD,
      usdValue: totalHBD * (prices.hive_dollar.usd ?? 1),
    });
    userPortfolio.balances.push({
      symbol: 'HP',
      balance: totalHP,
      usdValue: totalHP * (prices.hive.usd ?? 1),
    });
  }

  return [portfolio, orderedTokenList];
};

const getOrderedTokenFullList = (
  tokensFullList: string[],
  portfolio: UserPortfolio[],
) => {
  const maxTokens: { symbol: string; max: number }[] = [];

  for (const token of tokensFullList) {
    const max = Math.max(
      ...portfolio.map((userPortfolio) => {
        const tokenBalance = userPortfolio.balances.find(
          (balance) => balance.symbol === token,
        );
        return tokenBalance?.usdValue ?? 0;
      }),
    );
    maxTokens.push({ symbol: token, max: max });
  }
  return maxTokens.sort((a, b) => b.max - a.max).map((t) => t.symbol);
};

const generateUserLayerTwoPortolio = (
  userTokens: { username: string; tokensBalance: TokenBalance[] },
  prices: CurrencyPrices,
  tokensMarket: TokenMarket[],
) => {
  const userLayerTwoPortfolio: PortfolioBalance[] = [];
  for (const userToken of userTokens.tokensBalance) {
    userLayerTwoPortfolio.push(
      getPortfolioHETokenData(userToken, tokensMarket, prices),
    );
  }
  return userLayerTwoPortfolio;
};

const getTokensFullList = (
  usersTokens: { username: string; tokensBalance: TokenBalance[] }[],
) => {
  const tokensFullList: string[] = [];

  for (const userTokens of usersTokens) {
    for (const token of userTokens.tokensBalance) {
      if (!tokensFullList.includes(token.symbol)) {
        tokensFullList.push(token.symbol);
      }
    }
  }
  return tokensFullList;
};

const getPortfolioHETokenData = (
  tokenBalanceItem: TokenBalance,
  tokenMarket: TokenMarket[],
  currencyPrices: CurrencyPrices,
): PortfolioBalance => {
  const totalBalanceUsdValue = TokensUtils.getHiveEngineTokenValue(
    tokenBalanceItem,
    tokenMarket,
    currencyPrices!.hive!,
  );
  return {
    symbol: tokenBalanceItem.symbol,
    balance:
      +tokenBalanceItem.balance +
      +tokenBalanceItem.delegationsOut +
      +tokenBalanceItem.stake +
      +tokenBalanceItem.pendingUndelegations +
      +tokenBalanceItem.pendingUnstake,
    usdValue: totalBalanceUsdValue,
  };
};

const getTotals = (tableColumnsHeaders: string[], data: UserPortfolio[]) => {
  const tempTotalBalances: PortfolioBalance[] = [];
  tableColumnsHeaders.map((symbol) => {
    data.map(({ balances }) => {
      const foundToken = balances.find(
        (tokenBalance) => tokenBalance.symbol === symbol,
      );
      if (foundToken) {
        const foundTotalBalanceItem = tempTotalBalances.find(
          (item) => item.symbol === foundToken.symbol,
        );
        if (foundTotalBalanceItem) {
          foundTotalBalanceItem.balance += foundToken.balance;
          foundTotalBalanceItem.usdValue += foundToken.usdValue;
        } else {
          tempTotalBalances.push({
            symbol: foundToken.symbol,
            balance: foundToken.balance,
            usdValue: foundToken.usdValue,
          });
        }
      }
    });
  });
  return tempTotalBalances;
};

export const PortfolioUtils = {
  loadAndSetRPCsAndApis,
  getPortfolio,
  getTotals,
};

import type { ExtendedAccount } from '@hiveio/dhive';
import { Rpc } from '@interfaces/rpc.interface';
import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveInternalMarketUtils } from '@popup/hive/utils/hive-internal-market.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import HiveUtils from '@popup/hive/utils/hive.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Asset, CurrencyPrices, FormatUtils } from 'hive-keychain-commons';
import Config from 'src/config';
import {
  PortfolioBalance,
  UserPortfolio,
} from 'src/portfolio/portfolio.interface';
import { AsyncUtils } from 'src/utils/async.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

/**
 * Note: Will load rpc & set rpcs, from extension data or default values.
 */
const loadAndSetRPCsAndApis = async () => {
  const current_rpc: Rpc = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
  let rpc = current_rpc || Config.rpc.DEFAULT;
  const HiveEngineConfig = {
    rpc: Config.hiveEngine.rpc,
    mainnet: Config.hiveEngine.mainnet,
    accountHistoryApi: Config.hiveEngine.accountHistoryApi,
  };

  HiveTxUtils.setRpc(rpc);
  HiveEngineConfigUtils.setActiveApi(HiveEngineConfig.rpc);
  HiveEngineConfigUtils.setActiveAccountHistoryApi(
    HiveEngineConfig.accountHistoryApi,
  );
};

const loadUsersTokens = async (
  accountNames: string[],
  onProgress?: (currentAccountIndex: number, currentAccount: string) => void,
) => {
  let tempTokenBalanceList: any[] = [];

  let currentAccountIndex = 0;
  for (const username of accountNames) {
    currentAccountIndex++;
    if (onProgress) onProgress(currentAccountIndex, username);
    let tokensBalance: TokenBalance[] = await TokensUtils.getUserBalance(
      username,
    );
    tempTokenBalanceList.push({
      username: username,
      tokensBalance: tokensBalance,
    });
    await AsyncUtils.sleep(500);
  }

  return tempTokenBalanceList;
};

const loadTokenMarket = async () => {
  let tokensMarket: TokenMarket[] = [];
  let offset = 0;
  let tokens;
  do {
    tokens = await TokensUtils.getTokensMarket({}, 1000, offset, []);
    offset += 1000;
    tokensMarket = [...tokensMarket, ...tokens];
  } while (tokens.length === 1000);
  return tokensMarket;
};

const getPortfolio = async (
  extendedAccounts: ExtendedAccount[],
  onProgress?: (currentAccountIndex: number, currentAccount: string) => void,
) => {
  await PortfolioUtils.loadAndSetRPCsAndApis();
  const [globals, price, rewardFund] = await Promise.all([
    DynamicGlobalPropertiesUtils.getDynamicGlobalProperties(),
    HiveUtils.getCurrentMedianHistoryPrice(),
    HiveUtils.getRewardFund(),
  ]);
  const [prices, usersTokens, tokensMarket] = await Promise.all([
    CurrencyPricesUtils.getPrices() as unknown as CurrencyPrices,
    loadUsersTokens(
      extendedAccounts.map((acc: ExtendedAccount) => acc.name),
      onProgress,
    ),
    loadTokenMarket(),
  ]);

  const tokensFullList = getTokensFullList(usersTokens);

  const portfolio: UserPortfolio[] = [];
  const tokens = await TokensUtils.getAllTokens();
  const hiddenTokensList =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIDDEN_TOKENS,
    )) || [];
  for (const userTokens of usersTokens) {
    const userPortfolio = generateUserLayerTwoPortolio(
      userTokens,
      prices,
      tokensMarket,
      tokens,
      hiddenTokensList,
    );
    portfolio.push({
      account: userTokens.username,
      balances: userPortfolio,
      totalHive: 0,
      totalUSD: 0,
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
    const lockedInOrders =
      await HiveInternalMarketUtils.getHiveInternalMarketOrders(
        userPortfolio.account,
      );
    const totalHIVE =
      Asset.fromString(balance.toString()).amount +
      Asset.fromString(savings_balance.toString()).amount +
      lockedInOrders.hive;
    const totalHBD =
      Asset.fromString(hbd_balance.toString()).amount +
      Asset.fromString(savings_hbd_balance.toString()).amount +
      lockedInOrders.hbd;
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
  for (const userPortfolio of portfolio) {
    let totalUSD = 0;
    let totalHive = 0;
    for (const balance of userPortfolio.balances) {
      const tokenMarket = tokensMarket.find(
        (tm) => tm.symbol === balance.symbol,
      );
      totalUSD += balance.usdValue;
    }
    userPortfolio.totalUSD = totalUSD;
    userPortfolio.totalHive = userPortfolio.totalUSD / (prices?.hive?.usd ?? 0);
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
  tokens: Token[],
  hiddenTokensList: string[],
) => {
  const userLayerTwoPortfolio: PortfolioBalance[] = [];
  const userTokensList = userTokens.tokensBalance.filter(
    (token) => !hiddenTokensList.includes(token.symbol),
  );
  for (const userToken of userTokensList) {
    userLayerTwoPortfolio.push(
      getPortfolioHETokenData(userToken, tokensMarket, prices, tokens),
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
  tokens: Token[],
): PortfolioBalance => {
  const totalBalanceUsdValue = TokensUtils.getHiveEngineTokenValue(
    tokenBalanceItem,
    tokenMarket,
    currencyPrices!.hive!,
    tokens,
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

  for (const symbol of tableColumnsHeaders) {
    let totalForToken: PortfolioBalance | undefined = tempTotalBalances.find(
      (totalBalance) => totalBalance.symbol === symbol,
    );

    if (!totalForToken) {
      totalForToken = {
        symbol: symbol,
        balance: 0,
        usdValue: 0,
      };
    }
    tempTotalBalances.push(totalForToken);
    for (const userPortfolio of data) {
      const userTokenBalance = userPortfolio.balances.find(
        (balance) => balance.symbol === symbol,
      );

      if (userTokenBalance) {
        totalForToken.balance += userTokenBalance.balance;
        totalForToken.usdValue += userTokenBalance.usdValue;
      }
    }
  }
  return tempTotalBalances;
};

export const PortfolioUtils = {
  loadAndSetRPCsAndApis,
  getPortfolio,
  getTotals,
  getOrderedTokenFullList,
  generateUserLayerTwoPortolio,
};

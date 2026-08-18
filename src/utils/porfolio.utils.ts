import type { ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveInternalMarketUtils } from '@popup/hive/utils/hive-internal-market.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Asset } from 'hive-keychain-commons';
import Config from 'src/config';
import {
  PortfolioBalance,
  UserPortfolio,
} from 'src/portfolio/portfolio.interface';
import { AsyncUtils } from 'src/utils/async.utils';
import FormatUtils from 'src/utils/format.utils';
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
  const userTokenBalances: {
    username: string;
    tokensBalance: TokenBalance[];
  }[] = [];

  let currentAccountIndex = 0;
  for (const username of accountNames) {
    currentAccountIndex++;
    if (onProgress) onProgress(currentAccountIndex, username);
    const tokensBalance = await TokensUtils.getUserBalance(
      username,
    );
    userTokenBalances.push({
      username,
      tokensBalance,
    });
    if (currentAccountIndex < accountNames.length) {
      await AsyncUtils.sleep(500);
    }
  }

  return userTokenBalances;
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

export interface PortfolioLoadOptions {
  onProgress?: (
    currentAccountIndex: number,
    currentAccount: string,
  ) => void;
  loadTokens?: () => Promise<Token[]>;
}

export interface PortfolioLoadResult {
  portfolio: UserPortfolio[];
  orderedTokenList: string[];
  tokens: Token[];
}

const getPortfolio = async (
  extendedAccounts: ExtendedAccount[],
  options: PortfolioLoadOptions = {},
): Promise<PortfolioLoadResult> => {
  await PortfolioUtils.loadAndSetRPCsAndApis();
  const accountNames = extendedAccounts.map((account) => account.name);
  const [
    globals,
    prices,
    usersTokens,
    tokensMarket,
    tokens,
    hiddenTokensList,
    lockedOrdersEntries,
  ] = await Promise.all([
    DynamicGlobalPropertiesUtils.getDynamicGlobalProperties(),
    CurrencyPricesUtils.getPrices() as unknown as CurrencyPrices,
    loadUsersTokens(accountNames, options.onProgress),
    loadTokenMarket(),
    options.loadTokens?.() ?? TokensUtils.getAllTokens(),
    LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIDDEN_TOKENS,
    ),
    Promise.all(
      accountNames.map(async (accountName) =>
        [
          accountName,
          await HiveInternalMarketUtils.getHiveInternalMarketOrders(
            accountName,
          ),
        ] as const,
      ),
    ),
  ]);

  const tokensFullList = getTokensFullList(usersTokens);

  const portfolio: UserPortfolio[] = [];
  const hiddenTokenSymbols = Array.isArray(hiddenTokensList)
    ? hiddenTokensList
    : [];
  const lockedOrdersByAccount = new Map(lockedOrdersEntries);
  for (const userTokens of usersTokens) {
    const userPortfolio = generateUserLayerTwoPortolio(
      userTokens,
      prices,
      tokensMarket,
      tokens,
      hiddenTokenSymbols,
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
    const lockedInOrders = lockedOrdersByAccount.get(userPortfolio.account) ?? {
      hive: 0,
      hbd: 0,
    };
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
    for (const balance of userPortfolio.balances) {
      totalUSD += balance.usdValue;
    }
    userPortfolio.totalUSD = totalUSD;
    userPortfolio.totalHive = userPortfolio.totalUSD / (prices?.hive?.usd ?? 0);
  }

  return { portfolio, orderedTokenList, tokens };
};

const HIVE_CORE_TOKEN_SYMBOLS = ['HIVE', 'HBD', 'HP'] as const;

export type HivePortfolioDisplaySortItem = {
  symbol: string;
  usdValue: number | null;
};

const getHiveCoreTokenSortIndex = (symbol: string): number | null => {
  const normalizedSymbol = symbol.toUpperCase();
  const coreIndex = HIVE_CORE_TOKEN_SYMBOLS.indexOf(
    normalizedSymbol as (typeof HIVE_CORE_TOKEN_SYMBOLS)[number],
  );

  return coreIndex >= 0 ? coreIndex : null;
};

const compareHivePortfolioItemsByDisplayOrder = (
  left: HivePortfolioDisplaySortItem,
  right: HivePortfolioDisplaySortItem,
): number => {
  const leftOrder =
    getHiveCoreTokenSortIndex(left.symbol) ?? HIVE_CORE_TOKEN_SYMBOLS.length;
  const rightOrder =
    getHiveCoreTokenSortIndex(right.symbol) ?? HIVE_CORE_TOKEN_SYMBOLS.length;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return (right.usdValue ?? -1) - (left.usdValue ?? -1);
};

const sortHivePortfolioBalancesByDisplayOrder = (
  balances: PortfolioBalance[],
): PortfolioBalance[] =>
  [...balances].sort(compareHivePortfolioItemsByDisplayOrder);

const sortPortfolioDisplayItems = <T extends HivePortfolioDisplaySortItem>(
  items: T[],
  useHiveCoreTokenOrder: boolean,
): T[] =>
  [...items].sort((left, right) =>
    useHiveCoreTokenOrder
      ? compareHivePortfolioItemsByDisplayOrder(left, right)
      : (right.usdValue ?? -1) - (left.usdValue ?? -1),
  );

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

const parseHiveEngineAmountWithPrecision = (
  value: string,
  precision: number,
): number => parseFloat(parseFloat(value).toFixed(precision));

const getPortfolioHETokenData = (
  tokenBalanceItem: TokenBalance,
  tokenMarket: TokenMarket[],
  currencyPrices: CurrencyPrices,
  tokens: Token[],
): PortfolioBalance => {
  const hiveUsd = currencyPrices.hive?.usd ?? 0;
  const totalBalanceUsdValue = TokensUtils.getHiveEngineTokenValue(
    tokenBalanceItem,
    tokenMarket,
    currencyPrices!.hive!,
    tokens,
  );
  const priceInHive = TokensUtils.getHiveEngineTokenPrice(
    tokenBalanceItem,
    tokenMarket,
  );
  const priceUsd = priceInHive > 0 ? priceInHive * hiveUsd : null;
  const precision =
    tokens.find((token) => token.symbol === tokenBalanceItem.symbol)
      ?.precision ?? 8;
  const liquid = parseHiveEngineAmountWithPrecision(
    tokenBalanceItem.balance,
    precision,
  );
  const stake = parseHiveEngineAmountWithPrecision(
    tokenBalanceItem.stake,
    precision,
  );
  const delegationsIn = parseHiveEngineAmountWithPrecision(
    tokenBalanceItem.delegationsIn,
    precision,
  );
  const delegationsOut = parseHiveEngineAmountWithPrecision(
    tokenBalanceItem.delegationsOut,
    precision,
  );
  const pendingUnstake = parseHiveEngineAmountWithPrecision(
    tokenBalanceItem.pendingUnstake,
    precision,
  );
  const pendingUndelegations = parseHiveEngineAmountWithPrecision(
    tokenBalanceItem.pendingUndelegations,
    precision,
  );

  return {
    symbol: tokenBalanceItem.symbol,
    // Match wallet main amount: liquid only. Stake/pending/etc. live in breakdown.
    balance: liquid,
    usdValue: totalBalanceUsdValue,
    priceUsd,
    breakdown: {
      liquid,
      stake,
      delegationsIn,
      delegationsOut,
      pendingUnstake,
      pendingUndelegations,
    },
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
  compareHivePortfolioItemsByDisplayOrder,
  sortHivePortfolioBalancesByDisplayOrder,
  sortPortfolioDisplayItems,
};

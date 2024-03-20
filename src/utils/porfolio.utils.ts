import { ExtendedAccount } from '@hiveio/dhive';
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
    CurrencyPricesUtils.getPrices(),
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
  console.log(portfolio);

  const orderedTokenList = [
    'HIVE',
    'HBD',
    'HP',
    ...getOrderedTokenFullList(tokensFullList, portfolio),
  ];

  for (const userPortfolio of portfolio) {
    // add HBD
    userPortfolio.balances.push();
    // add HIVE
    userPortfolio.balances.push();
    // add HP
    userPortfolio.balances.push();
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
    console.log(userTokens);
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

// const getOrderedTokenSymbolListByUsdTotalValue = (
//   tokenSymbolListNoDuplicates: string[],
//   extendedAccountList: ExtendedAccount[],
//   tokensBalanceList: TokenBalance[][],
//   tokenMarket: TokenMarket[],
//   currencyPrices: CurrencyPrices,
// ) => {
//   let totals: PortfolioTotalTokenItem[] = [];
//   extendedAccountList.map(({ name }) => {
//     const userTokenBalanceList = tokensBalanceList.find(
//       (tokenBalanceItem) => tokenBalanceItem[0].account === name,
//     );
//     let heTokenList = tokenSymbolListNoDuplicates.map((tknSymbol) => {
//       const foundTokenInUserTokenList = userTokenBalanceList?.find(
//         (item) => item.symbol === tknSymbol,
//       );
//       if (foundTokenInUserTokenList) {
//         const portfolioHETokenData: PortfolioHETokenData =
//           getPortfolioHETokenData(
//             foundTokenInUserTokenList,
//             tokenMarket,
//             currencyPrices,
//           );
//         const { symbol, totalBalance, totalBalanceUsdValue } =
//           portfolioHETokenData;
//         if (
//           !totals.find((item) => item.symbol === portfolioHETokenData.symbol)
//         ) {
//           totals.push({
//             symbol,
//             total: totalBalance,
//             totalUSD: totalBalanceUsdValue,
//           });
//         } else {
//           const foundIndex = totals.findIndex(
//             (item) => item.symbol === portfolioHETokenData.symbol,
//           );
//           totals[foundIndex] = {
//             symbol: totals[foundIndex].symbol,
//             total: totals[foundIndex].total + portfolioHETokenData.totalBalance,
//             totalUSD:
//               totals[foundIndex].totalUSD +
//               portfolioHETokenData.totalBalanceUsdValue,
//           };
//         }
//       }
//     });
//   });
//   //order & pass only symbols
//   return totals
//     .sort((a, b) => b.totalUSD - a.totalUSD)
//     .map((item) => item.symbol);
// };

// const getPortfolioUserDataList = async (
//   extendedAccountList: ExtendedAccount[],
//   tokensBalanceList: TokenBalance[][],
//   tokenMarket: TokenMarket[],
//   currencyPrices: CurrencyPrices,
//   globalProperties: DynamicGlobalProperties | undefined,
// ) => {
//   let tokenSymbolListNoDuplicates: string[] = [];
//   tokensBalanceList.map((tokenBalance) => {
//     tokenBalance.map((token) => {
//       if (!tokenSymbolListNoDuplicates.includes(token.symbol)) {
//         tokenSymbolListNoDuplicates.push(token.symbol);
//       }
//     });
//   });
//   tokenSymbolListNoDuplicates = getOrderedTokenSymbolListByUsdTotalValue(
//     tokenSymbolListNoDuplicates,
//     extendedAccountList,
//     tokensBalanceList,
//     tokenMarket,
//     currencyPrices,
//   );
//   let tempList: PortfolioUserData[] = extendedAccountList.map(
//     ({
//       name,
//       balance,
//       vesting_shares,
//       hbd_balance,
//       savings_balance,
//       savings_hbd_balance,
//     }) => {
//       const totalHIVE =
//         Asset.fromString(balance.toString()).amount +
//         Asset.fromString(savings_balance.toString()).amount;
//       const totalHBD =
//         Asset.fromString(hbd_balance.toString()).amount +
//         Asset.fromString(savings_hbd_balance.toString()).amount;
//       const totalVESTS = Asset.fromString(vesting_shares.toString()).amount;
//       const userTokenBalanceList = tokensBalanceList.find(
//         (tokenBalanceItem) => tokenBalanceItem[0].account === name,
//       );
//       let heTokenList = tokenSymbolListNoDuplicates.map((tknSymbol) => {
//         const foundTokenInUserTokenList = userTokenBalanceList?.find(
//           (item) => item.symbol === tknSymbol,
//         );
//         if (foundTokenInUserTokenList) {
//           const portfolioHETokenData: PortfolioHETokenData =
//             getPortfolioHETokenData(
//               foundTokenInUserTokenList,
//               tokenMarket,
//               currencyPrices,
//             );
//           return portfolioHETokenData;
//         } else {
//           return {
//             symbol: tknSymbol,
//             totalBalance: 0,
//             totalBalanceUsdValue: 0,
//           } as PortfolioHETokenData;
//         }
//       });

//       return {
//         account: name,
//         HIVE: totalHIVE,
//         HBD: totalHBD,
//         HP: FormatUtils.toHP(totalVESTS.toString(), globalProperties),
//         heTokenList,
//       } as PortfolioUserData;
//     },
//   );
//   return tempList;
// };

export const PortfolioUtils = {
  loadAndSetRPCsAndApis,
  // getPortfolioUserDataList,
  getPortfolio,
};

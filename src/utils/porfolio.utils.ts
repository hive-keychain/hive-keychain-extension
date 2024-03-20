import { Asset, DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import {
  PortfolioHETokenData,
  PortfolioTotalTokenItem,
  PortfolioUserData,
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

const getPortfolioHETokenData = (
  tokenBalanceItem: TokenBalance,
  tokenMarket: TokenMarket[],
  currencyPrices: CurrencyPrices,
) => {
  const totalBalanceUsdValue = TokensUtils.getHiveEngineTokenValue(
    tokenBalanceItem,
    tokenMarket,
    currencyPrices!.hive!,
  );
  return {
    symbol: tokenBalanceItem.symbol,
    totalBalance:
      +tokenBalanceItem.balance +
      +tokenBalanceItem.delegationsIn +
      +tokenBalanceItem.delegationsOut +
      +tokenBalanceItem.stake +
      +tokenBalanceItem.pendingUndelegations +
      +tokenBalanceItem.pendingUnstake,
    totalBalanceUsdValue,
  } as PortfolioHETokenData;
};

const getOrderedTokenSymbolListByUsdTotalValue = (
  tokenSymbolListNoDuplicates: string[],
  extendedAccountList: ExtendedAccount[],
  tokensBalanceList: TokenBalance[][],
  tokenMarket: TokenMarket[],
  currencyPrices: CurrencyPrices,
) => {
  let totals: PortfolioTotalTokenItem[] = [];
  extendedAccountList.map(({ name }) => {
    const userTokenBalanceList = tokensBalanceList.find(
      (tokenBalanceItem) => tokenBalanceItem[0].account === name,
    );
    let heTokenList = tokenSymbolListNoDuplicates.map((tknSymbol) => {
      const foundTokenInUserTokenList = userTokenBalanceList?.find(
        (item) => item.symbol === tknSymbol,
      );
      if (foundTokenInUserTokenList) {
        const portfolioHETokenData: PortfolioHETokenData =
          getPortfolioHETokenData(
            foundTokenInUserTokenList,
            tokenMarket,
            currencyPrices,
          );
        const { symbol, totalBalance, totalBalanceUsdValue } =
          portfolioHETokenData;
        if (
          !totals.find((item) => item.symbol === portfolioHETokenData.symbol)
        ) {
          totals.push({
            symbol,
            total: totalBalance,
            totalUSD: totalBalanceUsdValue,
          });
        } else {
          const foundIndex = totals.findIndex(
            (item) => item.symbol === portfolioHETokenData.symbol,
          );
          totals[foundIndex] = {
            symbol: totals[foundIndex].symbol,
            total: totals[foundIndex].total + portfolioHETokenData.totalBalance,
            totalUSD:
              totals[foundIndex].totalUSD +
              portfolioHETokenData.totalBalanceUsdValue,
          };
        }
      }
    });
  });
  //order & pass only symbols
  return totals
    .sort((a, b) => b.totalUSD - a.totalUSD)
    .map((item) => item.symbol);
};

const getPortfolioUserDataList = async (
  extendedAccountList: ExtendedAccount[],
  tokensBalanceList: TokenBalance[][],
  tokenMarket: TokenMarket[],
  currencyPrices: CurrencyPrices,
  globalProperties: DynamicGlobalProperties | undefined,
) => {
  let tokenSymbolListNoDuplicates: string[] = [];
  tokensBalanceList.map((tokenBalance) => {
    tokenBalance.map((token) => {
      if (!tokenSymbolListNoDuplicates.includes(token.symbol)) {
        tokenSymbolListNoDuplicates.push(token.symbol);
      }
    });
  });
  tokenSymbolListNoDuplicates = getOrderedTokenSymbolListByUsdTotalValue(
    tokenSymbolListNoDuplicates,
    extendedAccountList,
    tokensBalanceList,
    tokenMarket,
    currencyPrices,
  );
  let tempList: PortfolioUserData[] = extendedAccountList.map(
    ({
      name,
      balance,
      vesting_shares,
      hbd_balance,
      savings_balance,
      savings_hbd_balance,
    }) => {
      const totalHIVE =
        Asset.fromString(balance.toString()).amount +
        Asset.fromString(savings_balance.toString()).amount;
      const totalHBD =
        Asset.fromString(hbd_balance.toString()).amount +
        Asset.fromString(savings_hbd_balance.toString()).amount;
      const totalVESTS = Asset.fromString(vesting_shares.toString()).amount;
      const userTokenBalanceList = tokensBalanceList.find(
        (tokenBalanceItem) => tokenBalanceItem[0].account === name,
      );
      let heTokenList = tokenSymbolListNoDuplicates.map((tknSymbol) => {
        const foundTokenInUserTokenList = userTokenBalanceList?.find(
          (item) => item.symbol === tknSymbol,
        );
        if (foundTokenInUserTokenList) {
          const portfolioHETokenData: PortfolioHETokenData =
            getPortfolioHETokenData(
              foundTokenInUserTokenList,
              tokenMarket,
              currencyPrices,
            );
          return portfolioHETokenData;
        } else {
          return {
            symbol: tknSymbol,
            totalBalance: 0,
            totalBalanceUsdValue: 0,
          } as PortfolioHETokenData;
        }
      });

      return {
        account: name,
        HIVE: totalHIVE,
        HBD: totalHBD,
        HP: FormatUtils.toHP(totalVESTS.toString(), globalProperties),
        heTokenList,
      } as PortfolioUserData;
    },
  );
  return tempList;
};

export const PortfolioUtils = {
  loadAndSetRPCsAndApis,
  getPortfolioUserDataList,
};

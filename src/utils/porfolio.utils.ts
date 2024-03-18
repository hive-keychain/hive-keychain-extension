import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import {
  PortfolioHETokenData,
  PortfolioUserData,
} from 'src/portfolio/portfolio.interface';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
//TODO bellow after refactor, remove & cleanup
const getLabelCell = (key: string) => {
  switch (key) {
    case 'vesting_shares':
      return 'HP';
    case 'name':
      return 'ACCOUNT';
    case 'balance':
      return 'HIVE';
    case 'hbd_balance':
      return 'HBD';
    default:
      return key;
  }
};

const getFormatedOrDefaultValue = (
  value: string,
  globalProperties: GlobalProperties | null,
) => {
  switch (true) {
    case value.includes('VESTS'):
      return FormatUtils.withCommas(
        FormatUtils.toHP(
          (value as string).split(' ')[0],
          globalProperties?.globals,
        ).toString(),
      );
    case value.includes('HBD'):
      return FormatUtils.withCommas((value as string).split(' ')[0]);
    case value.includes('HIVE'):
      return FormatUtils.withCommas((value as string).split(' ')[0]);
    default:
      return value;
  }
};

const getHiveTotal = (
  key:
    | 'balance'
    | 'hbd_balance'
    | 'vesting_shares'
    | 'savings_hbd_balance'
    | 'savings_balance',
  list: ExtendedAccount[],
) => {
  if (key === 'balance') {
    return (
      list
        .reduce(
          (acc, curr) => acc + Number((curr.balance as string).split(' ')[0]),
          0,
        )
        .toString() + ' HIVE'
    );
  } else if (key === 'hbd_balance') {
    return (
      list
        .reduce(
          (acc, curr) =>
            acc + Number((curr.hbd_balance as string).split(' ')[0]),
          0,
        )
        .toString() + ' HBD'
    );
  } else if (key === 'vesting_shares') {
    return (
      list
        .reduce(
          (acc, curr) =>
            acc + Number((curr.vesting_shares as string).split(' ')[0]),
          0,
        )
        .toString() + ' VESTS'
    );
  } else if (key === 'savings_hbd_balance') {
    return (
      list
        .reduce(
          (acc, curr) =>
            acc + Number((curr.savings_hbd_balance as string).split(' ')[0]),
          0,
        )
        .toString() + ' SAVINGS_HBD'
    );
  } else if (key === 'savings_balance') {
    return (
      list
        .reduce(
          (acc, curr) =>
            acc + Number((curr.savings_balance as string).split(' ')[0]),
          0,
        )
        .toString() + ' SAVINGS_HIVE'
    );
  } else {
    return '0';
  }
};

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

// const getTokensNameOrderByUSDValue = (currentTokenSymbolList: string[]) => {
//   let orderedTokenSymbolList: string[] = [];
//   currentTokenSymbolList.map(tknSymbol => {
//     const foundTokenInUserTokenList = userTokenBalanceList?.find(
//       (item) => item.symbol === tknSymbol,
//     );
//   });
//   return orderedTokenSymbolList;
// };

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
  tokenSymbolListNoDuplicates = tokenSymbolListNoDuplicates.sort((a, b) =>
    a.localeCompare(b),
  );
  console.log({ tokenSymbolListNoDuplicates }); //TODO remove & use
  let tempList: PortfolioUserData[] = extendedAccountList.map(
    ({
      name,
      balance,
      vesting_shares,
      hbd_balance,
      savings_balance,
      savings_hbd_balance,
      delegated_vesting_shares,
      received_vesting_shares,
    }) => {
      const totalHIVE =
        +(balance as string).split(' ')[0] +
        +(savings_balance as string).split(' ')[0];
      const totalHBD =
        +(hbd_balance as string).split(' ')[0] +
        +(savings_hbd_balance as string).split(' ')[0];
      const totalVESTS =
        +(vesting_shares as string).split(' ')[0] +
        +(delegated_vesting_shares as string).split(' ')[0] +
        +(received_vesting_shares as string).split(' ')[0];
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

      // let heTokenList = userTokenBalanceList?.map((tokenBalanceItem) => {
      //   const totalBalanceUsdValue = TokensUtils.getHiveEngineTokenValue(
      //     tokenBalanceItem,
      //     tokenMarket,
      //     currencyPrices.hive!,
      //   );
      //   return {
      //     symbol: tokenBalanceItem.symbol,
      //     totalBalance:
      //       +tokenBalanceItem.balance +
      //       +tokenBalanceItem.delegationsIn +
      //       +tokenBalanceItem.delegationsOut +
      //       +tokenBalanceItem.stake +
      //       +tokenBalanceItem.pendingUndelegations +
      //       +tokenBalanceItem.pendingUnstake,
      //     totalBalanceUsdValue,
      //   } as PortfolioHETokenData;
      // });

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
  getFormatedOrDefaultValue,
  getLabelCell,
  getHiveTotal,
  loadAndSetRPCsAndApis,
  getPortfolioUserDataList,
};

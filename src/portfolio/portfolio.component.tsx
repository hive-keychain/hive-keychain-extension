import { ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import HiveUtils from '@popup/hive/utils/hive.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { getTheme } from '@table-library/react-table-library/baseline';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import PortfolioCellItemComponent from 'src/portfolio/portfolio-cell-item/portfolio-cell-item.component';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

const PortfolioComponent = () => {
  const [theme, setTheme] = useState<Theme>();
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [extendedAccountsList, setExtendedAccountsList] = useState<
    ExtendedAccount[]
  >([]);
  const [globalProperties, setGlobalProperties] =
    useState<GlobalProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ nodes: any[] }>({ nodes: [] });
  const [extraColumns, setExtraColumns] = useState<
    { label: string; renderCell: (item: any) => void }[]
  >([]);
  const [themeTable, setThemeTable] = useState<any>();
  const [currencyPrices, setCurrencyPrices] = useState<CurrencyPrices>();
  const [tokensBalanceList, setTokensBalanceList] = useState<TokenBalance[][]>(
    [],
  );
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [tokenMarket, setTokenMarket] = useState<TokenMarket[]>([]);
  const [totalValueUSDPortfolio, setTotalValueUSDPortfolio] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);
    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
    const mk = await LocalStorageUtils.getValueFromSessionStorage(
      LocalStorageKeyEnum.__MK,
    );
    let localAccounts = await AccountUtils.getAccountsFromLocalStorage(mk);

    if (!localAccounts) {
      setIsLoading(false);
      setErrorMessage(
        chrome.i18n.getMessage('no_account_found_on_ledger_error'),
      );
      return;
    } else {
      await PortfolioUtils.loadAndSetRPCsAndApis();
      setLocalAccounts(localAccounts);
      let extAccounts = await AccountUtils.getExtendedAccounts(
        localAccounts.map((localAcc) => localAcc.name),
      );

      //TODO Testing to filter here
      // extAccounts = extAccounts.filter((item) => item.name === 'theghost1980');
      //end test

      setExtendedAccountsList(extAccounts);
      loadGlobalProps();
      loadCurrencyPrices();
      loadUserTokens(localAccounts);
      loadTokens();
      loadTokensMarket();
    }
  };

  const loadTokensMarket = async () => {
    try {
      const tokensMarket = await TokensUtils.getTokensMarket({}, 1000, 0, []);
      setTokenMarket(tokensMarket);
    } catch (error) {
      Logger.error('Error loading tokens market', { error });
    }
  };

  const loadTokens = async () => {
    let tokens;
    try {
      tokens = await TokensUtils.getAllTokens();
    } catch (err: any) {
      Logger.error('Error getting tokens', { err });
    }
  };

  const loadCurrencyPrices = async () => {
    try {
      const prices = await CurrencyPricesUtils.getPrices();
      if (prices) {
        setCurrencyPrices(prices);
      }
    } catch (error) {
      //TODO add as Logger.
      Logger.error('Error loading prices!', { error });
    }
  };

  const loadGlobalProps = async () => {
    try {
      //global props
      const [globals, price, rewardFund] = await Promise.all([
        DynamicGlobalPropertiesUtils.getDynamicGlobalProperties(),
        HiveUtils.getCurrentMedianHistoryPrice(),
        HiveUtils.getRewardFund(),
      ]);
      const props = { globals, price, rewardFund };
      setGlobalProperties(props);
    } catch (error) {
      Logger.error('Error getting globals!', error);
    }
  };

  const loadUserTokens = async (accountNames: LocalAccount[]) => {
    //Get tokenBalance list
    let tempTokenBalanceList: TokenBalance[][] = [];
    for (let index = 0; index < accountNames.length; index++) {
      const accountName = accountNames[index].name;
      let tokensBalance: TokenBalance[] = await TokensUtils.getUserBalance(
        accountName,
      );
      tokensBalance = tokensBalance.sort(
        (a, b) => parseFloat(b.balance) - parseFloat(a.balance),
      );
      tempTokenBalanceList.push(tokensBalance);
    }
    //sort list who has more tokens
    tempTokenBalanceList = tempTokenBalanceList.sort(
      (a, b) => b.length - a.length,
    );
    setTokensBalanceList(tempTokenBalanceList);
  };

  useEffect(() => {
    if (
      extendedAccountsList.length > 0 &&
      globalProperties?.globals &&
      currencyPrices &&
      tokensBalanceList.length > 0
    ) {
      const totalBalance = PortfolioUtils.getHiveTotal(
        'balance',
        extendedAccountsList,
      );
      const totalHBDBalance = PortfolioUtils.getHiveTotal(
        'hbd_balance',
        extendedAccountsList,
      );
      const totalHP = PortfolioUtils.getHiveTotal(
        'vesting_shares',
        extendedAccountsList,
      );

      const portfolioUserData = extendedAccountsList.map(
        ({ name, balance, vesting_shares, hbd_balance }) => {
          const tokenBalance = tokensBalanceList.find(
            (tokenBalance) => tokenBalance[0].account === name,
          );
          const tokenBalanceObj = tokenBalance?.map(({ symbol, balance }) => {
            return { [symbol]: balance };
          });
          let asPlainObjects: { [key: string]: any } = {};
          for (const [key, value] of Object.entries(tokenBalanceObj!)) {
            asPlainObjects = { ...asPlainObjects, ...value };
          }
          return {
            name,
            balance,
            vesting_shares,
            hbd_balance,
            ...asPlainObjects,
          };
        },
      );

      const sortedPortfolioUserData = portfolioUserData.sort(
        (a, b) => Object.keys(b).length - Object.keys(a).length,
      );

      const keysToUse = Object.keys(sortedPortfolioUserData[0]).map(
        (key) => key,
      );

      const filteredKeysToUse = keysToUse.filter(
        (key) =>
          key !== 'name' &&
          key !== 'balance' &&
          key !== 'vesting_shares' &&
          key !== 'hbd_balance',
      );

      const totalTokens = filteredKeysToUse.map((key) => {
        const obj: { [key: string]: any } = {};
        obj[key] = (sortedPortfolioUserData as any).reduce(
          (acc: number, curr: any) => {
            if (curr[key]) {
              return (acc += parseFloat(curr[key]));
            } else {
              return acc;
            }
          },
          0,
        );
        return obj;
      });

      let totalTokensAsPlainObjects: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(totalTokens!)) {
        totalTokensAsPlainObjects = { ...totalTokensAsPlainObjects, ...value };
      }

      //calculate each total token value USD
      let total_token_usd_value = 0;
      const totalTokenUSDValue = Object.entries(totalTokensAsPlainObjects).map(
        (key, value) => {
          let obj: { [key: string]: any } = {};
          obj[key[0]] = 0;
          if (key[1] > 0) {
            obj[key[0]] = TokensUtils.getHiveEngineTokenValue(
              {
                account: '',
                balance: key[1].toString(),
                symbol: key[0],
                pendingUndelegations: '0',
                pendingUnstake: '0',
                delegationsIn: '0',
                delegationsOut: '0',
                stake: '0',
                _id: 0,
              } as TokenBalance,
              tokenMarket,
              currencyPrices.hive!,
            ).toFixed(4);
          }
          total_token_usd_value += Number(obj[key[0]]);
          return obj;
        },
      );

      let totalTokensUSDAsPlainObjects: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(totalTokenUSDValue!)) {
        totalTokensUSDAsPlainObjects = {
          ...totalTokensUSDAsPlainObjects,
          ...value,
        };
      }

      const total_hive_balance_usd =
        +totalBalance.split(' ')[0]! * (currencyPrices.hive.usd ?? 1);
      const total_hbd_balance_usd =
        +totalHBDBalance.split(' ')[0] * (currencyPrices.hive_dollar.usd ?? 1);
      const total_vesting_shares_usd =
        +FormatUtils.toHP(
          PortfolioUtils.getHiveTotal('vesting_shares', extendedAccountsList),
          globalProperties.globals,
        ) * (currencyPrices.hive.usd ?? 1);

      setTotalValueUSDPortfolio(
        total_hive_balance_usd +
          total_hbd_balance_usd +
          total_vesting_shares_usd +
          total_token_usd_value,
      );

      setData({
        nodes: [
          ...portfolioUserData,
          {
            name: 'totals',
            balance: totalBalance,
            hbd_balance: totalHBDBalance,
            vesting_shares: totalHP,
            ...totalTokensAsPlainObjects,
          } as any,
          {
            name: 'totals_usd',
            balance: FormatUtils.formatCurrencyValue(total_hive_balance_usd),
            hbd_balance: FormatUtils.formatCurrencyValue(total_hbd_balance_usd),
            vesting_shares: FormatUtils.formatCurrencyValue(
              total_vesting_shares_usd,
            ),
            ...totalTokensUSDAsPlainObjects,
          } as any,
        ],
      });

      const extra = keysToUse.map((key) => {
        return {
          label: PortfolioUtils.getLabelCell(key),
          renderCell: (item: any) => (
            <PortfolioCellItemComponent
              item={item}
              itemKey={key}
              globalProperties={globalProperties}
            />
          ),
        };
      });
      setExtraColumns(extra);
      const dynamicPercentages = keysToUse
        .slice(0, keysToUse.length - 1)
        .map((k) => `25%`)
        .join(' ');
      setThemeTable(
        useTheme([
          getTheme(),
          {
            Table: `
             --data-table-library_grid-template-columns:  ${dynamicPercentages} minmax(200px, 1fr);
          `,
            HeaderRow: `
          background-color: ${theme === Theme.DARK ? '#293144' : '#fafcfd'};
          color: var(--main-font-color);
          @include poppins500(14px);
        `,
            Row: `
          &:nth-of-type(odd) {
            background-color: ${theme === Theme.DARK ? '#293144' : '#fafcfd'};
          }
  
          &:nth-of-type(even) {
            background-color: ${theme === Theme.DARK ? '#293144' : '#fafcfd'};
          }
        `,
          },
        ]),
      );
      setIsLoading(false);
    }
  }, [extendedAccountsList, globalProperties, tokensBalanceList]);

  return (
    <div className={`theme ${theme} portfolio`}>
      <div className="title-panel">
        <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage('portfolio')}</div>
      </div>
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {!isLoading &&
        data &&
        globalProperties &&
        extraColumns &&
        currencyPrices &&
        tokensBalanceList.length > 0 && (
          <>
            <CompactTable
              columns={extraColumns}
              data={data}
              theme={themeTable}
              layout={{
                horizontalScroll: true,
                fixedHeader: true,
                custom: true,
              }}
            />
            <div className="title-panel">
              <div className="title">Portfolio Value USD:</div>
              <div className="title">
                {' '}
                {FormatUtils.formatCurrencyValue(totalValueUSDPortfolio)}
              </div>
            </div>
          </>
        )}
      {!isLoading && errorMessage.length > 0 && (
        <div className="title-panel">
          <div className="title">{errorMessage}</div>
        </div>
      )}
    </div>
  );
};

export default PortfolioComponent;

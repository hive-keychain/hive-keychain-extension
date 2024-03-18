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
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioUserData } from 'src/portfolio/portfolio.interface';
import PortfolioTableComponent from 'src/portfolio/portolfio-table/portfolio-table.component';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';
//TODO important:
//  - create components in table.
//  - add filter to the new data passed.
//  - ask cedric how to order this new data per USD token value.
//TODO check utils, remove unused + improve.
const PortfolioComponent = () => {
  const [theme, setTheme] = useState<Theme>();
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [extendedAccountsList, setExtendedAccountsList] = useState<
    ExtendedAccount[]
  >([]);
  const [filteredExtendedAccountList, setFilteredExtendedAccountList] =
    useState<ExtendedAccount[]>([]);
  const [globalProperties, setGlobalProperties] =
    useState<GlobalProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ nodes: any[] }>({ nodes: [] });
  //TODO cleanup
  // const [filteredData, setFilteredData] = useState<{ nodes: any[] }>({
  //   nodes: [],
  // });
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

  const [filterValue, setFilterValue] = useState('');
  const [currentFilterList, setCurrentFilterList] = useState<string[]>([]);

  const [portfolioUserDataList, setPortfolioUserDataList] = useState<
    PortfolioUserData[]
  >([]);

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
      setFilteredExtendedAccountList(extAccounts);
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
      if (tokensBalance.length === 0) {
        tokensBalance = [
          {
            _id: 99999,
            account: accountName,
            symbol: 'PAL',
            balance: '0',
            delegationsIn: '0',
            delegationsOut: '0',
            stake: '0',
            pendingUndelegations: '0',
            pendingUnstake: '0',
          } as TokenBalance,
        ];
      }
      tempTokenBalanceList.push(tokensBalance);
    }
    console.log({ tempTokenBalanceList }); //TODO remove line
    setTokensBalanceList(tempTokenBalanceList);
  };

  const getAllData = async () => {
    //TODO bellow, testing to set all data at once
    const dataTempUsers = await PortfolioUtils.getPortfolioUserDataList(
      extendedAccountsList,
      tokensBalanceList,
      tokenMarket,
      currencyPrices!,
      globalProperties?.globals!,
    );
    //end testing
    console.log({ dataTempUsers }); //TODO remove line
    //TODO bellow assign the new one orderedTokenBalancesByUsdValue
    setPortfolioUserDataList(dataTempUsers);
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
        filteredExtendedAccountList,
      );
      const totalHBDBalance = PortfolioUtils.getHiveTotal(
        'hbd_balance',
        filteredExtendedAccountList,
      );
      const totalHP = PortfolioUtils.getHiveTotal(
        'vesting_shares',
        filteredExtendedAccountList,
      );
      const totalSavingsHBD = PortfolioUtils.getHiveTotal(
        'savings_hbd_balance',
        filteredExtendedAccountList,
      );
      const totalSavingHIVE = PortfolioUtils.getHiveTotal(
        'savings_balance',
        filteredExtendedAccountList,
      );
      getAllData();
      const portfolioUserData = filteredExtendedAccountList.map(
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
      console.log({ portfolioUserData }); //TODO remove line

      const tokensSymbolsArray: string[] = [];
      portfolioUserData.map((data) => {
        Object.keys(data).map((dataKey) => {
          if (
            dataKey !== 'name' &&
            dataKey !== 'balance' &&
            dataKey !== 'vesting_shares' &&
            dataKey !== 'hbd_balance' &&
            !tokensSymbolsArray.includes(dataKey)
          ) {
            tokensSymbolsArray.push(dataKey);
          }
        });
      });

      const keysToUse = Object.keys(portfolioUserData[0]).map((key) => key);

      const filteredKeysToUse = tokensSymbolsArray.filter(
        (key) =>
          key !== 'name' &&
          key !== 'balance' &&
          key !== 'vesting_shares' &&
          key !== 'hbd_balance',
      );

      const totalTokens = filteredKeysToUse.map((key) => {
        const obj: { [key: string]: any } = {};
        obj[key] = (portfolioUserData as any).reduce(
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
          PortfolioUtils.getHiveTotal(
            'vesting_shares',
            filteredExtendedAccountList,
          ),
          globalProperties.globals,
        ) * (currencyPrices.hive.usd ?? 1);
      const total_hbd_savings_usd =
        +totalSavingsHBD.split(' ')[0] * (currencyPrices.hive_dollar.usd ?? 1);
      const total_hive_savings_usd =
        +totalSavingHIVE.split(' ')[0] * (currencyPrices.hive.usd ?? 1);

      setTotalValueUSDPortfolio(
        total_hive_balance_usd +
          total_hbd_balance_usd +
          total_vesting_shares_usd +
          total_token_usd_value +
          total_hbd_savings_usd +
          total_hive_savings_usd,
      );

      console.log({
        totalTokensUSDAsPlainObjects,
        keyL: Object.keys(totalTokensUSDAsPlainObjects).length,
      }); //TODO remove line

      setIsLoading(false);
    }
  }, [filteredExtendedAccountList, globalProperties, tokensBalanceList]);

  useEffect(() => {
    const currentExtendedAccountList = [...extendedAccountsList];
    if (currentFilterList.length === 0) {
      setFilteredExtendedAccountList(currentExtendedAccountList);
    } else {
      const filteredList = currentExtendedAccountList.filter((extAcc) =>
        currentFilterList.includes(extAcc.name),
      );
      setFilteredExtendedAccountList(filteredList);
    }
  }, [currentFilterList]);

  const handleAddAccountToFilter = (account: string) => {
    if (!currentFilterList.includes(account)) {
      setCurrentFilterList((prevList) => [...prevList, account]);
      setFilterValue('');
    }
  };

  const handleRemoveAccountFromFilter = (account: string) => {
    if (currentFilterList.includes(account)) {
      let tempCurrentFilterList = [...currentFilterList];
      tempCurrentFilterList = tempCurrentFilterList.filter(
        (filter) => filter !== account,
      );
      setCurrentFilterList(tempCurrentFilterList);
    }
  };

  return (
    <div className={`theme ${theme} portfolio`}>
      <div className="title-panel">
        <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage('portfolio')}</div>
      </div>
      <div className="filter-box-container">
        <input
          placeholder="Filter account"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="filter-input"
        />
        {currentFilterList.length > 0 && (
          <div className="filter-box-list-container">
            {currentFilterList.map((currentFilter) => {
              return (
                <div
                  key={`current-filter-${currentFilter}`}
                  className="filter-item">
                  <div className="small-text">{currentFilter}</div>
                  <SVGIcon
                    dataTestId="input-clear"
                    icon={SVGIcons.INPUT_CLEAR}
                    className={`input-img erase right`}
                    onClick={() => handleRemoveAccountFromFilter(currentFilter)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {filterValue.trim().length > 0 && (
        <div className="filter-box">
          {extendedAccountsList
            .filter((acc) => acc.name.includes(filterValue))
            .map((filteredAcc) => {
              return (
                <div
                  className="avatar-username-container cursor-pointer"
                  key={`avatar-username-filter-box-${filteredAcc.name}`}
                  onClick={() => handleAddAccountToFilter(filteredAcc.name)}>
                  <PreloadedImage
                    className="user-picture"
                    src={`https://images.hive.blog/u/${filteredAcc.name}/avatar`}
                    alt={'/assets/images/accounts.png'}
                    placeholder={'/assets/images/accounts.png'}
                  />
                  <div className="account-name">{filteredAcc.name}</div>
                </div>
              );
            })}
        </div>
      )}
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
        tokensBalanceList.length > 0 &&
        portfolioUserDataList.length > 0 && (
          <>
            <PortfolioTableComponent
              data={portfolioUserDataList}
              currencyPrices={currencyPrices}
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

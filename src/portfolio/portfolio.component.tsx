import { ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import HiveUtils from '@popup/hive/utils/hive.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import PortfolioFilterComponent from 'src/portfolio/portfolio-filter/portfolio-filter.component';
import { PortfolioUserData } from 'src/portfolio/portfolio.interface';
import PortfolioTableComponent from 'src/portfolio/portolfio-table/portfolio-table.component';
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
  const [currencyPrices, setCurrencyPrices] = useState<CurrencyPrices>();
  const [tokensBalanceList, setTokensBalanceList] = useState<TokenBalance[][]>(
    [],
  );
  const [tokenMarket, setTokenMarket] = useState<TokenMarket[]>([]);
  const [totalValueUSDPortfolio, setTotalValueUSDPortfolio] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [portfolioUserDataList, setPortfolioUserDataList] = useState<
    PortfolioUserData[]
  >([]);
  const [filteredPortfolioUserDataList, setFilteredPortfolioUserDataList] =
    useState<PortfolioUserData[]>([]);

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
      Logger.error('Error loading prices!', { error });
    }
  };

  const loadGlobalProps = async () => {
    try {
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
    setTokensBalanceList(tempTokenBalanceList);
  };

  const getAllData = async () => {
    const dataTempUsers = await PortfolioUtils.getPortfolioUserDataList(
      extendedAccountsList,
      tokensBalanceList,
      tokenMarket,
      currencyPrices!,
      globalProperties?.globals!,
    );
    setPortfolioUserDataList(dataTempUsers);
    setFilteredPortfolioUserDataList(dataTempUsers);
  };

  useEffect(() => {
    if (
      extendedAccountsList.length > 0 &&
      globalProperties?.globals &&
      currencyPrices &&
      tokensBalanceList.length > 0
    ) {
      getAllData();
      setIsLoading(false);
    }
  }, [globalProperties, tokensBalanceList]);

  const isReadyToShow =
    !isLoading &&
    filteredPortfolioUserDataList &&
    globalProperties &&
    currencyPrices &&
    tokensBalanceList.length > 0 &&
    filteredPortfolioUserDataList.length > 0;

  return (
    <div className={`theme ${theme} portfolio`}>
      <div className="title-panel info-row">
        <div className="info-row centered">
          <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
          <div className="title">{chrome.i18n.getMessage('portfolio')}</div>
        </div>
        {totalValueUSDPortfolio > 0 && (
          <div className="title-panel">
            <div className="title">Total Value USD:</div>
            <CustomTooltip
              position={'bottom'}
              skipTranslation
              message="This amount, reflects savings, stake, pending stake, delegations IN/OUT of tokens & balances in all the accounts you have registered in Keychain.">
              <div className="info-row centered">
                <div className="title">
                  {' '}
                  {FormatUtils.formatCurrencyValue(totalValueUSDPortfolio)}
                </div>
                <SVGIcon dataTestId="input-clear" icon={SVGIcons.MENU_ABOUT} />
              </div>
            </CustomTooltip>
          </div>
        )}
      </div>
      <PortfolioFilterComponent
        extendedAccountsList={extendedAccountsList}
        portfolioUserDataList={portfolioUserDataList}
        setFilteredPortfolioUserDataList={(filteredList) =>
          setFilteredPortfolioUserDataList(filteredList)
        }
        isReadyToShow={isReadyToShow}
      />
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {isReadyToShow && (
        <>
          <PortfolioTableComponent
            data={filteredPortfolioUserDataList}
            currencyPrices={currencyPrices}
            setTotalValueUSDPortfolio={(value) =>
              setTotalValueUSDPortfolio(value)
            }
          />
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

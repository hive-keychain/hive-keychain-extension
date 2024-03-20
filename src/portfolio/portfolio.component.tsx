import { ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioFilterComponent } from 'src/portfolio/portfolio-filter/portfolio-filter.component';
import { PortfolioUserData } from 'src/portfolio/portfolio.interface';
import { PortfolioTableComponent } from 'src/portfolio/portolfio-table/portfolio-table.component';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

const Portfolio = () => {
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
    let extendedAccounts = await AccountUtils.getExtendedAccounts(
      localAccounts.map((localAcc) => localAcc.name),
    );
    const [portfolio, orderedTokenList] = await PortfolioUtils.getPortfolio(
      extendedAccounts,
    );

    if (!localAccounts) {
      setIsLoading(false);
      setErrorMessage(
        chrome.i18n.getMessage('no_account_found_on_portfolio_error'),
      );
      return;
    } else {
      setLocalAccounts(localAccounts);

      setExtendedAccountsList(extendedAccounts);

      await getAllData();
    }
  };

  const getAllData = async () => {
    // const dataTempUsers = await PortfolioUtils.getPortfolioUserDataList(
    //   extendedAccountsList,
    //   tokensBalanceList,
    //   tokenMarket,
    //   currencyPrices!,
    //   globalProperties?.globals!,
    // );
    // setPortfolioUserDataList(dataTempUsers);
    // setFilteredPortfolioUserDataList(dataTempUsers);
    // setIsLoading(false);
  };

  return (
    <div className={`theme ${theme} portfolio`}>
      <div className="title-panel info-row">
        <div className="info-row centered">
          <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
          <div className="title">{chrome.i18n.getMessage('portfolio')}</div>
        </div>
        {totalValueUSDPortfolio > 0 && (
          <div className="title-panel">
            <div className="title">
              {chrome.i18n.getMessage('portfolio_total_value_usd')}
            </div>
            <div className="info-row centered">
              <div className="title">
                {FormatUtils.formatCurrencyValue(totalValueUSDPortfolio)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="caption">
        {chrome.i18n.getMessage('portfolio_caption_message_total_value')}
      </div>
      {!isLoading && (
        <PortfolioFilterComponent
          extendedAccountsList={extendedAccountsList}
          portfolioUserDataList={portfolioUserDataList}
          setFilteredPortfolioUserDataList={(filteredList) =>
            setFilteredPortfolioUserDataList(filteredList)
          }
        />
      )}

      {!isLoading && currencyPrices && portfolioUserDataList && (
        <PortfolioTableComponent
          data={filteredPortfolioUserDataList}
          currencyPrices={currencyPrices}
          setTotalValueUSDPortfolio={(value) =>
            setTotalValueUSDPortfolio(value)
          }
        />
      )}

      {!isLoading && errorMessage.length > 0 && (
        <div className="title-panel">
          <div className="title">{errorMessage}</div>
        </div>
      )}

      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

export const PortfolioComponent = Portfolio;

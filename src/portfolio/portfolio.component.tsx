import type { ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioFilterComponent } from 'src/portfolio/portfolio-filter/portfolio-filter.component';
import { UserPortfolio } from 'src/portfolio/portfolio.interface';
import { PortfolioTableComponent } from 'src/portfolio/portolfio-table/portfolio-table.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

const Portfolio = () => {
  const [theme, setTheme] = useState<Theme>();
  const [tableColumnsHeaders, setTableColumnsHeaders] = useState<string[]>([]);
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [extendedAccountsList, setExtendedAccountsList] = useState<
    ExtendedAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValueUSDPortfolio, setTotalValueUSDPortfolio] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [portfolioData, setPortfolioData] = useState<UserPortfolio[]>([]);
  const [filteredPortfolioData, setFilteredPortfolioData] = useState<
    UserPortfolio[]
  >([]);

  const [currentAccountIndex, setCurrentAccountIndex] = useState<
    number | undefined
  >();
  const [currentAccountUsername, setCurrentAccountUsername] = useState<
    string | undefined
  >();

  useEffect(() => {
    init();
  }, []);

  const onCreatingPortfolioProgress = (
    currentAccountIndex: number,
    currentAccount: string,
  ) => {
    setCurrentAccountIndex(currentAccountIndex);
    setCurrentAccountUsername(currentAccount);
  };

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

    if (!localAccounts) {
      setIsLoading(false);
      setErrorMessage(
        chrome.i18n.getMessage('no_account_found_on_portfolio_error'),
      );
      return;
    } else {
      setLocalAccounts(localAccounts);
      setExtendedAccountsList(extendedAccounts);
      const [portfolio, orderedTokenList] = await PortfolioUtils.getPortfolio(
        extendedAccounts,
        onCreatingPortfolioProgress,
      );
      setTableColumnsHeaders(orderedTokenList as string[]);
      setPortfolioData(portfolio as UserPortfolio[]);

      const tempTotals = PortfolioUtils.getTotals(
        orderedTokenList as string[],
        portfolio as UserPortfolio[],
      );
      setTotalValueUSDPortfolio(
        tempTotals.reduce((acc, curr) => acc + curr.usdValue, 0),
      );

      setFilteredPortfolioData(portfolio as UserPortfolio[]);
      setIsLoading(false);
    }
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
                {`$${FormatUtils.formatCurrencyValue(
                  totalValueUSDPortfolio,
                  2,
                )}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {!isLoading && (
        <>
          <div className="caption">
            {chrome.i18n.getMessage('portfolio_caption_message_total_value')}
          </div>
          <PortfolioFilterComponent
            extendedAccountsList={extendedAccountsList}
            data={portfolioData}
            setFilteredPortfolioData={(filteredList) => {
              setFilteredPortfolioData(filteredList);
            }}
          />
        </>
      )}

      {!isLoading && filteredPortfolioData && (
        <PortfolioTableComponent
          data={filteredPortfolioData}
          tableColumnsHeaders={tableColumnsHeaders}
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

          {currentAccountIndex && currentAccountUsername && localAccounts && (
            <div className="loading-message">
              {chrome.i18n.getMessage('portfolio_fetch_progress', [
                currentAccountIndex.toString(),
                localAccounts!.length.toString(),
                currentAccountUsername,
              ])}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PortfolioComponent = Portfolio;

import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import {
  PortfolioBalance,
  UserPortfolio,
} from 'src/portfolio/portfolio.interface';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

interface Props {
  data: UserPortfolio[];
  tableColumnsHeaders: string[];
}

const PortfolioTable = ({ data, tableColumnsHeaders }: Props) => {
  const [totals, setTotals] = useState<PortfolioBalance[]>([]);
  const [totalHive, setTotalHive] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);

  useEffect(() => {
    const tempTotals = PortfolioUtils.getTotals(tableColumnsHeaders, data);
    setTotals(tempTotals);
    setTotalUSD(tempTotals.reduce((acc, curr) => acc + curr.usdValue, 0));
    setTotalHive(data.reduce((acc, curr) => acc + curr.totalHive, 0));
  }, [data]);

  return (
    <div className="portfolio-table-container-wrapper">
      <div className="portfolio-table-container">
        <table className="portfolio-table">
          <thead className="headers">
            <tr>
              <th className="table-header account-column">
                {chrome.i18n
                  .getMessage('portfolio_table_column_header_account')
                  .toUpperCase()}
              </th>
              {tableColumnsHeaders.map((columnHeaderLabel) => {
                return (
                  <th
                    className="table-header"
                    key={`${columnHeaderLabel}-column-label`}>
                    {columnHeaderLabel}
                  </th>
                );
              })}
              <th className="table-header total-column">
                {chrome.i18n.getMessage('portfolio_table_column_total_hive')}
              </th>
              <th className="table-header total-column">
                {chrome.i18n.getMessage(
                  'portfolio_table_column_sticky_total_usd',
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ account, totalHive, totalUSD, balances }) => {
              return (
                <tr key={`${account}-tr-row`}>
                  <td className="account-column avatar-username-container">
                    <PreloadedImage
                      className="user-picture"
                      src={`https://images.hive.blog/u/${account}/avatar`}
                      alt={'/assets/images/accounts.png'}
                      placeholder={'/assets/images/accounts.png'}
                    />
                    <div className="account-name">{account}</div>
                  </td>
                  {tableColumnsHeaders.map((symbol) => {
                    const tokenFound = balances.find(
                      (tokenBalance) => tokenBalance.symbol === symbol,
                    );
                    return (
                      <td
                        key={`${account}-${symbol}-user-token-cell`}
                        className="value">
                        {!tokenFound || tokenFound.balance === 0
                          ? '-'
                          : FormatUtils.formatCurrencyValue(tokenFound.balance)}
                      </td>
                    );
                  })}
                  <td className="total-column">
                    {FormatUtils.formatCurrencyValue(totalHive)}
                  </td>
                  <td className="total-column">
                    {FormatUtils.formatCurrencyValue(totalUSD)}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="header-total">
                {chrome.i18n.getMessage('portfolio_table_column_sticky_totals')}
              </td>
              {totals.map(({ symbol, balance }) => {
                return (
                  <td className="total-column" key={`${symbol}-total`}>
                    {FormatUtils.formatCurrencyValue(balance)}
                  </td>
                );
              })}
              <td className="total-column" key={`total-value-hive`}>
                {FormatUtils.formatCurrencyValue(totalHive)}
              </td>
              <td className="total-column" key={`total-usd`}>
                -
              </td>
            </tr>
            <tr>
              <td className="header-total">
                {chrome.i18n.getMessage(
                  'portfolio_table_column_sticky_total_usd',
                )}
              </td>
              {totals.map(({ symbol, usdValue }) => {
                return (
                  <td className="total-column" key={`${symbol}-total-usd`}>
                    {FormatUtils.formatCurrencyValue(usdValue)}
                  </td>
                );
              })}
              <td className="total-column" key={`total-value-hive`}>
                -
              </td>
              <td className="total-column" key={`total-usd`}>
                {FormatUtils.formatCurrencyValue(totalUSD)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PortfolioTableComponent = PortfolioTable;

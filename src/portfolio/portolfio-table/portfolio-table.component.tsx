import React, { useEffect, useState } from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import {
  PortfolioBalance,
  UserPortfolio,
} from 'src/portfolio/portfolio.interface';
import FormatUtils from 'src/utils/format.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

interface Props {
  data: UserPortfolio[];
  tableColumnsHeaders: string[];
  setTotalValueUSDPortfolio: (value: number) => void;
}

const PortfolioTable = ({
  data,
  setTotalValueUSDPortfolio,
  tableColumnsHeaders,
}: Props) => {
  const [totals, setTotals] = useState<PortfolioBalance[]>([]);

  useEffect(() => {
    const tempTotals = PortfolioUtils.getTotals(tableColumnsHeaders, data);
    setTotals(tempTotals);
    setTotalValueUSDPortfolio(
      tempTotals.reduce((acc, curr) => acc + curr.usdValue, 0),
    );
  }, [data]);

  return (
    <div className="portfolio-table-container">
      <table className="table-react">
        <thead className="theader">
          <tr>
            <th className="column-header fixed-left">
              {chrome.i18n
                .getMessage('portfolio_table_column_header_account')
                .toUpperCase()}
            </th>
            {tableColumnsHeaders.map((columnHeaderLabel) => {
              return (
                <th
                  className="column-header"
                  key={`${columnHeaderLabel}-column-label`}>
                  {columnHeaderLabel}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map(({ account, balances }) => {
            return (
              <tr key={`${account}-tr-row`}>
                <td className="data-cell fixed-left avatar-username-container">
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
                      className="data-cell">
                      {!tokenFound || tokenFound.balance === 0
                        ? chrome.i18n.getMessage(
                            'portfolio_data_cell_zero_or_no_balance_text',
                          )
                        : FormatUtils.formatCurrencyValue(tokenFound.balance)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            <td className="data-cell fixed-left">
              {chrome.i18n
                .getMessage('portfolio_table_column_sticky_totals')
                .toUpperCase()}
            </td>
            {totals.map(({ symbol, balance }) => {
              return (
                <td className="data-cell" key={`${symbol}-total`}>
                  {FormatUtils.formatCurrencyValue(balance)}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="data-cell fixed-left">
              {chrome.i18n
                .getMessage('portfolio_table_column_sticky_total_usd')
                .toUpperCase()}
            </td>
            {totals.map(({ symbol, usdValue }) => {
              return (
                <td className="data-cell" key={`${symbol}-total-usd`}>
                  {FormatUtils.formatCurrencyValue(usdValue)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const PortfolioTableComponent = PortfolioTable;

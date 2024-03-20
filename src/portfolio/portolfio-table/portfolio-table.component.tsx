import { CurrencyPrices } from '@interfaces/bittrex.interface';
import CurrencyUtils from '@popup/hive/utils/currency.utils';
import React, { useEffect, useState } from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import {
  PortfolioTotalTokenItem,
  PortfolioUserData,
} from 'src/portfolio/portfolio.interface';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  data: PortfolioUserData[];
  currencyPrices: CurrencyPrices;
  setTotalValueUSDPortfolio: (value: number) => void;
}

const PortfolioTable = ({
  data,
  currencyPrices,
  setTotalValueUSDPortfolio,
}: Props) => {
  const [totals, setTotals] = useState<PortfolioTotalTokenItem[]>([]);

  useEffect(() => {
    console.log(data);
    getTotals();
  }, [data]);

  const getTotals = () => {
    let temp_totals: PortfolioTotalTokenItem[] = [];
    data.map(({ heTokenList }) => {
      heTokenList.map((token) => {
        if (temp_totals.find((item) => item.symbol === token.symbol)) {
          const indexFound = temp_totals.findIndex(
            (item) => item.symbol === token.symbol,
          );
          temp_totals[indexFound] = {
            symbol: temp_totals[indexFound].symbol,
            total: token.totalBalance + temp_totals[indexFound].total,
            totalUSD:
              token.totalBalanceUsdValue + temp_totals[indexFound].totalUSD,
          };
        } else {
          temp_totals.push({
            symbol: token.symbol,
            total: token.totalBalance,
            totalUSD: token.totalBalanceUsdValue,
          });
        }
      });
    });
    setTotals(temp_totals);
    setTotalValueUSDPortfolio(
      temp_totals.reduce((acc, curr) => acc + curr.totalUSD, 0) +
        data.reduce((acc, curr) => acc + curr.HIVE, 0) *
          (currencyPrices.hive.usd ?? 1) +
        data.reduce((acc, curr) => acc + curr.HP, 0) *
          (currencyPrices.hive.usd ?? 1) +
        data.reduce((acc, curr) => acc + curr.HBD, 0) *
          (currencyPrices.hive_dollar.usd ?? 1),
    );
  };

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
            <th className="column-header">
              {CurrencyUtils.getCurrencyLabels(false).hive}
            </th>
            <th className="column-header">
              {CurrencyUtils.getCurrencyLabels(false).hp}
            </th>
            <th className="column-header">
              {CurrencyUtils.getCurrencyLabels(false).hbd}
            </th>
            {data[0].heTokenList.map((columnLabel) => {
              return (
                <th
                  className="column-header"
                  key={`${columnLabel.symbol}-column-label`}>
                  {columnLabel.symbol}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((userData) => {
            return (
              <tr key={`${userData.account}-tr-row`}>
                <td className="data-cell fixed-left avatar-username-container">
                  <PreloadedImage
                    className="user-picture"
                    src={`https://images.hive.blog/u/${userData.account}/avatar`}
                    alt={'/assets/images/accounts.png'}
                    placeholder={'/assets/images/accounts.png'}
                  />
                  <div className="account-name">{userData.account}</div>
                </td>
                <td className="data-cell">
                  {FormatUtils.formatCurrencyValue(userData.HIVE)}
                </td>
                <td className="data-cell">
                  {FormatUtils.formatCurrencyValue(userData.HP)}
                </td>
                <td className="data-cell">
                  {FormatUtils.formatCurrencyValue(userData.HBD)}
                </td>
                {userData.heTokenList.map((userTokenData) => {
                  return (
                    <td
                      key={`${userTokenData.symbol}-user-token-cell`}
                      className="data-cell">
                      {!userTokenData.totalBalance ||
                      userTokenData.totalBalance === 0
                        ? chrome.i18n.getMessage(
                            'portfolio_data_cell_zero_or_no_balance_text',
                          )
                        : FormatUtils.formatCurrencyValue(
                            userTokenData.totalBalance,
                          )}
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
            <td className="data-cell">
              {FormatUtils.formatCurrencyValue(
                data.reduce((acc, curr) => acc + curr.HIVE, 0),
              )}
            </td>
            <td className="data-cell">
              {FormatUtils.formatCurrencyValue(
                data.reduce((acc, curr) => acc + curr.HP, 0),
              )}
            </td>
            <td className="data-cell">
              {FormatUtils.formatCurrencyValue(
                data.reduce((acc, curr) => acc + curr.HBD, 0),
              )}
            </td>
            {totals.map((totalToken) => {
              return (
                <td className="data-cell" key={`${totalToken.symbol}-total`}>
                  {FormatUtils.formatCurrencyValue(totalToken.total)}
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
            <td className="data-cell">
              {FormatUtils.formatCurrencyValue(
                data.reduce((acc, curr) => acc + curr.HIVE, 0) *
                  (currencyPrices.hive.usd ?? 1),
              )}
            </td>
            <td className="data-cell">
              {FormatUtils.formatCurrencyValue(
                data.reduce((acc, curr) => acc + curr.HP, 0) *
                  (currencyPrices.hive.usd ?? 1),
              )}
            </td>
            <td className="data-cell">
              {FormatUtils.formatCurrencyValue(
                data.reduce((acc, curr) => acc + curr.HBD, 0) *
                  (currencyPrices.hive_dollar.usd ?? 1),
              )}
            </td>
            {totals.map((totalToken) => {
              return (
                <td
                  className="data-cell"
                  key={`${totalToken.symbol}-total-usd`}>
                  {FormatUtils.formatCurrencyValue(totalToken.totalUSD)}
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

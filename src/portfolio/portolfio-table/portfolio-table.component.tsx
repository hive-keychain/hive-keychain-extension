import { CurrencyPrices } from '@interfaces/bittrex.interface';
import React from 'react';
import { PortfolioUserData } from 'src/portfolio/portfolio.interface';
import FormatUtils from 'src/utils/format.utils';

//TODO bellow add proper interfaces
interface Props {
  data: PortfolioUserData[];
  currencyPrices: CurrencyPrices;
}

const PortfolioTableComponent = ({ data, currencyPrices }: Props) => {
  // const [columnHeaderTokenList, setColumnHeaderTokenList] = useState([]);
  // const [totals, setTotals] = useState<{
  //     totalHIVE: number;
  //     totalHP: number;
  //     totalHBD: number;
  // }>({
  //     totalHIVE: 0,
  //     totalHP: 0,
  //     totalHBD: 0
  // });

  // useEffect(() => {
  //     let tempList: string[] = [];
  //     data.map(userData => {
  //         userData.heTokenList.map(heTokenItem => {
  //             if(!tempList.includes(heTokenItem.symbol)){
  //                 tempList.push(heTokenItem.symbol);
  //             }
  //         })
  //     })
  // }, []);

  const getTotalTokens = (data: PortfolioUserData[], get: 'USD' | 'TOTAL') => {
    let totals: { symbol: string; total: number; totalUSD: number }[] = [];
    data.map(({ heTokenList }) => {
      heTokenList.map((token) => {
        if (totals.find((item) => item.symbol === token.symbol)) {
          const indexFound = totals.findIndex(
            (item) => item.symbol === token.symbol,
          );
          totals[indexFound] = {
            symbol: totals[indexFound].symbol,
            total: token.totalBalance + totals[indexFound].total,
            totalUSD: token.totalBalanceUsdValue + totals[indexFound].totalUSD,
          };
        } else {
          totals.push({
            symbol: token.symbol,
            total: token.totalBalance,
            totalUSD: token.totalBalanceUsdValue,
          });
        }
      });
    });
    return totals.map((totalToken) => {
      return get === 'TOTAL' ? (
        <td className="data-cell" key={`${totalToken.symbol}-total`}>
          {FormatUtils.formatCurrencyValue(totalToken.total)}
        </td>
      ) : (
        <td className="data-cell" key={`${totalToken.symbol}-total-usd`}>
          {FormatUtils.formatCurrencyValue(totalToken.totalUSD)}
        </td>
      );
    });
  };

  //TODO bellow add tr keys if needed.
  return (
    <div className="portfolio-table-container">
      <table className="table-react">
        <thead className="theader">
          <tr>
            <th className="column-header fixed-left">ACCOUNT</th>
            <th className="column-header">HIVE</th>
            <th className="column-header">HP</th>
            <th className="column-header">HBD</th>
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
                <td className="data-cell fixed-left">{userData.account}</td>
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
                        ? '-'
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
            <td className="data-cell fixed-left">TOTALS</td>
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
            {getTotalTokens(data, 'TOTAL')}
          </tr>
          <tr>
            <td className="data-cell fixed-left">TOTAL USD</td>
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
            {getTotalTokens(data, 'USD')}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTableComponent;

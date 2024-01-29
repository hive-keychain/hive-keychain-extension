import { ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
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
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
//TODO important each 0 value, place a - no value. Tokens & currencies.
//TODO when finished, refactor code as possible, adding utils, etc.

const PortfolioComponent = () => {
  const [theme, setTheme] = useState<Theme>();
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [extendedAccountsList, setExtendedAccountsList] = useState<
    ExtendedAccount[]
  >([]);
  const [globalProperties, setGlobalProperties] =
    useState<GlobalProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //TODO bellow needs to define properly in order to have ExtendedAccount Data + TokenBalance, somehow.
  const [data, setData] = useState<{ nodes: any[] }>({ nodes: [] });

  const [extraColumns, setExtraColumns] = useState<
    { label: string; renderCell: (item: any) => void }[]
  >([]);
  const [themeTable, setThemeTable] = useState<any>();
  const [currencyPrices, setCurrencyPrices] = useState<CurrencyPrices>();
  // let tokensBalanceList: TokenBalance[][] = [];
  const [tokensBalanceList, setTokensBalanceList] = useState<TokenBalance[][]>(
    [],
  );

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
      //TODO setMessage using "no_account_found_on_ledger_error"
    } else {
      setLocalAccounts(localAccounts);
      const extAccounts = await AccountUtils.getExtendedAccounts(
        localAccounts.map((localAcc) => localAcc.name),
      );
      setExtendedAccountsList(extAccounts);
      console.log({ extAccounts }); //TODO remove line
      loadGlobalProps();
      loadCurrencyPrices();
      loadUserTokens(localAccounts);
      // setIsLoading(false);
    }
  };

  const loadCurrencyPrices = async () => {
    try {
      const prices = await CurrencyPricesUtils.getPrices();
      if (prices) {
        setCurrencyPrices(prices);
      }
      console.log({ prices });
    } catch (error) {
      //TODO add as Logger.
      console.log('Error loading prices!', { error });
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
      console.log('Error getting globals!', error);
    }
  };

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

  const getFormatedValue = (value: string, key: string) => {
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

  const getRenderCell = (item: any, key: string) => {
    //TODO bellow check & add missing keys per item/object/div
    //TODO add to translations if needed or check if already there.
    if (!item[key]) return <div>-</div>;

    if (key === 'name') {
      if (item[key] === 'totals')
        return (
          <div
            className="avatar-username-container"
            key={'totals-last-row-table'}>
            <div className="account-name">TOTALS</div>
          </div>
        );
      if (item[key] === 'totals_usd') {
        return (
          <div
            className="avatar-username-container"
            key={'totals-last-row-table'}>
            <div className="account-name">USD VALUE</div>
          </div>
        );
      }
      return (
        <div className="avatar-username-container">
          <PreloadedImage
            className="user-picture"
            src={`https://images.hive.blog/u/${item[key]}/avatar`}
            alt={'/assets/images/accounts.png'}
            placeholder={'/assets/images/accounts.png'}
          />
          <div className="account-name">{String(item[key])}</div>
        </div>
      );
    } else {
      const formatedValue = getFormatedValue(String(item[key]), key);
      return <div className="text">{formatedValue}</div>;
    }
  };

  //DATA set
  const getTotal = (
    key: 'balance' | 'hbd_balance' | 'vesting_shares',
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
    } else {
      //(key === 'vesting_shares')
      return (
        list
          .reduce(
            (acc, curr) =>
              acc + Number((curr.vesting_shares as string).split(' ')[0]),
            0,
          )
          .toString() + ' VESTS'
      );
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
      //TODO next step bellow.
      //  - getTokens
      //  - getUserBalance of each account
      //  - select the account who has more tokens. Using this symbols as array[strings], add them into keysToUse
      //  - to  test, add the new item value as 0.
      //  - render each token balance of each user in their column.
      //  - apply the - considering the renderItem function.
      //TODO keep working on this

      const tokensSymbols = tokensBalanceList[0].map((token) => token.symbol);
      console.log({ tokensSymbols });
      const totalBalance = getTotal('balance', extendedAccountsList);
      const totalHBDBalance = getTotal('hbd_balance', extendedAccountsList);
      const totalHP = getTotal('vesting_shares', extendedAccountsList);

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

      console.log({ portfolioUserData }); //TODO remove line
      const keysToUse = Object.keys(portfolioUserData[0]).map((key) => key);
      setData({
        nodes: [
          ...portfolioUserData,
          {
            name: 'totals',
            balance: totalBalance,
            hbd_balance: totalHBDBalance,
            vesting_shares: totalHP,
          } as any,
          {
            name: 'totals_usd',
            balance: FormatUtils.formatCurrencyValue(
              +totalBalance.split(' ')[0]! * (currencyPrices.hive.usd ?? 1),
            ),
            hbd_balance: FormatUtils.formatCurrencyValue(
              +totalHBDBalance.split(' ')[0] *
                (currencyPrices.hive_dollar.usd ?? 1),
            ),
            vesting_shares: FormatUtils.formatCurrencyValue(
              +FormatUtils.toHP(
                getTotal('vesting_shares', extendedAccountsList),
                globalProperties.globals,
              ) * (currencyPrices.hive.usd ?? 1),
            ),
          } as any,
        ],
      });
      // const extendedAccountFilteredKeys = Object.keys(
      //   extendedAccountsList[0],
      // ).filter((k) => keysToUse.includes(k));
      // const tokensColumns = ['LEO'];
      const extra = keysToUse.map((key) => {
        return {
          label: getLabelCell(key),
          renderCell: (item: any) => getRenderCell(item, key),
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
          </>
        )}
    </div>
  );
};

export default PortfolioComponent;

//TODO cleanup removed code bellow
// {!isLoading && globalProperties && (
//   <div className="portfolio-accounts-panel">
//     <div className="title">Your Accounts</div>
//     <div className="grid-parent">
//       {/* <div className="info-row">
//         <div className="label">Account</div>
//         <div className="label">HP</div>
//         <div className="label">HBD</div>
//         <div className="label">HIVE</div>
//       </div> */}
//       {extendedAccountsList.map((acc, index) => {
//         return (
//           <div key={`${acc.name}-${index}`} className="info-row">
//             <div className="label">@{acc.name}</div>
//             <div className="value">
//               {FormatUtils.withCommas(
//                 FormatUtils.toHP(
//                   acc.vesting_shares as string,
//                   globalProperties.globals,
//                 ).toFixed(6),
//               )}
//             </div>
//             <div className="value">
//               {FormatUtils.withCommas(
//                 (acc.savings_hbd_balance as string).split(' ')[0],
//               )}
//             </div>
//             <div className="value">
//               {FormatUtils.withCommas(
//                 (acc.balance as string).split(' ')[0],
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   </div>
// )}

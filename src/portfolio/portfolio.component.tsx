import { ExtendedAccount } from '@hiveio/dhive';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import HiveUtils from '@popup/hive/utils/hive.utils';
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

const nodes = [
  {
    id: '0',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '1',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '2',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '3',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '4',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '5',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '5',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '6',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '7',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '8',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '9',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '9',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '10',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '11',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '12',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '13',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
  {
    id: '14',
    name: 'Shopping List',
    deadline: 'dedaline',
    type: 'TASK',
    isComplete: true,
    nodes: 3,
  },
];

const COLUMNS = [
  { label: 'Task', renderCell: (item: any) => item.name },
  {
    label: 'Deadline',
    renderCell: (item: any) => item.deadline,
  },
  { label: 'Type', renderCell: (item: any) => item.type },
  {
    label: 'Complete',
    renderCell: (item: any) => item.isComplete.toString(),
  },
  { label: 'Tasks', renderCell: (item: any) => item.nodes },
];

const PortfolioComponent = () => {
  const [theme, setTheme] = useState<Theme>();
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [extendedAccountsList, setExtendedAccountsList] = useState<
    ExtendedAccount[]
  >([]);
  const [globalProperties, setGlobalProperties] =
    useState<GlobalProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [columns, setColumns] = useState([]); //TODO see if types needed at all
  const [data, setData] = useState<{ nodes: ExtendedAccount[] }>({ nodes: [] });
  const [extraColumns, setExtraColumns] = useState<
    { label: string; renderCell: (item: any) => void }[]
  >([]);
  const [themeTable, setThemeTable] = useState<any>();

  const getCOLUMNS = (globalProperties: GlobalProperties) => [
    { label: 'Account', renderCell: (item: ExtendedAccount) => item.name },
    {
      label: 'HP',
      renderCell: (item: ExtendedAccount) =>
        FormatUtils.withCommas(
          FormatUtils.toHP(
            item.vesting_shares as string,
            globalProperties.globals,
          ).toFixed(6),
        ),
    },
    { label: 'HIVE', renderCell: (item: ExtendedAccount) => item.balance },
    {
      label: 'HBD',
      renderCell: (item: ExtendedAccount) => item.hbd_balance,
    },
  ];

  //testing data react tables
  // const themeTable = useTheme([
  //   getTheme(),
  //   {
  //     Table: `
  //        --data-table-library_grid-template-columns:  25% 25% 25% 25% 25% minmax(150px, 1fr);
  //     `,
  //   },
  // ]);
  // const data = { nodes };

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
      setIsLoading(false);
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

  const getRenderCell = (item: any, key: string) => {
    if (key === 'name') {
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
      return String(item[key]);
    }
  };

  //DATA set
  useEffect(() => {
    if (extendedAccountsList.length > 0 && globalProperties?.globals) {
      // setColumns([
      //   { label: 'Account', renderCell: (item: ExtendedAccount) => item.name },
      //   {
      //     label: 'HP',
      //     renderCell: (item: ExtendedAccount) =>
      //       FormatUtils.withCommas(
      //         FormatUtils.toHP(
      //           item.vesting_shares as string,
      //           globalProperties.globals,
      //         ).toFixed(6),
      //       ),
      //   },
      //   { label: 'HIVE', renderCell: (item: ExtendedAccount) => item.balance },
      //   {
      //     label: 'HBD',
      //     renderCell: (item: ExtendedAccount) => item.hbd_balance,
      //   },
      // ]);
      const keysToUse = ['name', 'vesting_shares', 'hbd_balance', 'balance'];
      setData({
        nodes: extendedAccountsList,
      });
      const extra = Object.keys(extendedAccountsList[0])
        .filter((k) => keysToUse.includes(k))
        .map((key) => {
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
  }, [extendedAccountsList, globalProperties]);

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
      {!isLoading && data && globalProperties && extraColumns && (
        <CompactTable
          columns={extraColumns}
          data={data}
          theme={themeTable}
          layout={{ horizontalScroll: true, fixedHeader: true, custom: true }}
        />
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

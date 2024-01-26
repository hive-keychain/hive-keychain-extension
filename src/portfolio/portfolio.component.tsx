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
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
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
  // const [columnsData, setColumnsData] = useState<any>([]); //TODO see if types needed at all

  //testing data react tables
  const themeTable = useTheme([
    getTheme(),
    {
      HeaderRow: `
        background-color: #eaf5fd;
      `,
      Row: `
        &:nth-of-type(odd) {
          background-color: #d2e9fb;
        }

        &:nth-of-type(even) {
          background-color: #eaf5fd;
        }
      `,
    },
  ]);
  const data = { nodes };

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
      // loadGlobalProps();
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
      setIsLoading(false);
    } catch (error) {
      console.log('Error getting globals!', error);
    }
  };

  //DATA set
  // useEffect(() => {
  //   if (extendedAccountsList.length > 0) {
  //     // const COLUMNS = [
  //     //   { label: "Task", renderCell: (item: ExtendedAccount) => item.name },
  //     //   {
  //     //     label: "Deadline",
  //     //     renderCell: (item) =>
  //     //       item.deadline.toLocaleDateString("en-US", {
  //     //         year: "numeric",
  //     //         month: "2-digit",
  //     //         day: "2-digit",
  //     //       }),
  //     //   },
  //     //   { label: "Type", renderCell: (item) => item.type },
  //     //   {
  //     //     label: "Complete",
  //     //     renderCell: (item) => item.isComplete.toString(),
  //     //   },
  //     //   { label: "Tasks", renderCell: (item) => item.nodes?.length },
  //     // ];
  //     setColumnsData([
  //       { label: 'Account', renderCell: (item: ExtendedAccount) => item.name },
  //     ]);
  //     setIsLoading(false);
  //   }
  // }, [extendedAccountsList, globalProperties]);

  //TODO added for testing
  // useEffect(() => {
  //   if (columnsData.length) {
  //     console.log({ columnsData });
  //   }
  // }, [columnsData]);
  //End block to remove

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
      {!isLoading && (
        <CompactTable
          columns={COLUMNS}
          data={data}
          theme={themeTable}
          layout={{ fixedHeader: true }}
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

import { SetWithdrawVestingRouteOperation } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  AccountVestingRoutesDifferences,
  UserVestingRoute,
  VestingRoute,
  VestingRouteDifference,
} from '@interfaces/vesting-routes.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import _ from 'lodash';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getVestingRoutes = async (
  name: string,
  type: 'outgoing' | 'incoming' | 'all',
): Promise<VestingRoute[]> => {
  let vestingRoutes = await HiveTxUtils.getData(
    'condenser_api.get_withdraw_routes',
    [name, type],
  );
  return vestingRoutes.map((vestingRoute: any) => {
    return {
      fromAccount: vestingRoute.from_account,
      toAccount: vestingRoute.to_account,
      percent: vestingRoute.percent,
      autoVest: vestingRoute.auto_vest,
    } as VestingRoute;
  });
};

const getAllAccountsVestingRoutes = async (
  names: string[],
  type: 'outgoing' | 'incoming' | 'all',
) => {
  const allAccountsVestingRoutes: UserVestingRoute[] = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const vestingRoutes = await VestingRoutesUtils.getVestingRoutes(name, type);
    allAccountsVestingRoutes.push({
      account: name,
      routes: vestingRoutes,
    });
  }
  return allAccountsVestingRoutes;
};

const getLastVestingRoutes = async () => {
  const result: UserVestingRoute[] | null =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_VESTING_ROUTES,
    );
  return result ?? null;
};

//TODO remove this function and its use after review
const clearLastVestingRoutesInStorage = async () => {
  Logger.log('Cleared LAST_VESTING_ROUTES');
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
  );
};

const getWrongVestingRoutes = async (
  localAccounts: LocalAccount[],
  //TODO remove bellow after fixes in review
  clearForTesting?: boolean,
) => {
  if (clearForTesting) {
    await VestingRoutesUtils.clearLastVestingRoutesInStorage();
    return undefined;
  }
  let currentVestingRoutes =
    await VestingRoutesUtils.getAllAccountsVestingRoutes(
      localAccounts.map((acc) => acc.name),
      'outgoing',
    );

  const lastVestingRoutes = await VestingRoutesUtils.getLastVestingRoutes();
  console.log({ lastVestingRoutes, currentVestingRoutes }); //TODO remove line
  if (!lastVestingRoutes) {
    VestingRoutesUtils.saveLastVestingRoutes(currentVestingRoutes);
    return undefined;
  }

  let accountsVestingRoutesDifferences: AccountVestingRoutesDifferences[] = [];

  for (const account of localAccounts) {
    const accountVestingRoutesDifferences: AccountVestingRoutesDifferences = {
      account: account.name,
      differences: [],
    };
    const oldRoutes = lastVestingRoutes.find(
      (vestingRoute) => vestingRoute.account === account.name,
    );
    const currentRoutes = currentVestingRoutes.find(
      (vestingRoute) => vestingRoute.account === account.name,
    );

    // Compare
    if (!_.isEqual(oldRoutes, currentRoutes)) {
      if (oldRoutes)
        for (const oldRoute of oldRoutes.routes) {
          let difference: VestingRouteDifference = {};
          const foundInCurrentRoutes = currentRoutes?.routes.find(
            (route) => route.toAccount === oldRoute.toAccount,
          );
          if (foundInCurrentRoutes) {
            if (!_.isEqual(foundInCurrentRoutes, oldRoute)) {
              difference = { oldRoute, newRoute: foundInCurrentRoutes };
            }
          } else {
            difference = { oldRoute, newRoute: undefined };
          }
          accountVestingRoutesDifferences.differences.push(difference);
        }
      if (currentRoutes)
        for (const currentRoute of currentRoutes.routes) {
          let difference: VestingRouteDifference = {};
          const foundInOldRoutes = oldRoutes?.routes.find(
            (route) => route.toAccount === currentRoute.toAccount,
          );
          if (foundInOldRoutes) {
            if (!_.isEqual(foundInOldRoutes, currentRoute)) {
              if (
                !accountVestingRoutesDifferences.differences.find(
                  (diff) =>
                    diff.newRoute?.toAccount === currentRoute.toAccount &&
                    diff.oldRoute?.toAccount === foundInOldRoutes?.toAccount,
                )
              )
                difference = {
                  newRoute: currentRoute,
                  oldRoute: foundInOldRoutes,
                };
            }
          } else {
            difference = { oldRoute: undefined, newRoute: currentRoute };
          }
          if (difference.oldRoute || difference.newRoute) {
            accountVestingRoutesDifferences.differences.push(difference);
          }
        }
    }

    if (accountVestingRoutesDifferences.differences.length > 0) {
      //push but remove posible empty objects
      accountsVestingRoutesDifferences.push({
        account: accountVestingRoutesDifferences.account,
        differences: accountVestingRoutesDifferences.differences.filter(
          (i) => Object.keys(i).length,
        ),
      });
    }
  }
  return accountsVestingRoutesDifferences.length > 0
    ? accountsVestingRoutesDifferences
    : undefined;
};

const saveLastVestingRoutes = async (vestingRoutes: UserVestingRoute[]) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
    vestingRoutes,
  );
};

const sendVestingRoute = async (
  fromAccount: string,
  toAccount: string,
  percent: number,
  autoVest: boolean,
  activeKey: Key,
) => {
  return HiveTxUtils.sendOperation(
    [
      VestingRoutesUtils.getVestingRouteOperation(
        fromAccount,
        toAccount,
        percent,
        autoVest,
      ),
    ],
    activeKey,
  );
};

const getVestingRouteOperation = (
  fromAccount: string,
  toAccount: string,
  percent: number,
  autoVest: boolean,
): SetWithdrawVestingRouteOperation => {
  return [
    'set_withdraw_vesting_route',
    {
      from_account: fromAccount,
      to_account: toAccount,
      percent: percent,
      auto_vest: autoVest,
    },
  ];
};

const skipAccountRoutes = async (
  differences: VestingRouteDifference[],
  account: string,
  isLast: boolean,
) => {
  let lastRoutes = await VestingRoutesUtils.getLastVestingRoutes();
  let lastUserRoutes = lastRoutes!.find((i) => i.account === account)!;
  differences.map((difference) => {
    if (difference.oldRoute && difference.newRoute) {
      const foundIndexInLast = lastUserRoutes?.routes.findIndex(
        (l) => l.toAccount === difference.newRoute?.toAccount,
      );
      if (foundIndexInLast !== undefined && foundIndexInLast > -1) {
        lastUserRoutes!.routes[foundIndexInLast] = difference.newRoute;
      }
    } else if (difference.newRoute) {
      lastUserRoutes?.routes.push(difference.newRoute);
    } else if (difference.oldRoute) {
      lastUserRoutes!.routes = lastUserRoutes!.routes.filter(
        (l) => l.toAccount !== difference.oldRoute?.toAccount,
      );
    }
  });
  await VestingRoutesUtils.saveLastVestingRoutes(lastRoutes!);
};

const revertAccountRoutes = async (
  differences: VestingRouteDifference[],
  account: string,
  isLast: boolean,
) => {
  //TODO about now
  // const activeKey = accounts.find((a) => a.name === account)?.keys.active!;
  // const broadcastOperation: {
  //   fromAccount: string;
  //   toAccount: string;
  //   percent: number;
  //   autoVest: boolean;
  // }[] = [];
  // if (lastRoutes.length === currentRoutes.length) {
  //   lastRoutes.map(({ fromAccount, toAccount, percent, autoVest }) => {
  //     broadcastOperation.push({
  //       fromAccount,
  //       toAccount,
  //       percent,
  //       autoVest,
  //     });
  //   });
  // } else if (currentRoutes.length > lastRoutes.length) {
  //   currentRoutes.map((c) => {
  //     const foundInlast = lastRoutes.find(({ id }) => id === c.id);
  //     if (!foundInlast) {
  //       broadcastOperation.push({
  //         fromAccount: c.fromAccount,
  //         toAccount: c.toAccount,
  //         percent: 0,
  //         autoVest: c.autoVest,
  //       });
  //     }
  //   });
  // } else if (currentRoutes.length < lastRoutes.length) {
  //   lastRoutes.map((l) => {
  //     const foundInCurr = currentRoutes.find((c) => c.id === l.id);
  //     if (!foundInCurr) {
  //       broadcastOperation.push({
  //         fromAccount: l.fromAccount,
  //         toAccount: l.toAccount,
  //         percent: l.percent,
  //         autoVest: l.autoVest,
  //       });
  //     }
  //   });
  // }
  // try {
  //   for (const t of broadcastOperation) {
  //     const result = await VestingRoutesUtils.sendVestingRoute(
  //       t.fromAccount,
  //       t.toAccount,
  //       t.percent,
  //       t.autoVest,
  //       activeKey,
  //     );
  //   }
  //   // no need
  //   const currentRoutes = await VestingRoutesUtils.getAllAccountsVestingRoutes(
  //     accounts.map((a) => a.name),
  //     'outgoing',
  //   );
  // } catch (error) {
  //   Logger.error('Error while sending vesting route', true);
  // }
};

export const VestingRoutesUtils = {
  getVestingRoutes,
  getAllAccountsVestingRoutes,
  getLastVestingRoutes,
  saveLastVestingRoutes,
  getWrongVestingRoutes,
  clearLastVestingRoutesInStorage,
  getVestingRouteOperation,
  sendVestingRoute,
  skipAccountRoutes,
  revertAccountRoutes,
};

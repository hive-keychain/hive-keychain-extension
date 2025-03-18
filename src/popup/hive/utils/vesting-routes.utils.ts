import type { SetWithdrawVestingRouteOperation } from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
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

const getWrongVestingRoutes = async (localAccounts: LocalAccount[]) => {
  let currentVestingRoutes =
    await VestingRoutesUtils.getAllAccountsVestingRoutes(
      localAccounts.map((acc) => acc.name),
      'outgoing',
    );

  const lastVestingRoutes = await VestingRoutesUtils.getLastVestingRoutes();
  if (!lastVestingRoutes) {
    VestingRoutesUtils.saveLastVestingRoutes(currentVestingRoutes);
    return undefined;
  }

  let accountsVestingRoutesDifferences: AccountVestingRoutesDifferences[] = [];
  let missingRoutes = [];
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

    if (!oldRoutes && currentRoutes) {
      missingRoutes.push(currentRoutes);
      continue;
    }

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
  saveLastVestingRoutes([...lastVestingRoutes, ...missingRoutes]);
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
  options?: TransactionOptions,
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
    false,
    options,
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
  accounts: LocalAccount[],
  differences: VestingRouteDifference[],
  account: string,
  options?: TransactionOptions,
) => {
  const broadcastOperations: SetWithdrawVestingRouteOperation[] = [];
  const activeKey = accounts.find((a) => a.name === account)?.keys.active!;
  if (activeKey) {
    differences.map(({ oldRoute, newRoute }) => {
      if (oldRoute) {
        const { fromAccount, toAccount, percent, autoVest } = oldRoute;
        broadcastOperations.push(
          getVestingRouteOperation(fromAccount, toAccount, percent, autoVest),
        );
      } else if (newRoute) {
        const { fromAccount, toAccount, autoVest } = newRoute;
        broadcastOperations.push(
          getVestingRouteOperation(fromAccount, toAccount, 0, autoVest),
        );
      }
    });
    try {
      const options: TransactionOptions = {};

      const result = await HiveTxUtils.sendOperation(
        broadcastOperations,
        activeKey,
        false,
        options,
      );
    } catch (error) {
      Logger.error('Error while reverting vesting route(s)', true);
    }
  }
};

export const VestingRoutesUtils = {
  getVestingRoutes,
  getAllAccountsVestingRoutes,
  getLastVestingRoutes,
  saveLastVestingRoutes,
  getWrongVestingRoutes,
  getVestingRouteOperation,
  sendVestingRoute,
  skipAccountRoutes,
  revertAccountRoutes,
};

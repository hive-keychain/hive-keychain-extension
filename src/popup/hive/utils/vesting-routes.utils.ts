import { SetWithdrawVestingRouteOperation } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  UserLastCurrentRoutes,
  UserVestingRoute,
  VestingRoute,
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
      id: vestingRoute.id,
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

const clearLastVestingRoutesInStorage = async () => {
  Logger.log('Cleared LAST_VESTING_ROUTES');
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
  );
};

const getWrongVestingRoutes = (
  lastVestingRoutes: UserVestingRoute[],
  currentVestingRoutes: UserVestingRoute[],
) => {
  let userRoutes: UserLastCurrentRoutes[] = [];
  if (!_.isEqual(lastVestingRoutes, currentVestingRoutes)) {
    currentVestingRoutes.map((item) => {
      let currentVestingRoute = { ...item };
      let foundLastRoutes = lastVestingRoutes.find(
        (lastVestingRoute) =>
          lastVestingRoute.account === currentVestingRoute.account,
      )!.routes;
      if (!_.isEqual(foundLastRoutes, currentVestingRoute.routes)) {
        foundLastRoutes = foundLastRoutes.filter((foundlastRoute) => {
          if (
            currentVestingRoute.routes.find((item) =>
              _.isEqual(item, foundlastRoute),
            )
          ) {
            //now we remove it from the current as well, before assign it later on
            currentVestingRoute.routes = currentVestingRoute.routes.filter(
              (c) => c.id !== foundlastRoute.id,
            );
            return false;
          }
          return true;
        });

        userRoutes.push({
          account: currentVestingRoute.account,
          lastRoutes: foundLastRoutes,
          currentRoutes: currentVestingRoute.routes,
        });
      }
    });
    userRoutes = userRoutes.filter(
      (item) => item.currentRoutes.length > 0 || item.lastRoutes.length > 0,
    );
  }
  return userRoutes.length > 0 ? userRoutes : undefined;
};

const saveLastVestingRoutes = async (vestingRoutes: UserVestingRoute[]) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
    vestingRoutes,
  );
};

const sendVestingRoute = async (
  from: string,
  to: string,
  percent: number,
  auto_vest: boolean,
  activeKey: Key,
) => {
  return HiveTxUtils.sendOperation(
    [VestingRoutesUtils.getVestingRouteOperation(from, to, percent, auto_vest)],
    activeKey,
  );
};

const getVestingRouteOperation = (
  from: string,
  to: string,
  percent: number,
  auto_vest: boolean,
): SetWithdrawVestingRouteOperation => {
  return [
    'set_withdraw_vesting_route',
    {
      from_account: from,
      to_account: to,
      percent: percent,
      auto_vest: auto_vest,
    },
  ];
};

const sendTestVestingRoutes = async (
  testingAccounts: string[],
  accounts: LocalAccount[],
  percent: number,
  showResultLogs?: boolean,
) => {
  testingAccounts.map(async (acc) => {
    const userAK = accounts.find((a) => a.name === acc)?.keys.active;
    if (userAK) {
      const result = await VestingRoutesUtils.sendVestingRoute(
        acc,
        'stoodkev',
        percent,
        false,
        userAK,
      );
      if (showResultLogs)
        Logger.log('sendVestingRoute test results: ', { result });
    } else {
      Logger.error(`Need to add active key for: ${acc}`);
    }
  });
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
  sendTestVestingRoutes,
};

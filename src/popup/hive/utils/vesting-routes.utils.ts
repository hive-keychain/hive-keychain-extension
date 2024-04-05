import {
  UserLastCurrentRoutes,
  UserVestingRoute,
} from '@interfaces/vesting-routes.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import _ from 'lodash';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getVestingRoutes = async (
  name: string,
  type: 'outgoing' | 'incoming' | 'all',
) => {
  return await HiveTxUtils.getData('condenser_api.get_withdraw_routes', [
    name,
    type,
  ]);
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
  console.log('Cleared LAST_VESTING_ROUTES'); //TODO remove line
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

export const VestingRoutesUtils = {
  getVestingRoutes,
  getAllAccountsVestingRoutes,
  getLastVestingRoutes,
  saveLastVestingRoutes,
  getWrongVestingRoutes,
  clearLastVestingRoutesInStorage,
};

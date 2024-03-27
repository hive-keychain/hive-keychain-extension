import {
  UserVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
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
  // for (const name of names) {
  //   allAccountsVestingRoutes.push({
  //     account: name,
  //     routes: await getVestingRoutes(name, type),
  //   });
  // }
  return allAccountsVestingRoutes;
};

const getLastVestingRoutes = async () => {
  const result: UserVestingRoute[] | null =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_VESTING_ROUTES,
    );
  return result ?? null;
};

const getDifferentVestingRoutesFound = (
  lastVestingRoutes: UserVestingRoute[],
  currentVestingRoutes: UserVestingRoute[],
) => {
  let differentVestingRoutesFound: UserVestingRoute[] = [];
  for (const vestingRoute of lastVestingRoutes) {
    const { routes: lastRoutes } = vestingRoute;
    const account = vestingRoute.account;
    const foundInCurrent = currentVestingRoutes.find(
      (item) => item.account === account,
    );
    if (foundInCurrent) {
      const { routes: currentRoutes } = foundInCurrent;
      if (currentRoutes.length !== lastRoutes.length) {
        console.log('Different lentghs!');
        //difference found
        let symDifference = currentRoutes
          .filter((x) => !lastRoutes.includes(x))
          .concat(lastRoutes.filter((x) => !currentRoutes.includes(x)));
        differentVestingRoutesFound.push({ account, routes: symDifference });
      } else if (
        currentRoutes.length === lastRoutes.length &&
        currentRoutes.length > 0 &&
        lastRoutes.length > 0
      ) {
        console.log('Same lentghs!');
        //each field must be exactly equal
        let routesWithChangedFields: VestingRoute[] = [];
        let currentRoutesWithChanges: VestingRoute[] = [];
        lastRoutes.forEach((lastRoute) => {
          const { id, fromAccount, toAccount, percent, autoVest } = lastRoute;
          const currentRouteFound = currentRoutes.find(
            (item) => item.id === id,
          );
          if (currentRouteFound) {
            const {
              fromAccount: currentRoutefromAccount,
              toAccount: currentRouteToAccount,
              percent: currentRoutePercent,
              autoVest: currentRouteAutoVest,
            } = currentRouteFound;
            if (
              fromAccount !== currentRoutefromAccount ||
              toAccount !== currentRouteToAccount ||
              percent !== currentRoutePercent ||
              autoVest !== currentRouteAutoVest
            ) {
              //at least one field changed.
              routesWithChangedFields.push({
                id,
                fromAccount,
                toAccount,
                percent,
                autoVest,
              } as VestingRoute);
              currentRoutesWithChanges.push({
                id,
                fromAccount: currentRoutefromAccount,
                toAccount: currentRouteToAccount,
                percent: currentRoutePercent,
                autoVest: currentRouteAutoVest,
              });
            }
          }
        });
        if (routesWithChangedFields.length > 0) {
          differentVestingRoutesFound.push({
            account,
            routes: routesWithChangedFields,
            routesChanged: currentRoutesWithChanges,
          });
        }
      }
    }
  }
  return differentVestingRoutesFound;
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
  getDifferentVestingRoutesFound,
};

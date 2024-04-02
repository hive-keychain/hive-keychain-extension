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

const clearLastVestingRoutesInStorage = async () => {
  console.log('Clear LAST_VESTING_ROUTES'); //TODO remove line
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
  );
};

const getDifferentVestingRoutesFound = (
  lastVestingRoutes: UserVestingRoute[],
  currentVestingRoutes: UserVestingRoute[],
) => {
  //TODO recode this to return an object we can already use & edit as we need.
  const routes: {
    account: string;
    lastRoutes:
      | VestingRoute[]
      | {
          id: number;
          status: 'non existent';
        }[];
    newRoutes:
      | VestingRoute[]
      | {
          id: number;
          status: 'non existent';
        }[];
  }[] = [];
  let differentVestingRoutesFound: UserVestingRoute[] = [];

  //new way to test
  for (const currentVestingRoute of currentVestingRoutes) {
    console.log({ currentVestingRoute });
    const lastUserVestingRouteFound = lastVestingRoutes.find(
      (item) => item.account === currentVestingRoute.account,
    );
    if (
      lastUserVestingRouteFound?.routes.length !==
      currentVestingRoute.routes.length
    ) {
      const routesNotPresentInLast: VestingRoute[] = [];
      const routesCurrentlyRemoved: VestingRoute[] = [];
      currentVestingRoute.routes.map((current) => {
        if (
          !lastUserVestingRouteFound?.routes.find(
            (last) => last.id === current.id,
          )
        ) {
          routesNotPresentInLast.push(current);
        }
      });
      lastUserVestingRouteFound?.routes.map((lastRoute) => {
        if (
          !currentVestingRoute.routes.find(
            (current) => current.id === lastRoute.id,
          )
        ) {
          routesCurrentlyRemoved.push(lastRoute);
        }
      });
      differentVestingRoutesFound.push({
        account: currentVestingRoute.account,
        routes: routesNotPresentInLast,
        routesChanged: routesCurrentlyRemoved.length
          ? routesCurrentlyRemoved
          : undefined,
      });
    }
  }
  //end new way

  //OLD way bellow
  // for (const vestingRoute of lastVestingRoutes) {
  //   const { routes: lastRoutes } = vestingRoute;
  //   const account = vestingRoute.account;
  //   const foundInCurrent = currentVestingRoutes.find(
  //     (item) => item.account === account,
  //   );
  //   if (foundInCurrent) {
  //     const { routes: currentRoutes } = foundInCurrent;
  //     if (currentRoutes.length !== lastRoutes.length) {
  //       //difference found
  //       let symDifference = currentRoutes
  //         .filter((x) => !lastRoutes.includes(x))
  //         .concat(lastRoutes.filter((x) => !currentRoutes.includes(x)));
  //       console.log('Different lentghs!', { symDifference });
  //       differentVestingRoutesFound.push({ account, routes: symDifference });
  //     } else if (
  //       currentRoutes.length === lastRoutes.length &&
  //       currentRoutes.length > 0 &&
  //       lastRoutes.length > 0
  //     ) {
  //       console.log('Same lentghs!');
  //       //each field must be exactly equal
  //       let routesWithChangedFields: VestingRoute[] = [];
  //       let currentRoutesWithChanges: VestingRoute[] = [];
  //       lastRoutes.forEach((lastRoute) => {
  //         const { id, fromAccount, toAccount, percent, autoVest } = lastRoute;
  //         const currentRouteFound = currentRoutes.find(
  //           (item) => item.id === id,
  //         );
  //         if (currentRouteFound) {
  //           const {
  //             fromAccount: currentRoutefromAccount,
  //             toAccount: currentRouteToAccount,
  //             percent: currentRoutePercent,
  //             autoVest: currentRouteAutoVest,
  //           } = currentRouteFound;
  //           if (
  //             fromAccount !== currentRoutefromAccount ||
  //             toAccount !== currentRouteToAccount ||
  //             percent !== currentRoutePercent ||
  //             autoVest !== currentRouteAutoVest
  //           ) {
  //             //at least one field changed.
  //             currentRoutesWithChanges.push({
  //               id,
  //               fromAccount,
  //               toAccount,
  //               percent,
  //               autoVest,
  //             } as VestingRoute);
  //             routesWithChangedFields.push({
  //               id,
  //               fromAccount: currentRoutefromAccount,
  //               toAccount: currentRouteToAccount,
  //               percent: currentRoutePercent,
  //               autoVest: currentRouteAutoVest,
  //             });
  //           }
  //         }
  //       });
  //       if (routesWithChangedFields.length > 0) {
  //         differentVestingRoutesFound.push({
  //           account,
  //           routes: routesWithChangedFields,
  //           routesChanged: currentRoutesWithChanges,
  //         });
  //       }
  //     }
  //   }
  // }
  return differentVestingRoutesFound;
};

const saveLastVestingRoutes = async (vestingRoutes: UserVestingRoute[]) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
    vestingRoutes,
  );
};

const updateLastVestingRoutes = async (
  account: string,
  changedRoute: VestingRoute,
) => {};

export const VestingRoutesUtils = {
  getVestingRoutes,
  getAllAccountsVestingRoutes,
  getLastVestingRoutes,
  saveLastVestingRoutes,
  getDifferentVestingRoutesFound,
  clearLastVestingRoutesInStorage,
  updateLastVestingRoutes,
};

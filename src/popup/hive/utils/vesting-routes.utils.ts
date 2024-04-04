import {
  AccountVestingRoute,
  UserLastCurrentRoutes,
  UserVestingRoute,
  VestingRoute,
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
  console.log('Clear LAST_VESTING_ROUTES'); //TODO remove line
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.LAST_VESTING_ROUTES,
  );
};

const getWrongVestingRoutes = (
  lastVestingRoutes: UserVestingRoute[],
  currentVestingRoutes: UserVestingRoute[],
) => {
  //TODO recode this to return an object we can already use & edit as we need.
  const routes: AccountVestingRoute[] = [];
  let userRoutes: UserLastCurrentRoutes[] = [];
  if (!_.isEqual(lastVestingRoutes, currentVestingRoutes)) {
    console.log('NOT Equal!'); //TODO remove line
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

        console.log({ foundLastRoutes, i: currentVestingRoute.routes }); //TODO remove line
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
    //Bellow comparing current vs last //TODO last vs current
    // currentVestingRoutes.map(({ account, routes: currRoutes }) => {
    //   const foundUserVestingInLast = lastVestingRoutes.find(
    //     (item) => item.account === account,
    //   );
    //   const missingRoutes: VestingRoute[] = [];
    //   const nonExistentRoutes: NonExistenVestingRoute[] = [];
    //   const changedRoutes: VestingRoute[] = [];
    //   const lastChangedRoutes: VestingRoute[] = [];
    //   currRoutes.map((currRoute) => {
    //     if (foundUserVestingInLast) {
    //       let foundUserRouteInLast = foundUserVestingInLast.routes.find(
    //         (route) => route.id === currRoute.id,
    //       );
    //       if (foundUserRouteInLast) {
    //         //compare equality
    //         if (!_.isEqual(foundUserRouteInLast, currRoute)) {
    //           changedRoutes.push(currRoute);
    //           lastChangedRoutes.push(foundUserRouteInLast);
    //         }
    //       } else {
    //         nonExistentRoutes.push({
    //           id: currRoute.id,
    //           status: 'non existent',
    //         });
    //         missingRoutes.push(currRoute);
    //       }
    //     }
    //   });
    //   routes.push({
    //     account,
    //     lastRoutes: nonExistentRoutes.length
    //       ? nonExistentRoutes
    //       : lastChangedRoutes,
    //     newRoutes: missingRoutes.length ? missingRoutes : changedRoutes,
    //   });
    // });
  }
  //new way to test
  // for (const currentVestingRoute of currentVestingRoutes) {
  //   console.log({ currentVestingRoute });
  //   const lastUserVestingRouteFound = lastVestingRoutes.find(
  //     (item) => item.account === currentVestingRoute.account,
  //   );
  //   if (
  //     lastUserVestingRouteFound?.routes.length !==
  //     currentVestingRoute.routes.length
  //   ) {
  //     const routesNotPresentInLast: VestingRoute[] = [];
  //     const routesCurrentlyRemoved: VestingRoute[] = [];
  //     currentVestingRoute.routes.map((current) => {
  //       if (
  //         !lastUserVestingRouteFound?.routes.find(
  //           (last) => last.id === current.id,
  //         )
  //       ) {
  //         routesNotPresentInLast.push(current);
  //       }
  //     });
  //     lastUserVestingRouteFound?.routes.map((lastRoute) => {
  //       if (
  //         !currentVestingRoute.routes.find(
  //           (current) => current.id === lastRoute.id,
  //         )
  //       ) {
  //         routesCurrentlyRemoved.push(lastRoute);
  //       }
  //     });
  //     differentVestingRoutesFound.push({
  //       account: currentVestingRoute.account,
  //       routes: routesNotPresentInLast,
  //       routesChanged: routesCurrentlyRemoved.length
  //         ? routesCurrentlyRemoved
  //         : undefined,
  //     });
  //   }
  // }
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
  return userRoutes.length > 0 ? userRoutes : undefined;
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
  getWrongVestingRoutes,
  clearLastVestingRoutesInStorage,
  updateLastVestingRoutes,
};

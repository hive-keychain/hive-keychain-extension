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
  if (!lastVestingRoutes) {
    VestingRoutesUtils.saveLastVestingRoutes(currentVestingRoutes);
    return undefined;
  }
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

//TODO remove bellow and its use after review
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

const skipAccountRoutes = async (
  currentRoutes: VestingRoute[],
  account: string,
  isLast: boolean,
  nextCarouselSlide: () => void,
  currentlyRemovedRoutesIdList: number[],
  setCurrentlyRemovedRoutesIdList: (value: number[]) => void,
  setSuccessMessage: (message: string) => void,
  clearDisplayWrongVestingRoutes: () => void,
) => {
  let copyLast = [...(await VestingRoutesUtils.getLastVestingRoutes())!];
  const toUpdateIndex = copyLast.findIndex((c) => c.account === account);
  if (toUpdateIndex !== -1) {
    if (!copyLast[toUpdateIndex].routes.length) {
      copyLast[toUpdateIndex].routes = currentRoutes;
    } else {
      if (currentRoutes.length === 0 || currentlyRemovedRoutesIdList.length) {
        currentlyRemovedRoutesIdList.map((removedRoute) => {
          copyLast[toUpdateIndex].routes = copyLast[
            toUpdateIndex
          ].routes.filter((r) => r.id !== removedRoute);
        });
      } else {
        currentRoutes.map((c) => {
          const toUpdateIndexRouteInlast = copyLast[
            toUpdateIndex
          ].routes.findIndex((r) => r.id === c.id);
          if (toUpdateIndexRouteInlast !== -1) {
            copyLast[toUpdateIndex].routes[toUpdateIndexRouteInlast] = c;
          } else {
            copyLast[toUpdateIndex].routes.push(c);
          }
        });
      }
    }
  }
  await VestingRoutesUtils.saveLastVestingRoutes(copyLast);
  setCurrentlyRemovedRoutesIdList([]);
  if (!isLast) return nextCarouselSlide();
  setSuccessMessage('popup_html_vesting_routes_handled_successfully');
  clearDisplayWrongVestingRoutes();
};

const revertAccountRoutes = async (
  lastRoutes: VestingRoute[],
  currentRoutes: VestingRoute[],
  account: string,
  isLast: boolean,
  addToLoadingList: (message: string) => void,
  accounts: LocalAccount[],
  removeFromLoadingList: (message: string) => void,
  nextCarouselSlide: () => void,
  setSuccessMessage: (message: string) => void,
  clearDisplayWrongVestingRoutes: () => void,
) => {
  addToLoadingList('html_popup_revert_vesting_route_operation');
  const activeKey = accounts.find((a) => a.name === account)?.keys.active!;
  const broadcastOperation: {
    fromAccount: string;
    toAccount: string;
    percent: number;
    autoVest: boolean;
  }[] = [];
  if (lastRoutes.length === currentRoutes.length) {
    lastRoutes.map(({ fromAccount, toAccount, percent, autoVest }) => {
      broadcastOperation.push({
        fromAccount,
        toAccount,
        percent,
        autoVest,
      });
    });
  } else if (currentRoutes.length > lastRoutes.length) {
    currentRoutes.map((c) => {
      const foundInlast = lastRoutes.find(({ id }) => id === c.id);
      if (!foundInlast) {
        broadcastOperation.push({
          fromAccount: c.fromAccount,
          toAccount: c.toAccount,
          percent: 0,
          autoVest: c.autoVest,
        });
      }
    });
  } else if (currentRoutes.length < lastRoutes.length) {
    lastRoutes.map((l) => {
      const foundInCurr = currentRoutes.find((c) => c.id === l.id);
      if (!foundInCurr) {
        broadcastOperation.push({
          fromAccount: l.fromAccount,
          toAccount: l.toAccount,
          percent: l.percent,
          autoVest: l.autoVest,
        });
      }
    });
  }
  try {
    for (const t of broadcastOperation) {
      const result = await VestingRoutesUtils.sendVestingRoute(
        t.fromAccount,
        t.toAccount,
        t.percent,
        t.autoVest,
        activeKey,
      );
    }
    const currentRoutes = await VestingRoutesUtils.getAllAccountsVestingRoutes(
      accounts.map((a) => a.name),
      'outgoing',
    );
    await VestingRoutesUtils.saveLastVestingRoutes(currentRoutes);
    removeFromLoadingList('html_popup_revert_vesting_route_operation');
    if (!isLast) return nextCarouselSlide();
    setSuccessMessage('popup_html_vesting_routes_handled_successfully');
    clearDisplayWrongVestingRoutes();
  } catch (error) {
    Logger.error('Error while sending vesting route', true);
  }
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
  skipAccountRoutes,
  revertAccountRoutes,
};

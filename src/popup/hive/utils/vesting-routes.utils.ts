import { UserVestingRoute } from '@interfaces/vesting-routes.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getVestingRoutes = async (
  name: string,
  type: 'outgoing' | 'incoming' | 'all',
) => {
  const vestingRoutes = await HiveTxUtils.getData(
    'condenser_api.get_withdraw_routes',
    [name, type],
  );
  return vestingRoutes;
};

const getAllAccountsVestingRoutes = async (
  names: string[],
  type: 'outgoing' | 'incoming' | 'all',
) => {
  const allAccountsVestingRoutes: UserVestingRoute[] = [];

  for (const name of names) {
    allAccountsVestingRoutes.push({
      account: name,
      routes: await getVestingRoutes(name, type),
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

const getDifferentVestingRoutesFound = (
  lastVestingRoutes: UserVestingRoute[],
  currentVestingRoutes: UserVestingRoute[],
) => {
  //TODO bellow, the string comparisson must be made to each, so need to iterate one more deeper level on each array
  let differentVestingRoutesFound: UserVestingRoute[] = [];
  lastVestingRoutes.forEach((lastVestingRoute) => {
    const lastVestingRouteAsString = JSON.stringify(lastVestingRoute.routes);
    const currentVestingRoutesFound = currentVestingRoutes.find(
      (item) => item.account === lastVestingRoute.account,
    );
    if (
      currentVestingRoutesFound &&
      JSON.stringify(currentVestingRoutesFound.routes) !==
        lastVestingRouteAsString
    ) {
      differentVestingRoutesFound.push(currentVestingRoutesFound);
    }
  });
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

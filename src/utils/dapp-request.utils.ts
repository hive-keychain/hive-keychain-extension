import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const REQUEST_LIMIT_PER_DAPP = 3;
const REQUEST_TIME_LIMIT_PER_DAPP_IN_MINUTE = 1;
const REQUEST_LOCK_TIME_IN_MINUTE = 1;

interface GuardDappRequest {
  [domain: string]: {
    timestamp: number;
    requestCount: number;
    locked?: boolean;
  };
}

interface LockedDapps {
  [domain: string]: number; // timestamp
}

// Return true if domain has too many requests
// false if not
const checkIfHasTooManyRequest = async (domain: string) => {
  let guard: GuardDappRequest =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.GUARD_DAPP_REQUEST,
    );
  if (!guard) {
    guard = {};
  }
  if (!guard[domain]) {
    guard[domain] = { timestamp: Date.now(), requestCount: 1 };
  } else {
    if (
      Date.now() - guard[domain].timestamp >
      REQUEST_TIME_LIMIT_PER_DAPP_IN_MINUTE * 60 * 1000
    ) {
      //expired
      guard[domain] = {
        timestamp: Date.now(),
        requestCount: 0,
      };
    }

    guard[domain].requestCount = guard[domain].requestCount + 1;
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.GUARD_DAPP_REQUEST,
    guard,
  );

  return guard[domain].requestCount > REQUEST_LIMIT_PER_DAPP;
};

const lockDomain = async (domain: string) => {
  let lockedDapps = await getLockedDapps();
  if (!lockedDapps) lockedDapps = {};
  lockedDapps[domain] = Date.now();
  await saveLockedDapp(lockedDapps);
};

const unlockDomain = async (domain: string) => {
  let lockedDapps: LockedDapps = await getLockedDapps();
  delete lockedDapps[domain];
  await saveLockedDapp(lockedDapps);
};

const getLockedDapps = async () => {
  let lockedDapps: LockedDapps =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LOCKED_DAPPS,
    );
  if (!lockedDapps) lockedDapps = {} as LockedDapps;
  return lockedDapps;
};

const saveLockedDapp = async (lockedDapps: LockedDapps) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LOCKED_DAPPS,
    lockedDapps,
  );
};

const isDappLocked = async (domain: string) => {
  const now = Date.now();
  const dappsLocks = await getLockedDapps();
  if (
    dappsLocks[domain] &&
    now - dappsLocks[domain] < REQUEST_LIMIT_PER_DAPP * 60 * 1000
  ) {
    return true;
  } else {
    await unlockDomain(domain);
    return false;
  }
};

export const DappRequestUtils = {
  checkIfHasTooManyRequest,
  lockDomain,
  unlockDomain,
  isDappLocked,
};

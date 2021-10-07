import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getClaims = async (username: string) => {};

const saveClaims = async (
  claimRewards: boolean,
  claimAccount: boolean,
  username: string,
) => {
  let allRewards = await getAllClaimRewards();
  let allAccounts = await getAllClaimAccounts();

  allRewards = allRewards ?? {};
  allAccounts = allAccounts ?? {};

  LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.CLAIM_REWARDS, {
    ...allRewards,
    [username]: claimRewards,
  });
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    {
      ...allAccounts,
      [username]: claimAccount,
    },
  );
};

const getAllClaimAccounts = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
  );
};
const getAllClaimRewards = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CLAIM_REWARDS,
  );
};

const AutomatedTasksUtils = {
  getClaims,
  saveClaims,
};

export default AutomatedTasksUtils;

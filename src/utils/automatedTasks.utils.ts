import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getClaims = async (username: string) => {
  const values = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
    LocalStorageKeyEnum.CLAIM_SAVINGS,
  ]);

  const accountValue = values[LocalStorageKeyEnum.CLAIM_ACCOUNTS]
    ? values[LocalStorageKeyEnum.CLAIM_ACCOUNTS][username]
    : false;
  const rewardValue = values[LocalStorageKeyEnum.CLAIM_REWARDS]
    ? values[LocalStorageKeyEnum.CLAIM_REWARDS][username]
    : false;
  const savingsValue = values[LocalStorageKeyEnum.CLAIM_SAVINGS]
    ? values[LocalStorageKeyEnum.CLAIM_SAVINGS][username]
    : false;

  return {
    [LocalStorageKeyEnum.CLAIM_ACCOUNTS]: accountValue,
    [LocalStorageKeyEnum.CLAIM_REWARDS]: rewardValue,
    [LocalStorageKeyEnum.CLAIM_SAVINGS]: savingsValue,
  };
};

const saveClaims = async (
  claimRewards: boolean,
  claimAccount: boolean,
  claimSavings: boolean,
  username: string,
) => {
  let allRewards = await AutomatedTasksUtils.getAllClaimRewards();
  let allAccounts = await AutomatedTasksUtils.getAllClaimAccounts();
  let allSavings = await AutomatedTasksUtils.getAllClaimSavings();
  allRewards = allRewards ?? {};
  allAccounts = allAccounts ?? {};
  allSavings = allSavings ?? {};

  allRewards = {
    ...allRewards,
    [username]: claimRewards,
  };
  allAccounts = {
    ...allAccounts,
    [username]: claimAccount,
  };
  allSavings = {
    ...allSavings,
    [username]: claimSavings,
  };

  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CLAIM_REWARDS,
    allRewards,
  );
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    allAccounts,
  );
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CLAIM_SAVINGS,
    allSavings,
  );

  chrome.runtime.sendMessage({
    command: BackgroundCommand.UPDATE_CLAIMS,
    value: {
      claimRewards: allRewards,
      claimAccounts: allAccounts,
      claimSavings: allSavings,
    },
  });
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
const getAllClaimSavings = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CLAIM_SAVINGS,
  );
};

const initBackgroundClaims = async () => {
  let allRewards = await AutomatedTasksUtils.getAllClaimRewards();
  let allAccounts = await AutomatedTasksUtils.getAllClaimAccounts();
  let allSavings = await AutomatedTasksUtils.getAllClaimSavings();
  chrome.runtime.sendMessage({
    command: BackgroundCommand.UPDATE_CLAIMS,
    value: {
      claimRewards: allRewards,
      claimAccounts: allAccounts,
      claimSavings: allSavings,
    },
  });
};

const AutomatedTasksUtils = {
  getClaims,
  saveClaims,
  initBackgroundClaims,
  getAllClaimAccounts,
  getAllClaimRewards,
  getAllClaimSavings,
};

export default AutomatedTasksUtils;

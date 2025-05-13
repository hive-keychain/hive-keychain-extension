import { ActiveAccount } from '@interfaces/active-account.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import Config from 'src/config';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
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

const updateClaim = async (
  username: string,
  enabled: boolean,
  claimType: LocalStorageKeyEnum,
) => {
  let claims = await LocalStorageUtils.getValueFromLocalStorage(claimType);
  claims = {
    ...claims,
    [username]: enabled,
  };
  LocalStorageUtils.saveValueInLocalStorage(claimType, claims);
};

const canClaimSavingsErrorMessage = (activeAccount: ActiveAccount) => {
  if (!activeAccount.keys.active) {
    return 'popup_html_need_active_key_for_claim_savings';
  } else if (KeysUtils.isUsingLedger(activeAccount.keys.active)) {
    return 'popup_html_cant_automatically_claim_ledger';
  }
};

const canClaimRewardsErrorMessage = (activeAccount: ActiveAccount) => {
  if (!activeAccount.keys.posting) {
    return 'popup_html_need_posting_key_to_claim_rewards';
  } else if (KeysUtils.isUsingLedger(activeAccount.keys.posting)) {
    return 'popup_html_cant_automatically_claim_ledger';
  }
};

const canClaimAccountErrorMessage = (activeAccount: ActiveAccount) => {
  if (!activeAccount.keys.active) {
    return 'popup_html_need_active_key_for_claim_savings';
  } else if (KeysUtils.isUsingLedger(activeAccount.keys.active)) {
    return 'popup_html_cant_automatically_claim_ledger';
  } else if (activeAccount.rc.max_mana < Config.claims.freeAccount.MIN_RC) {
    return 'popup_html_not_enough_rc_to_claim_account';
  }
};

const getUsernameAutoStake = async (username: string) => {
  const autoStake = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE,
  );
  return autoStake && autoStake[username] ? true : false;
};

const saveUsernameAutoStake = async (username: string, value: boolean) => {
  const autoStake = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE,
  );
  let autoStakeUsers: any = autoStake ?? {};
  if (Object.keys(autoStakeUsers).length > 0) {
    autoStakeUsers[username] = value;
  } else {
    autoStakeUsers = {
      ...autoStakeUsers,
      [username]: value,
    };
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE,
    autoStakeUsers,
  );
};

const getUsernameAutoStakeList = async (username: string) => {
  const autoStakeList = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS,
  );
  return autoStakeList && autoStakeList[username]
    ? autoStakeList[username]
    : [];
};

const updateAutoStakeTokenList = async (
  username: string,
  list: OptionItem[],
) => {
  const reMappedList = list.map((c) => {
    return { symbol: c.value.symbol };
  });
  const currentList = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS,
  );
  let autoStakeList: any = currentList ?? {};
  if (Object.keys(autoStakeList).length > 0) {
    autoStakeList[username] = reMappedList;
  } else {
    autoStakeList = {
      ...autoStakeList,
      [username]: reMappedList,
    };
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS,
    autoStakeList,
  );
};

const AutomatedTasksUtils = {
  getClaims,
  saveClaims,
  initBackgroundClaims,
  getAllClaimAccounts,
  getAllClaimRewards,
  getAllClaimSavings,
  updateClaim,
  canClaimSavingsErrorMessage,
  canClaimAccountErrorMessage,
  canClaimRewardsErrorMessage,
  getUsernameAutoStake,
  saveUsernameAutoStake,
  updateAutoStakeTokenList,
  getUsernameAutoStakeList,
};

export default AutomatedTasksUtils;

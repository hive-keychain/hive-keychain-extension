import { KeysUtils } from '@hiveapp/utils/keys.utils';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
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
};

export default AutomatedTasksUtils;

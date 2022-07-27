import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import moment from 'moment';
import Config from 'src/config';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import ProposalUtils from 'src/utils/proposal.utils';

const addToIgnoreRenewal = async (usernames: string[]) => {
  const ignored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
  );
  for (const username of usernames) {
    ignored[username] = moment().utc();
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
    ignored,
  );
};

const renewUsersGovernance = async (
  usernames: string[],
  localAccounts: LocalAccount[],
) => {
  for (const username of usernames) {
    const localAccount = localAccounts.find(
      (localAccount) => localAccount.name === username,
    );
    try {
      await ProposalUtils.voteForProposal(
        {
          name: username,
          keys: { active: localAccount?.keys.active },
        } as ActiveAccount,
        0,
      );
      await ProposalUtils.unvoteProposal(
        {
          name: username,
          keys: { active: localAccount?.keys.active },
        } as ActiveAccount,
        0,
      );
    } catch (err) {
      Logger.error('Error while renewing proposal', err);
    }
  }
};

const getGovernanceRenewalIgnored = async () => {
  const list = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
  );
  return list ?? [];
};

const getGovernanceReminderList = async (usernames: string[]) => {
  let extendedAccounts = await AccountUtils.getExtendedAccounts(usernames);
  const ignoredAccounts = await GovernanceUtils.getGovernanceRenewalIgnored();
  extendedAccounts = extendedAccounts.filter((extendedAccounts) => {
    return (
      !ignoredAccounts[extendedAccounts.name] ||
      moment(moment().utc()).diff(
        ignoredAccounts[extendedAccounts.name],
        'year',
      ) >= 1
    );
  });

  const accountsToRemind = [];
  console.log(extendedAccounts);
  for (const extendedAccount of extendedAccounts) {
    const governanceExpirationDate = moment(
      (extendedAccount as any).governance_vote_expiration_ts,
    ).utcOffset('+0000', true);
    const diff = moment(governanceExpirationDate).diff(
      moment().utc(),
      'second',
    );
    if (diff <= Config.governanceReminderDelayInDays && diff > 0) {
      accountsToRemind.push(extendedAccount.name);
    }
  }
  return accountsToRemind;
};

export const GovernanceUtils = {
  addToIgnoreRenewal,
  renewUsersGovernance,
  getGovernanceRenewalIgnored,
  getGovernanceReminderList,
};

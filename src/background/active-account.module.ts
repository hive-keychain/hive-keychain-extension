import MkModule from '@background/mk.module';
import { ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';

const createActiveAccount = async (
  userAccount: ExtendedAccount,
  localAccounts: LocalAccount[],
) => {
  const localAccount = localAccounts.find(
    (localAccount) => localAccount.name === userAccount.name,
  );
  if (!localAccount) {
    return;
  }
  const activeAccount: ActiveAccount = {
    account: userAccount,
    keys: localAccount.keys,
    name: localAccount.name,
    rc: await AccountUtils.getRCMana(localAccount.name),
  };

  return activeAccount;
};

const createActiveAccountFromUsername = async (username: string) => {
  const localAccounts = await AccountUtils.getAccountsFromLocalStorage(
    await MkModule.getMk(),
  );
  const userAccount = await AccountUtils.getExtendedAccount(username);
  return createActiveAccount(userAccount, localAccounts);
};

export const ActiveAccountModule = {
  createActiveAccount,
  createActiveAccountFromUsername,
};

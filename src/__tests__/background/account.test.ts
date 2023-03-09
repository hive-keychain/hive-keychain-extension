import AccountModule from '@background/account';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accountBgMocks from 'src/__tests__/background/mocks/account-bg-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.afterAllCleanAndResetMocks();
describe('account tests:\n', () => {
  const { mocks, methods, spies } = accountBgMocks;
  methods.afterEach;
  methods.beforeEach;
  it('Must return undefined', async () => {
    await AccountModule.sendBackImportedAccounts('');
    expect(spies.getMk(mk.user.one)).not.toBeCalled();
  });
  it('Must call sendMessage with error', async () => {
    spies.getMk(mk.user.one);
    await AccountModule.sendBackImportedAccounts('Wrong_FileContent0000');
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: { feedback: { message: 'import_html_error' } },
    });
  });
  it('Must import and save accounts', async () => {
    chrome.management.getSelf = jest
      .fn()
      .mockResolvedValueOnce({ id: 'unique-ID' });
    spies.getMk(accounts.encrypted.noHash.oneAccount.mkUsed);
    mocks.getValueFromLocalStorage(null);
    await AccountModule.sendBackImportedAccounts(
      accounts.encrypted.noHash.oneAccount.msg,
    );
    expect(spies.saveValueInLocalStorage.mock.calls[0][0].toString()).toBe(
      LocalStorageKeyEnum.ACCOUNTS,
    );
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: {
        accounts: accounts.encrypted.noHash.oneAccount.original.list,
        feedback: null,
      },
    });
  });
});

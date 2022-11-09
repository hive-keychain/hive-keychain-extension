import AccountModule from '@background/account';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accountBgMocks from 'src/__tests__/background/mocks/account-bg-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
describe('account tests:\n', () => {
  const { mocks, methods, spies, constants } = accountBgMocks;
  const { params } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return undefined', async () => {
    await AccountModule.sendBackImportedAccounts('');
    expect(spies.getMk(mk.user.one)).not.toBeCalled();
  });
  it('Must call sendMessage with error', async () => {
    spies.getMk(mk.user.one);
    await AccountModule.sendBackImportedAccounts('Wrong_FileContent0000');
    expect(spies.sendMessage).toBeCalledWith(params('import_html_error'));
  });
  it('Must import and save accounts', async () => {
    spies.getMk(accounts.encrypted.noHash.oneAccount.mkUsed);
    mocks.getValueFromLocalStorage(null);
    await AccountModule.sendBackImportedAccounts(
      accounts.encrypted.noHash.oneAccount.msg,
    );
    expect(spies.saveValueInLocalStorage.mock.calls[0][0].toString()).toBe(
      LocalStorageKeyEnum.ACCOUNTS,
    );
    expect(spies.sendMessage).toBeCalledWith(
      params(accounts.encrypted.noHash.oneAccount.original.list),
    );
  });
});

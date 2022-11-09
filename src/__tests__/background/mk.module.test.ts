import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mkModuleMocks from 'src/__tests__/background/mocks/mk.module-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
describe('mk.module tests:\n', () => {
  const { spies, methods, mocks } = mkModuleMocks;
  methods.afterEach;
  it('Must get Mk', async () => {
    mocks.getValueFromLocalStorage({
      customMK: mk.user.one,
    });
    expect(await MkModule.getMk()).toBe(mk.user.one);
  });
  it('Must return true when valid login', async () => {
    mocks.getValueFromLocalStorage({
      customAccounts: accounts.encrypted.noHash.oneAccount.msg,
    });
    expect(
      await MkModule.login(accounts.encrypted.noHash.oneAccount.mkUsed),
    ).toBe(true);
  });
  it('Must return false when invalid login', async () => {
    mocks.getValueFromLocalStorage({
      customAccounts: accounts.encrypted.noHash.oneAccount.msg,
    });
    expect(await MkModule.login('not_the_one')).toBe(false);
  });
  it('Must call sendMessage', async () => {
    mocks.getValueFromLocalStorage({
      customMK: mk.user.one,
    });
    await MkModule.sendBackMk();
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.SEND_BACK_MK,
      value: mk.user.one,
    });
  });
  it('Must set new MK', () => {
    MkModule.saveMk(mk.user.two);
    expect(spies.set).toBeCalledWith({
      [LocalStorageKeyEnum.__MK]: mk.user.two,
    });
  });
  it('Must remove mk', () => {
    MkModule.lock();
    expect(spies.remove).toBeCalledWith(LocalStorageKeyEnum.__MK);
  });
});

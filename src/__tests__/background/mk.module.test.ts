import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('mk.module tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must get Mk', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customMK: mk.user.one,
        } as CustomDataFromLocalStorage),
      );
    expect(await MkModule.getMk()).toBe(mk.user.one);
  });

  it('Must return true when valid login', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customAccounts: accounts.encrypted.noHash.oneAccount.msg,
        } as CustomDataFromLocalStorage),
      );
    expect(
      await MkModule.login(accounts.encrypted.noHash.oneAccount.mkUsed),
    ).toBe(true);
  });

  it('Must return false when invalid login', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customAccounts: accounts.encrypted.noHash.oneAccount.msg,
        } as CustomDataFromLocalStorage),
      );
    expect(await MkModule.login('not_the_one')).toBe(false);
  });

  it('Must call sendMessage', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customMK: mk.user.one,
        } as CustomDataFromLocalStorage),
      );
    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    await MkModule.sendBackMk();
    expect(sSendMessage).toBeCalledWith({
      command: BackgroundCommand.SEND_BACK_MK,
      value: mk.user.one,
    });
  });

  it('Must set new MK', () => {
    const sSet = jest.spyOn(chrome.storage.local, 'set');
    MkModule.saveMk(mk.user.two);
    expect(sSet).toBeCalledWith({
      [LocalStorageKeyEnum.__MK]: mk.user.two,
    });
  });

  it('Must remove mk', () => {
    const sRemove = jest.spyOn(chrome.storage.local, 'remove');
    MkModule.lock();
    expect(sRemove).toBeCalledWith(LocalStorageKeyEnum.__MK);
  });
});

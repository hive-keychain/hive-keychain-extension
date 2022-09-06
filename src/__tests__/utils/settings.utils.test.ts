import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import SettingsUtils from 'src/utils/settings.utils';
describe('settings.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Must get values from local storage and call click', async () => {
    const spies = {
      getMultipleValueFromLocalStorage:
        (LocalStorageUtils.getMultipleValueFromLocalStorage = jest
          .fn()
          .mockResolvedValue(['multiple_values'])),
      createElement: jest.spyOn(document, 'createElement'),
      element: {
        click: jest.spyOn(HTMLElement.prototype, 'click'),
      },
    };
    const mocks = {
      createObjectURL: (window.URL.createObjectURL = jest
        .fn()
        .mockImplementation((...args) => {})),
    };
    mocks.createObjectURL;
    await SettingsUtils.exportSettings();
    expect(spies.getMultipleValueFromLocalStorage).toBeCalledWith([
      LocalStorageKeyEnum.AUTOLOCK,
      LocalStorageKeyEnum.CLAIM_ACCOUNTS,
      LocalStorageKeyEnum.CLAIM_REWARDS,
      LocalStorageKeyEnum.NO_CONFIRM,
      LocalStorageKeyEnum.FAVORITE_USERS,
      LocalStorageKeyEnum.RPC_LIST,
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      LocalStorageKeyEnum.CURRENT_RPC,
      LocalStorageKeyEnum.SWITCH_RPC_AUTO,
    ]);
    expect(spies.createElement).toBeCalledWith('a');
    expect(spies.element.click).toBeCalled();
  });
});

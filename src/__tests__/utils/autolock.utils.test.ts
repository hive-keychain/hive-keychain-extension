import AutolockUtils from 'src/utils/autolock.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('autolock.utils tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  test('when called with a message must set sendMessage to the chrome.runtime', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue('TRUE');
    chrome.runtime.sendMessage = jest.fn((msg) => msg);
    await AutolockUtils.initBackgroundAutolock();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: 'updateAutoLock',
      value: {
        '0': 'T',
        '1': 'R',
        '2': 'U',
        '3': 'E',
      },
    });
  });
  test('when called with null, set sendMessage must return {} object', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(null);
    chrome.runtime.sendMessage = jest.fn((msg) => msg);
    await AutolockUtils.initBackgroundAutolock();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: 'updateAutoLock',
      value: {},
    });
  });
  test('when called with empty string, set sendMessage must return {} object', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue('');
    chrome.runtime.sendMessage = jest.fn((msg) => msg);
    await AutolockUtils.initBackgroundAutolock();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: 'updateAutoLock',
      value: {},
    });
  });
  test('when called with undefined, set sendMessage must return {} object', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    chrome.runtime.sendMessage = jest.fn((msg) => msg);
    await AutolockUtils.initBackgroundAutolock();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: 'updateAutoLock',
      value: {},
    });
  });
});

import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

var mockWaitUntilDialogIsReady = jest.fn();
var mockGetValueFromLocalStorage = jest.fn();
var mockSaveValueInLocalStorage = jest.fn();

jest.mock('@background/utils/window.utils', () => {
  mockWaitUntilDialogIsReady = jest.fn();
  return {
    waitUntilDialogIsReady: (...args: any[]) =>
      mockWaitUntilDialogIsReady(...args),
  };
});

jest.mock('src/utils/localStorage.utils', () => {
  mockGetValueFromLocalStorage = jest.fn();
  mockSaveValueInLocalStorage = jest.fn();
  return {
    __esModule: true,
    default: {
      getValueFromLocalStorage: (...args: any[]) =>
        mockGetValueFromLocalStorage(...args),
      removeFromLocalStorage: jest.fn(),
      saveValueInLocalStorage: (...args: any[]) =>
        mockSaveValueInLocalStorage(...args),
    },
  };
});

jest.mock('@background/evm/evm-dialog-lifecycle', () => ({
  onRemoveEvm: jest.fn(),
}));

jest.mock('@background/hive/hive-dialog-lifecycle', () => ({
  onRemoveHive: jest.fn(),
}));

describe('multichain dialog lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(chrome.windows, 'getCurrent').mockImplementation((callback) => {
      callback({ id: 1, left: 0, top: 0, width: 1280 } as chrome.windows.Window);
    });
    jest.spyOn(chrome.windows, 'update').mockImplementation(
      (
        _windowId,
        _updateInfo,
        callback?: (window: chrome.windows.Window) => void,
      ) => {
        callback?.({ id: 123 } as chrome.windows.Window);
      },
    );
  });

  it('uses a short READY retry interval before sending dialog data', async () => {
    const { createOrUpdateDialog } = await import(
      '@background/multichain/dialog-lifecycle'
    );
    mockGetValueFromLocalStorage.mockResolvedValue(123);
    const callback = jest.fn();

    await createOrUpdateDialog(callback);

    expect(mockGetValueFromLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
    );
    expect(mockSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
      123,
    );
    expect(mockWaitUntilDialogIsReady).toHaveBeenCalledWith(
      25,
      DialogCommand.READY,
      callback,
    );
  });
});

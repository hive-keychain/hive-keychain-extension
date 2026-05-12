import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { getNextDialogRequestOrder } from '@background/multichain/dialog-coordinator';

var mockGetValueFromLocalStorage: jest.Mock;
var mockSaveValueInLocalStorage: jest.Mock;

jest.mock('src/utils/localStorage.utils', () => {
  mockGetValueFromLocalStorage = jest.fn();
  mockSaveValueInLocalStorage = jest.fn();
  return {
    __esModule: true,
    default: {
      getValueFromLocalStorage: (...args: any[]) =>
        mockGetValueFromLocalStorage(...args),
      saveValueInLocalStorage: (...args: any[]) =>
        mockSaveValueInLocalStorage(...args),
    },
  };
});

jest.mock('@background/multichain/dialog-lifecycle', () => ({
  createOrUpdateDialog: jest.fn(),
  getDialogWindowId: jest.fn(),
  removeWindow: jest.fn(),
}));

jest.mock('@background/multichain/dialog-request.utils', () => ({
  getCurrentDialogItem: jest.fn(),
  getRequestHandlers: jest.fn(),
  isEquivalentDialogDispatch: jest.fn(),
  isQueueGrowthOnlyDispatch: jest.fn(),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

describe('dialog coordinator', () => {
  let storage: Partial<Record<LocalStorageKeyEnum, any>>;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = {};
    mockGetValueFromLocalStorage.mockImplementation(async (key) => storage[key]);
    mockSaveValueInLocalStorage.mockImplementation(async (key, value) => {
      storage[key as LocalStorageKeyEnum] = value;
    });
  });

  it('serializes dialog request order increments', async () => {
    const orders = await Promise.all([
      getNextDialogRequestOrder(),
      getNextDialogRequestOrder(),
      getNextDialogRequestOrder(),
    ]);

    expect(orders).toEqual([1, 2, 3]);
    expect(storage[LocalStorageKeyEnum.DIALOG_REQUEST_ORDER]).toBe(3);
  });
});

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { initializeWallet } from '@background/hive/requests/logic/initializeWallet.logic';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/multichain/dialog-lifecycle';

describe('initializeWallet current dialog flow', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('shows internal dialog error without immediately removing the request', async () => {
    const createDialogSpy = jest
      .spyOn(DialogLifeCycle, 'createOrUpdateDialog')
      .mockImplementation(async (callback: () => void) => {
        await callback();
      });
    const requestHandler = new HiveRequestsHandler();
    const removeRequestSpy = jest
      .spyOn(requestHandler, 'removeRequestById')
      .mockResolvedValue(undefined);

    initializeWallet(requestHandler, 7, keychainRequest.noValues.decode);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createDialogSpy).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'sendDialogError',
        msg: expect.objectContaining({
          error: 'no_wallet',
          request_id: keychainRequest.noValues.decode.request_id,
        }),
        tab: 7,
      }),
    );
    expect(removeRequestSpy).not.toHaveBeenCalled();
  });
});

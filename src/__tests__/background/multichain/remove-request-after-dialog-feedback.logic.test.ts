import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import * as DialogRequestUtils from '@background/multichain/dialog-request.utils';

const delayMsMock = jest.fn();

jest.mock('@reference-data/dialog-feedback.constants', () => ({
  DIALOG_FEEDBACK_DISPLAY_MS: 5000,
  delayMs: (...args: unknown[]) => delayMsMock(...args),
}));

import { removeRequestAfterDialogFeedback } from '@background/multichain/remove-request-after-dialog-feedback.logic';

describe('removeRequestAfterDialogFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delayMsMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('removes the request immediately when the dialog stays open', async () => {
    const requestHandler = new HiveRequestsHandler();
    jest
      .spyOn(DialogRequestUtils, 'getRequestHandlers')
      .mockResolvedValue({} as DialogRequestUtils.RequestHandlers);
    jest
      .spyOn(DialogRequestUtils, 'willCloseDialogWindowAfterRemovingRequest')
      .mockResolvedValue(false);
    const removeRequestSpy = jest
      .spyOn(requestHandler, 'removeRequestById')
      .mockResolvedValue(undefined);

    await removeRequestAfterDialogFeedback(requestHandler, 42, 9);

    expect(delayMsMock).not.toHaveBeenCalled();
    expect(removeRequestSpy).toHaveBeenCalledTimes(1);
    expect(removeRequestSpy).toHaveBeenCalledWith(42, 9);
  });

  it('waits for dialog feedback before removing the last visible request', async () => {
    const requestHandler = new HiveRequestsHandler();
    jest
      .spyOn(DialogRequestUtils, 'getRequestHandlers')
      .mockResolvedValue({} as DialogRequestUtils.RequestHandlers);
    jest
      .spyOn(DialogRequestUtils, 'willCloseDialogWindowAfterRemovingRequest')
      .mockResolvedValue(true);
    const removeRequestSpy = jest
      .spyOn(requestHandler, 'removeRequestById')
      .mockResolvedValue(undefined);

    await removeRequestAfterDialogFeedback(requestHandler, 42, 9);

    expect(delayMsMock).toHaveBeenCalledWith(5000);
    expect(removeRequestSpy).toHaveBeenCalledTimes(1);
    expect(removeRequestSpy).toHaveBeenCalledWith(42, 9);
  });
});

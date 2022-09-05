import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
describe('errors tests:\n', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const spy = jest
    .spyOn(chrome.runtime, 'sendMessage')
    .mockReturnValue(undefined);
  it('Must call sendErrors', () => {
    sendErrors(
      new RequestsHandler(),
      0,
      'error_test',
      'message_error',
      'display_msg',
      postMocks.constants.data,
    );
    expect(spy).toBeCalledWith({
      command: DialogCommand.SEND_DIALOG_ERROR,
      msg: {
        success: false,
        error: 'error_test',
        result: null,
        data: postMocks.constants.data,
        message: 'message_error',
        display_msg: 'display_msg',
        request_id: undefined,
      },
      tab: 0,
    });
  });
});

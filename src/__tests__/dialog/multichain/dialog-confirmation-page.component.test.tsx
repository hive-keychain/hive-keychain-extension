import '@testing-library/jest-dom';
import { DialogConfirmationPage } from '@dialog/multichain/dialog-confirmation-page/dialog-confirmation-page.component';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

jest.mock(
  '@dialog/multichain/request/request-confirmation/request-confirmation',
  () => ({
    RequestConfirmation: ({ message, afterCancel }: any) => (
      <div data-testid={`request-${message.request.request_id}`}>
        request {message.request.request_id}
        <button
          type="button"
          onClick={() => afterCancel(message.request.request_id, message.tab)}>
          cancel request
        </button>
      </div>
    ),
  }),
);

jest.mock('@common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="svg-icon" />,
}));

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="svg-icon" />,
}));

const createMessage = (requestId: number, tab = 1): any => ({
  command: DialogCommand.SEND_DIALOG_CONFIRM,
  request: {
    request_id: requestId,
    type: 'transfer',
    username: 'alice',
  },
  rpc: {},
  tab,
  domain: 'example.com',
  hiveEngineConfig: {},
});

const createFeedbackMessage = (requestId: number, tab = 1): any => ({
  command: DialogCommand.ANSWER_REQUEST,
  msg: {
    message: 'Done',
    success: true,
    data: {
      request_id: requestId,
    },
    tab,
  },
});

describe('DialogConfirmationPage', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    jest.spyOn(window, 'close').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('closes the window without clearing final feedback for the last request', () => {
    const setFeedBackMessage = jest.fn();

    render(
      <DialogConfirmationPage
        message={createMessage(1)}
        feedBackMessage={createFeedbackMessage(1)}
        setFeedBackMessage={setFeedBackMessage}
      />,
    );

    fireEvent.click(screen.getByText('message_container_close_button'));

    expect(window.close).toHaveBeenCalled();
    expect(setFeedBackMessage).not.toHaveBeenCalled();
  });

  it('clears feedback when another queued request remains', async () => {
    const setFeedBackMessage = jest.fn();
    const firstMessage = createMessage(1);
    const secondMessage = createMessage(2);

    render(
      <DialogConfirmationPage
        message={{ ...firstMessage, queue: [firstMessage, secondMessage] }}
        feedBackMessage={createFeedbackMessage(1)}
        setFeedBackMessage={setFeedBackMessage}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('message_container_close_button'));

    expect(window.close).not.toHaveBeenCalled();
    expect(setFeedBackMessage).toHaveBeenCalledWith(null);
  });

  it('closes the window without removing the last request on cancel', () => {
    render(
      <DialogConfirmationPage
        message={createMessage(1)}
        feedBackMessage={null}
        setFeedBackMessage={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText('cancel request'));

    expect(window.close).toHaveBeenCalled();
    expect(screen.getByTestId('request-1')).toBeInTheDocument();
  });

  it('removes a canceled request when another queued request remains', async () => {
    const firstMessage = createMessage(1);
    const secondMessage = createMessage(2);

    render(
      <DialogConfirmationPage
        message={{ ...firstMessage, queue: [firstMessage, secondMessage] }}
        feedBackMessage={null}
        setFeedBackMessage={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('cancel request'));

    expect(window.close).not.toHaveBeenCalled();
    expect(screen.queryByTestId('request-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('request-2')).toBeInTheDocument();
  });
});

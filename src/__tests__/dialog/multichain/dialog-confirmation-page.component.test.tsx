import '@testing-library/jest-dom';
import { DialogConfirmationPage } from '@dialog/multichain/dialog-confirmation-page/dialog-confirmation-page.component';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
  SVGIcon: ({ className, onClick }: any) => (
    <button
      className={className}
      data-testid={className}
      type="button"
      onClick={onClick}
    />
  ),
}));

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ className, onClick }: any) => (
    <button
      className={className}
      data-testid={className}
      type="button"
      onClick={onClick}
    />
  ),
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

const cancelRequest = (requestId: number) => {
  fireEvent.click(
    within(screen.getByTestId(`request-${requestId}`)).getByText(
      'cancel request',
    ),
  );
};

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

    cancelRequest(1);

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

    cancelRequest(1);

    expect(window.close).not.toHaveBeenCalled();
    expect(screen.queryByTestId('request-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('request-2')).toBeInTheDocument();
  });

  it('mounts every queued request while only the selected slide is active', async () => {
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
      expect(screen.getByTestId('request-1')).toBeInTheDocument();
      expect(screen.getByTestId('request-2')).toBeInTheDocument();
    });

    const firstSlide = screen.getByTestId('dialog-request-slide-0');
    const secondSlide = screen.getByTestId('dialog-request-slide-1');

    expect(firstSlide).toHaveClass('active');
    expect(firstSlide).toHaveAttribute('aria-hidden', 'false');
    expect(firstSlide).not.toHaveAttribute('inert');
    expect(firstSlide).toHaveStyle('transform: translateX(0)');

    expect(secondSlide).toHaveClass('inactive');
    expect(secondSlide).toHaveAttribute('aria-hidden', 'true');
    expect(secondSlide).toHaveAttribute('inert');
    expect(secondSlide).toHaveStyle('transform: translateX(100%)');
  });

  it('switches slides without unmounting queued requests', async () => {
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

    fireEvent.click(screen.getByTestId('next-button'));

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByTestId('request-1')).toBeInTheDocument();
    expect(screen.getByTestId('request-2')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-request-slide-0')).toHaveClass(
      'inactive',
    );
    expect(screen.getByTestId('dialog-request-slide-0')).toHaveStyle(
      'transform: translateX(-100%)',
    );
    expect(screen.getByTestId('dialog-request-slide-1')).toHaveClass('active');
    expect(screen.getByTestId('dialog-request-slide-1')).toHaveStyle(
      'transform: translateX(0)',
    );
  });

  it('keeps the next remaining request active after canceling the selected request', async () => {
    const firstMessage = createMessage(1);
    const secondMessage = createMessage(2);
    const thirdMessage = createMessage(3);

    render(
      <DialogConfirmationPage
        message={{
          ...firstMessage,
          queue: [firstMessage, secondMessage, thirdMessage],
        }}
        feedBackMessage={null}
        setFeedBackMessage={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('next-button'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    cancelRequest(2);

    expect(window.close).not.toHaveBeenCalled();
    expect(screen.queryByTestId('request-2')).not.toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByTestId('request-3')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-request-slide-1')).toHaveClass('active');
  });
});

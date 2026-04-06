import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { COPY_TOAST_AUTO_CLOSE_MS } from 'src/common-ui/toast/copy-toast.component';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';
import { setSuccessMessage } from 'src/popup/multichain/actions/message.actions';

const flushToastTimers = () => {
  if ((setTimeout as any)._isMockFunction) {
    jest.runOnlyPendingTimers();
  }
};

const CopyTrigger = () => (
  <button
    onClick={() => {
      void copyTextWithToast('copied-value');
    }}>
    copy
  </button>
);

const SuccessOverlayTrigger = () => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => {
        dispatch(setSuccessMessage('popup_html_save_successful'));
      }}>
      show success
    </button>
  );
};

describe('copy toast shared behavior', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn(mocksImplementation.i18nGetMessageCustom);
  });

  afterEach(() => {
    toast.dismiss();
    flushToastTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    cleanup();
  });

  it('reuses a single toast and resets the auto-close timeout on repeated copies', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });

    customRender(<CopyTrigger />);

    const toastMessage = chrome.i18n.getMessage('swap_copied_to_clipboard');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'copy' }));
    });
    expect(await screen.findByText(toastMessage)).toBeInTheDocument();
    expect(screen.getByTestId('copy-toast-content')).toHaveClass(
      'copy-toast-content--success',
    );
    expect(screen.getByTestId('copy-toast-success-icon')).toBeInTheDocument();
    expect(screen.getByText(toastMessage).closest('.copy-toast--success')).not.toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(COPY_TOAST_AUTO_CLOSE_MS - 500);
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'copy' }));
    });
    expect(screen.getAllByText(toastMessage)).toHaveLength(1);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(toastMessage)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(COPY_TOAST_AUTO_CLOSE_MS + 1000);
    });

    await waitFor(() => {
      expect(screen.queryByText(toastMessage)).not.toBeInTheDocument();
    });
  });

  it('keeps the existing overlay for non-copy success messages', async () => {
    const user = userEvent.setup();

    customRender(<SuccessOverlayTrigger />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'show success' }));
    });

    expect(
      await screen.findByText(chrome.i18n.getMessage('popup_html_save_successful')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(chrome.i18n.getMessage('message_container_close_button')),
    ).toBeInTheDocument();
  });
});

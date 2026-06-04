import '@testing-library/jest-dom';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { toast } from 'react-toastify';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CopyToastContainer, COPY_TOAST_AUTO_CLOSE_MS } from 'src/common-ui/toast/copy-toast.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';

import { I18nUtils } from 'src/utils/i18n.utils';
const flushToastTimers = () => {
  if ((setTimeout as any)._isMockFunction) {
    jest.runOnlyPendingTimers();
  }
};

describe('collapsible-item copy toast', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn(mocksImplementation.i18nGetMessageCustom);
  });

  afterEach(() => {
    toast.dismiss();
    flushToastTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    cleanup();
  });

  it('shows and auto-dismisses a toast when copying dialog content', async () => {
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

    const { container } = render(
      <div className="theme light dialog">
        <CollaspsibleItem title="dialog_body" content="dialog-content" />
        <CopyToastContainer />
      </div>,
    );

    await act(async () => {
      await user.click(screen.getByText(I18nUtils.getMessage('dialog_body')));
    });

    const copyIcon = container.querySelector('.field.collapsible .svg-icon.clickable');
    expect(copyIcon).not.toBeNull();

    await act(async () => {
      await user.click(copyIcon!);
    });

    const toastMessage = I18nUtils.getMessage('swap_copied_to_clipboard');
    expect(await screen.findByText(toastMessage)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(COPY_TOAST_AUTO_CLOSE_MS + 1000);
    });

    await waitFor(() => {
      expect(screen.queryByText(toastMessage)).not.toBeInTheDocument();
    });
  });
});

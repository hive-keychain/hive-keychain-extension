import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import App from '@dialog/App';
import { Theme } from '@popup/theme.context';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('App no_wallet dialog error close behavior', () => {
  beforeEach(() => {
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({
        ACTIVE_THEME: Theme.LIGHT,
      } as any);
    chrome.i18n.getMessage = jest.fn((key: string) => {
      if (key === 'message_container_close_button') return 'Close';
      if (key === 'message_container_title_fail') return 'Fail';
      if (key === 'bgd_lifecycle_request_canceled')
        return 'Request canceled';
      return key;
    });
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('sends REJECT_TRANSACTION when closing a no_wallet popup error', async () => {
    const closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {});
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await act(async () => {
      render(<App />);
    });

    const listener = addListenerSpy.mock.calls[0][0];

    await act(async () => {
      await listener(
        {
          command: DialogCommand.SEND_DIALOG_ERROR,
          msg: {
            error: 'no_wallet',
            display_msg: 'Need to setup your account first',
            data: { request_id: 123, type: 'decode' },
            request_id: 123,
          },
          tab: 9,
        },
        {},
        jest.fn(),
      );
    });

    await act(async () => {
      fireEvent.click(await screen.findByText('Close'));
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.REJECT_TRANSACTION,
      value: {
        success: false,
        error: 'user_cancel',
        result: null,
        data: { request_id: 123, type: 'decode' },
        message: 'Request canceled',
        request_id: 123,
        tab: 9,
      },
    });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('keeps existing close behavior for non-no_wallet errors', async () => {
    const closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {});
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await act(async () => {
      render(<App />);
    });

    const listener = addListenerSpy.mock.calls[0][0];

    await act(async () => {
      await listener(
        {
          command: DialogCommand.SEND_DIALOG_ERROR,
          msg: {
            error: 'user_cancel',
            display_msg: 'Generic error',
            data: { request_id: 456, type: 'decode' },
            request_id: 456,
          },
          tab: 9,
        },
        {},
        jest.fn(),
      );
    });

    await act(async () => {
      fireEvent.click(await screen.findByText('Close'));
    });

    expect(chrome.runtime.sendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({
        command: BackgroundCommand.REJECT_TRANSACTION,
      }),
    );
    expect(closeSpy).toHaveBeenCalled();
  });
});

import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { CommunicationUtils } from 'src/utils/communication.utils';

jest.mock('src/common-ui/loading/loading.component', () => ({
  LoadingComponent: ({ hide, caption }: any) =>
    hide ? null : <div data-testid="loading-caption">{caption}</div>,
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

describe('EvmOperation', () => {
  let addListenerSpy: jest.SpiedFunction<typeof chrome.runtime.onMessage.addListener>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((key: string) => key);
    addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
  });

  afterEach(() => {
    addListenerSpy.mockRestore();
  });

  it('shows the Ledger confirmation caption after confirming', () => {
    render(
      <EvmOperation
        title="dialog_confirm"
        request={{ request_id: 1 } as any}
        domain="app.example"
        origin="https://app.example"
        tab={1}
        afterCancel={jest.fn()}
        loadingCaption="popup_html_validate_transaction_on_ledger"
      />,
    );

    fireEvent.click(screen.getByText('dialog_confirm'));

    expect(screen.getByTestId('loading-caption')).toHaveTextContent(
      'popup_html_validate_transaction_on_ledger',
    );
    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalled();
  });

  it('clears the Ledger confirmation caption when the dialog receives SEND_DIALOG_ERROR', async () => {
    render(
      <EvmOperation
        title="dialog_confirm"
        request={{ request_id: 1 } as any}
        domain="app.example"
        origin="https://app.example"
        tab={1}
        afterCancel={jest.fn()}
        loadingCaption="popup_html_validate_transaction_on_ledger"
      />,
    );

    fireEvent.click(screen.getByText('dialog_confirm'));
    expect(screen.getByTestId('loading-caption')).toBeInTheDocument();

    await act(async () => {
      for (const [listener] of addListenerSpy.mock.calls) {
        listener({
          command: DialogCommand.SEND_DIALOG_ERROR,
          msg: { request_id: 1 },
        });
      }
    });

    expect(screen.queryByTestId('loading-caption')).toBeNull();
  });
});

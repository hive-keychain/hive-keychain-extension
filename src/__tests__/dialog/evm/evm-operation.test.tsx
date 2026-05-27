import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((key: string) => key);
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
});

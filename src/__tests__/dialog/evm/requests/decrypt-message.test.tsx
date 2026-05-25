import '@testing-library/jest-dom';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { DecryptMessage } from '@dialog/evm/requests/decrypt-message/decrypt-message';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const mockTransactionHook = {
  setLoading: jest.fn(),
  setReady: jest.fn(),
  buildInitialDomainField: jest.fn(() => ({
    name: 'dialog_evm_domain',
    value: 'example.app',
    warnings: [],
  })),
  setFields: jest.fn(),
  setUnableToReachBackend: jest.fn(),
  getWalletAddressInput: jest.fn(async () => ({
    name: 'dialog_account',
    value: '0x0000000000000000000000000000000000000001',
    warnings: [],
  })),
  hydrateDomainFieldWarnings: jest.fn(),
  setErrorMessage: jest.fn(),
};

jest.mock('src/dialog/evm/evm-operation/evm-operation', () => ({
  EvmOperation: ({ bottomPanel }: any) => (
    <div data-testid="evm-operation">{bottomPanel}</div>
  ),
}));

jest.mock(
  'src/dialog/evm/requests/transaction-warnings/transaction-warning.component',
  () => ({
    EvmTransactionWarningsComponent: () => <div />,
  }),
);

jest.mock(
  'src/dialog/evm/requests/transaction-warnings/transaction.hook',
  () => ({
    useTransactionHook: () => mockTransactionHook,
  }),
);

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="show-icon" />,
}));

const request = {
  request_id: 1,
  method: EvmRequestMethod.ETH_DECRYPT,
  params: [
    '0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035227d',
    '0x0000000000000000000000000000000000000001',
  ],
} as any;

const data = {
  tab: 12,
  dappInfo: {
    origin: 'https://example.app',
    domain: 'example.app',
    protocol: 'https:',
    logo: '',
  },
} as any;

const accounts = [
  {
    address: '0x0000000000000000000000000000000000000001',
  },
] as any;

describe('DecryptMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.chrome.i18n.getMessage = jest.fn(
      (key: string, params?: string[]) =>
        params?.length ? `${key}:${params.join(',')}` : key,
    );
    jest.spyOn(EvmChainUtils, 'getLastEvmChain').mockResolvedValue({
      chainId: '0x1',
    } as any);
    jest
      .spyOn(EvmTransactionParserUtils, 'verifyTransactionInformation')
      .mockResolvedValue({} as any);
  });

  it('reveals the encrypted message without decrypting it', async () => {
    render(
      <DecryptMessage
        request={request}
        accounts={accounts}
        data={data}
        afterCancel={jest.fn()}
      />,
    );

    const messageContainer = screen
      .getByText(request.params[0])
      .closest('.encrypted-message-container');
    expect(messageContainer).toHaveClass('hidden');

    fireEvent.click(screen.getByText('dialog_evm_decrypt_show_message'));

    await waitFor(() => {
      expect(messageContainer).toHaveClass('display');
    });
    expect(
      screen.queryByText('dialog_evm_decrypt_show_message'),
    ).not.toBeInTheDocument();
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });
});

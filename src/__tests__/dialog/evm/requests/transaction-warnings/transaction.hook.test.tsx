import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmWarningUtils } from 'src/utils/evm/evm-warning.utils';

jest.mock('src/utils/evm/evm-warning.utils', () => ({
  EvmWarningUtils: {
    checkRequestHash: jest.fn(),
  },
}));

describe('useTransactionHook warning resolution', () => {
  it('confirms whitelist warnings with their default label when resolving all', async () => {
    const onConfirm = jest.fn();
    const address = '0x00000000000000000000000000000000000000aa';
    const fields: TransactionConfirmationFields = {
      otherFields: [
        {
          name: 'evm_operation_to',
          type: 'wallet-address',
          value: address,
          warnings: [
            {
              ignored: false,
              level: EvmTransactionWarningLevel.LOW,
              message: 'evm_transaction_receiver_not_whitelisted',
              type: EvmTransactionWarningType.WHITELIST_ADDRESS,
              extraData: {
                resolveAllLabel: address,
              },
              onConfirm,
            },
          ],
        },
      ],
    };

    const Harness = () => {
      const transactionHook = useTransactionHook(
        {
          dappInfo: {
            domain: 'app.example',
            origin: 'app.example',
            protocol: 'https:',
            logo: '',
          },
          tab: {},
        } as any,
        { method: 'eth_sendTransaction', params: [] } as any,
      );

      useEffect(() => {
        transactionHook.setFields(fields);
      }, []);

      return transactionHook.fields ? (
        <button onClick={transactionHook.ignoreAllWarnings}>Resolve all</button>
      ) : null;
    };

    (EvmWarningUtils.checkRequestHash as jest.Mock).mockResolvedValue(
      undefined,
    );

    render(<Harness />);

    fireEvent.click(await screen.findByText('Resolve all'));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(address));
  });

  it('does not prefill single resolution input with resolve-all-only labels', async () => {
    const address = '0x00000000000000000000000000000000000000aa';
    const warning = {
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      message: 'evm_transaction_receiver_not_whitelisted',
      type: EvmTransactionWarningType.WHITELIST_ADDRESS,
      extraData: {
        resolveAllLabel: address,
      },
      onConfirm: jest.fn(),
    };

    const Harness = () => {
      const transactionHook = useTransactionHook(
        {
          dappInfo: {
            domain: 'app.example',
            origin: 'app.example',
            protocol: 'https:',
            logo: '',
          },
          tab: {},
        } as any,
        { method: 'eth_sendTransaction', params: [] } as any,
      );

      return (
        <>
          <button
            onClick={() =>
              transactionHook.openSingleWarningPopup(0, 0, warning)
            }>
            Open warning
          </button>
          <span data-testid="whitelist-label">
            {transactionHook.whitelistLabel}
          </span>
        </>
      );
    };

    (EvmWarningUtils.checkRequestHash as jest.Mock).mockResolvedValue(
      undefined,
    );

    render(<Harness />);

    fireEvent.click(screen.getByText('Open warning'));

    expect(screen.getByTestId('whitelist-label').textContent).toBe('');
  });
});

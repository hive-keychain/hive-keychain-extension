import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React, { useEffect } from 'react';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
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

  it('does not prefill field popup input with resolve-all-only labels', async () => {
    const address = '0x00000000000000000000000000000000000000aa';

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
        transactionHook.setFields({
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
                  extraData: { resolveAllLabel: address },
                  onConfirm: jest.fn(),
                },
              ],
            },
          ],
        });
      }, []);

      return (
        <>
          <button
            onClick={() =>
              transactionHook.openWarningsPopup({
                type: 'dialog-other',
                index: 0,
              })
            }>
            Open warning
          </button>
          <span data-testid="whitelist-label">
            {transactionHook.whitelistLabels[
              EvmRiskWarningUtils.getWhitelistLabelKey('evm_operation_to', 0)
            ] ?? ''}
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

  it('scopes the warnings popup to one dialog field', async () => {
    const fields: TransactionConfirmationFields = {
      otherFields: [
        {
          name: 'evm_operation_to',
          type: 'wallet-address',
          value: '0x1',
          warnings: [
            {
              ignored: false,
              level: EvmTransactionWarningLevel.MEDIUM,
              message: 'evm_test_warning_a',
              type: EvmTransactionWarningType.BASE,
            },
          ],
        },
        {
          name: 'evm_operation_from',
          type: 'wallet-address',
          value: '0x2',
          warnings: [
            {
              ignored: false,
              level: EvmTransactionWarningLevel.LOW,
              message: 'evm_test_warning_b',
              type: EvmTransactionWarningType.BASE,
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

      return (
        <>
          <button
            onClick={() =>
              transactionHook.openWarningsPopup({
                type: 'dialog-other',
                index: 1,
              })
            }>
            Open field popup
          </button>
          <span data-testid="popup-field-count">
            {transactionHook.getFieldsForWarningsPopup().length}
          </span>
          <span data-testid="popup-field-name">
            {transactionHook.getFieldsForWarningsPopup()[0]?.name ?? ''}
          </span>
        </>
      );
    };

    (EvmWarningUtils.checkRequestHash as jest.Mock).mockResolvedValue(
      undefined,
    );

    render(<Harness />);

    fireEvent.click(await screen.findByText('Open field popup'));

    expect(screen.getByTestId('popup-field-count').textContent).toBe('1');
    expect(screen.getByTestId('popup-field-name').textContent).toBe(
      'evm_operation_from',
    );
  });

  it('prefills whitelist popup input from ENS when defaultLabel is absent', async () => {
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
        transactionHook.setFields({
          otherFields: [
            {
              name: 'evm_operation_to',
              type: 'wallet-address',
              value: '0xabc',
              warnings: [
                {
                  ignored: false,
                  level: EvmTransactionWarningLevel.LOW,
                  message: 'evm_transaction_receiver_not_whitelisted',
                  type: EvmTransactionWarningType.WHITELIST_ADDRESS,
                  extraData: { ensName: 'alice.eth' },
                  onConfirm: jest.fn(),
                },
              ],
            },
          ],
        });
      }, []);

      return (
        <>
          <button
            onClick={() =>
              transactionHook.openWarningsPopup({
                type: 'dialog-other',
                index: 0,
              })
            }>
            Open ENS field
          </button>
          <span data-testid="whitelist-popup-label">
            {transactionHook.whitelistLabels[
              EvmRiskWarningUtils.getWhitelistLabelKey('evm_operation_to', 0)
            ] ?? ''}
          </span>
        </>
      );
    };

    (EvmWarningUtils.checkRequestHash as jest.Mock).mockResolvedValue(
      undefined,
    );

    render(<Harness />);
    fireEvent.click(await screen.findByText('Open ENS field'));

    expect(screen.getByTestId('whitelist-popup-label').textContent).toBe(
      'alice.eth',
    );
  });

  it('prefills whitelist popup input from defaultLabel', async () => {
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
        transactionHook.setFields({
          otherFields: [
            {
              name: 'evm_operation_contract',
              type: 'wallet-address',
              value: '0xabc',
              warnings: [
                {
                  ignored: false,
                  level: EvmTransactionWarningLevel.LOW,
                  message: 'evm_transaction_contract_not_used',
                  type: EvmTransactionWarningType.WHITELIST_ADDRESS,
                  extraData: { defaultLabel: 'My Token' },
                  onConfirm: jest.fn(),
                },
              ],
            },
          ],
        });
      }, []);

      return (
        <>
          <button
            onClick={() =>
              transactionHook.openWarningsPopup({
                type: 'dialog-other',
                index: 0,
              })
            }>
            Open whitelist field
          </button>
          <span data-testid="whitelist-popup-label">
            {transactionHook.whitelistLabels[
              EvmRiskWarningUtils.getWhitelistLabelKey(
                'evm_operation_contract',
                0,
              )
            ] ?? ''}
          </span>
        </>
      );
    };

    (EvmWarningUtils.checkRequestHash as jest.Mock).mockResolvedValue(
      undefined,
    );

    render(<Harness />);
    fireEvent.click(await screen.findByText('Open whitelist field'));

    expect(screen.getByTestId('whitelist-popup-label').textContent).toBe(
      'My Token',
    );
  });
});

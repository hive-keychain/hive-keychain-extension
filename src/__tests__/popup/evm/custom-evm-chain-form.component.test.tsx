import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';

describe('CustomEvmChainForm', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(EvmRpcUtils, 'isValidRpcForChainId').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prefills a dapp-requested chain id as disabled and validates required RPC data before submit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <CustomEvmChainForm
        onCancel={jest.fn()}
        onSubmit={onSubmit}
        initialChain={{ chainId: '0x539' }}
      />,
    );

    expect(
      (screen.getByTestId('custom-evm-chain-id') as HTMLInputElement).value,
    ).toBe('0x539');
    expect(
      (screen.getByTestId('custom-evm-chain-id') as HTMLInputElement).disabled,
    ).toBe(true);

    fireEvent.change(screen.getByTestId('custom-evm-chain-name'), {
      target: { value: 'Local Chain' },
    });
    fireEvent.change(screen.getByTestId('custom-evm-chain-symbol'), {
      target: { value: 'ETH' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText('evm_custom_chains_error_rpc')).not.toBeNull();

    fireEvent.change(screen.getByTestId('custom-evm-chain-rpc-0'), {
      target: { value: 'https://rpc.local' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: '0x539',
        name: 'Local Chain',
        mainToken: 'ETH',
        rpcs: [{ url: 'https://rpc.local', isDefault: true }],
      }),
    );
  });

  it('keeps the chain id field editable when adding a chain manually', () => {
    render(
      <CustomEvmChainForm onCancel={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(
      (screen.getByTestId('custom-evm-chain-id') as HTMLInputElement).disabled,
    ).toBe(false);
  });

  it('disables the chain id field when editing an existing chain', () => {
    render(
      <CustomEvmChainForm
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        chainToEdit={{
          type: ChainType.EVM,
          chainId: '0x539',
          name: 'Local Chain',
          mainToken: 'ETH',
          defaultTransactionType: EvmTransactionType.EIP_1559,
          rpcs: [{ url: 'https://rpc.local', isDefault: true }],
          testnet: false,
          isCustom: true,
        }}
      />,
    );

    expect(
      (screen.getByTestId('custom-evm-chain-id') as HTMLInputElement).disabled,
    ).toBe(true);
  });
});

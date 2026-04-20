import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';

describe('CustomEvmChainForm', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('prefills the requested chain id and validates required RPC data before submit', async () => {
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
});

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';
import { ChainListOrgUtils } from '@popup/evm/utils/chain-list-org.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';

import { I18nUtils } from 'src/utils/i18n.utils';

const prefilledChain: EvmChain = {
  type: ChainType.EVM,
  chainId: '0x539',
  name: 'Gnosis Chain',
  mainToken: 'XDAI',
  logo: 'https://logo.example/gnosis.jpg',
  defaultTransactionType: EvmTransactionType.EIP_1559,
  rpcs: [
    { url: 'https://rpc.gnosis', isDefault: true },
    { url: 'https://rpc.gnosis-backup', isDefault: false },
  ],
  blockExplorer: { url: 'https://explorer.gnosis' },
  testnet: false,
  isCustom: true,
  active: true,
};

describe('CustomEvmChainForm', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(EvmRpcUtils, 'isValidRpcForChainId').mockResolvedValue(true);
    jest
      .spyOn(ChainUtils, 'getChainFromDefaultChains')
      .mockResolvedValue(undefined);
    jest.spyOn(ChainListOrgUtils, 'findByChainId').mockResolvedValue(undefined);
    jest
      .spyOn(EvmRpcUtils, 'filterValidRpcsForChainId')
      .mockImplementation(async (rpcUrls) => rpcUrls);
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

  it('submits a supported chain override without custom-chain flags', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <CustomEvmChainForm
        onCancel={jest.fn()}
        onSubmit={onSubmit}
        isDefaultChain
        chainToEdit={{
          type: ChainType.EVM,
          chainId: '0x1',
          name: 'Ethereum',
          mainToken: 'ETH',
          defaultTransactionType: EvmTransactionType.EIP_1559,
          rpcs: [{ url: 'https://rpc.ethereum.org', isDefault: true }],
          testnet: false,
          isCustom: false,
        }}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));
    });

    const submittedChain = onSubmit.mock.calls[0][0];
    expect(submittedChain).toEqual(
      expect.objectContaining({
        chainId: '0x1',
        isCustom: false,
      }),
    );
    expect(submittedChain.disableTokensAndHistoryAutoLoading).toBeUndefined();
    expect(submittedChain.addTokensManually).toBeUndefined();
    expect(submittedChain.manualDiscoverAvailable).toBeUndefined();
    expect(screen.queryByTestId('custom-evm-chain-testnet')).toBeNull();
    expect(
      screen.queryByText('evm_custom_chains_field_default_tx_type'),
    ).toBeNull();
  });

  it('prefills the form on chain id blur when adding manually', async () => {
    jest
      .spyOn(ChainUtils, 'getChainFromDefaultChains')
      .mockResolvedValue(prefilledChain);

    render(<CustomEvmChainForm onCancel={jest.fn()} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByTestId('custom-evm-chain-id'), {
      target: { value: '1337' },
    });

    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });

    await waitFor(() => {
      expect(ChainUtils.getChainFromDefaultChains).toHaveBeenCalledWith('0x539');
    });

    expect(
      (screen.getByTestId('custom-evm-chain-name') as HTMLInputElement).value,
    ).toBe('Gnosis Chain');
    expect(
      (screen.getByTestId('custom-evm-chain-symbol') as HTMLInputElement).value,
    ).toBe('XDAI');
    fireEvent.click(screen.getByTestId('custom-evm-chain-rpc-toggle'));
    expect(
      (screen.getByTestId('custom-evm-chain-rpc-0') as HTMLInputElement).value,
    ).toBe('https://rpc.gnosis');
    expect(
      (screen.getByTestId('custom-evm-chain-explorer') as HTMLInputElement)
        .value,
    ).toBe('https://explorer.gnosis');
  });

  it('does not resolve again on blur when the chain id was already prefilled', async () => {
    jest
      .spyOn(ChainUtils, 'getChainFromDefaultChains')
      .mockResolvedValue(prefilledChain);

    render(<CustomEvmChainForm onCancel={jest.fn()} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByTestId('custom-evm-chain-id'), {
      target: { value: '0x539' },
    });

    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });

    await waitFor(() => {
      expect(ChainUtils.getChainFromDefaultChains).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByTestId('custom-evm-chain-name'), {
      target: { value: 'Custom Name' },
    });

    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });

    expect(ChainUtils.getChainFromDefaultChains).toHaveBeenCalledTimes(1);
    expect(
      (screen.getByTestId('custom-evm-chain-name') as HTMLInputElement).value,
    ).toBe('Custom Name');
  });

  it('refills the form when chain id changes and blurs again', async () => {
    const secondChain: EvmChain = {
      ...prefilledChain,
      chainId: '0xa',
      name: 'Optimism',
      mainToken: 'ETH',
      rpcs: [{ url: 'https://rpc.optimism', isDefault: true }],
    };
    jest
      .spyOn(ChainUtils, 'getChainFromDefaultChains')
      .mockImplementation(async (chainId) => {
        if (chainId === '0x539') {
          return prefilledChain;
        }
        if (chainId === '0xa') {
          return secondChain;
        }
        return undefined;
      });

    render(<CustomEvmChainForm onCancel={jest.fn()} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByTestId('custom-evm-chain-id'), {
      target: { value: '0x539' },
    });
    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });
    await waitFor(() => {
      expect(ChainUtils.getChainFromDefaultChains).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByTestId('custom-evm-chain-id'), {
      target: { value: '10' },
    });
    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });

    await waitFor(() => {
      expect(ChainUtils.getChainFromDefaultChains).toHaveBeenCalledTimes(2);
    });
    expect(ChainUtils.getChainFromDefaultChains).toHaveBeenLastCalledWith('0xa');
    expect(
      (screen.getByTestId('custom-evm-chain-name') as HTMLInputElement).value,
    ).toBe('Optimism');
  });

  it('does not prefill on blur when the chain id is fixed by initialChain', async () => {
    render(
      <CustomEvmChainForm
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        initialChain={{ chainId: '0x539' }}
      />,
    );

    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });

    expect(ChainUtils.getChainFromDefaultChains).not.toHaveBeenCalled();
  });

  it('does not prefill on blur when editing an existing chain', async () => {
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

    await act(async () => {
      fireEvent.blur(screen.getByTestId('custom-evm-chain-id'));
    });

    expect(ChainUtils.getChainFromDefaultChains).not.toHaveBeenCalled();
  });
});

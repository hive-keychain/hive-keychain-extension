import '@testing-library/jest-dom';
import { KeychainApi } from '@api/keychain';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import {
  EvmAddCustomAssetPopup,
} from 'src/popup/evm/pages/home/evm-add-custom-asset-popup/evm-add-custom-asset-popup.component';

const chain = {
  name: 'Ethereum',
  chainId: '0x1',
} as any;

describe('EvmAddCustomAssetPopup', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([]);
    jest
      .spyOn(EvmTokensUtils, 'fetchErc20NameAndDecimalsFromChain')
      .mockResolvedValue({ name: 'USD Coin', decimals: 6 });
  });

  it('renders the manual ERC20 form without calling the popular token API', async () => {
    const onSave = jest.fn();
    const keychainGetSpy = jest.spyOn(KeychainApi, 'get');

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    await waitFor(() => {
      expect(EvmTokensUtils.getCustomTokens).toHaveBeenCalled();
    });

    expect(
      screen.getByTestId('custom-asset-contract-address'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-symbol')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-asset-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('custom-asset-decimals')).not.toBeInTheDocument();
    expect(keychainGetSpy).not.toHaveBeenCalled();
  });

  it('blocks save when required fields are empty', async () => {
    const onSave = jest.fn();

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText('Enter a valid contract address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Symbol is required.')).toBeInTheDocument();
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Decimals are required.')).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(EvmTokensUtils.fetchErc20NameAndDecimalsFromChain).not.toHaveBeenCalled();
  });

  it('blocks save for duplicate addresses', async () => {
    const onSave = jest.fn();

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        existingAddresses={['0x00000000000000000000000000000000000000AA']}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'USDC' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText('This contract address is already added.'),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(EvmTokensUtils.fetchErc20NameAndDecimalsFromChain).not.toHaveBeenCalled();
  });

  it('shows an error when name and decimals cannot be read from the chain', async () => {
    const onSave = jest.fn();
    jest
      .spyOn(EvmTokensUtils, 'fetchErc20NameAndDecimalsFromChain')
      .mockRejectedValue(new Error('revert'));

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'USDC' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText(
        'Could not read token name and decimals from the chain. Check the address and that it is a standard ERC20 contract.',
      ),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits normalized ERC20 form values', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'USDC' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-logo'), {
      target: { value: 'https://cdn.example/usdc.svg' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    await waitFor(() => {
      expect(EvmTokensUtils.fetchErc20NameAndDecimalsFromChain).toHaveBeenCalledWith(
        chain,
        '0x00000000000000000000000000000000000000AA',
      );
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        contractAddress: '0x00000000000000000000000000000000000000AA',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: 'https://cdn.example/usdc.svg',
      });
    });
  });

  it('shows the NFT placeholder without a save action', () => {
    render(
      <EvmAddCustomAssetPopup
        mode="nft"
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByText('NFT manual add is not implemented yet in this pass.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('custom-asset-save')).not.toBeInTheDocument();
  });
});

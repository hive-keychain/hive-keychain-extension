import '@testing-library/jest-dom';
import { KeychainApi } from '@api/keychain';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
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
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
const chain = {
  name: 'Ethereum',
  chainId: '0x1',
} as any;

const i18nMessages: Record<string, string> = {
  evm_add_custom_asset_error_contract_address_invalid:
    'Enter a valid contract address.',
  evm_add_custom_asset_error_contract_address_duplicate:
    'This contract address is already added.',
  evm_add_custom_token_error_symbol_required: 'Symbol is required.',
  evm_add_custom_token_error_name_required: 'Token name is required.',
  evm_add_custom_token_error_decimals_invalid:
    'Enter a valid decimal count between 0 and 255.',
  evm_add_custom_token_error_fetch_erc20_metadata:
    'Could not read token name and decimals from the chain. Check the address and that it is a standard ERC20 contract.',
  evm_add_custom_nft_error_token_ids_required: 'Enter at least one token ID.',
  evm_add_custom_nft_error_token_ids_format:
    'Token IDs must be decimal numbers or 0x-prefixed hex values.',
  evm_add_custom_nft_error_unsupported_contract:
    'Could not detect a supported NFT contract at this address. Only ERC721 and ERC1155 contracts are supported.',
  evm_add_custom_nft_error_token_ids_not_owned:
    'One or more token IDs are not owned by this wallet.',
  evm_add_custom_token_popup_title: 'Add custom token',
  evm_add_custom_token_popup_caption:
    'Search known tokens for this network. If you do not find the token you need, add it manually.',
  evm_add_custom_token_manually: 'Add manually',
  popup_html_button_label_cancel: 'Cancel',
};

const openManualErc20Form = async () => {
  fireEvent.click(await screen.findByTestId('btn-add-custom-token-manually'));
  expect(
    await screen.findByTestId('custom-asset-contract-address'),
  ).toBeInTheDocument();
};

describe('EvmAddCustomAssetPopup', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    LiFiUtils.clearKnownTokensCache();
    I18nUtils.getMessage = jest.fn(
      (key: string) => i18nMessages[key] ?? key,
    );
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([]);
    jest.spyOn(EvmTokensUtils, 'getCustomNfts').mockResolvedValue([]);
    jest
      .spyOn(EvmTokensUtils, 'fetchErc20NameAndDecimalsFromChain')
      .mockResolvedValue({ name: 'USD Coin', decimals: 6 });
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      tokens: {
        1: [
          {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000002',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoURI: '',
            marketCapUSD: 90000000000,
          },
        ],
      },
    });
  });

  it('shows known tokens and Add manually on the browse step', async () => {
    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(await screen.findByText('Add custom token')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Search known tokens for this network. If you do not find the token you need, add it manually.',
      ),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByTestId(
        'known-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('btn-add-custom-token-manually'),
    ).toHaveTextContent('Add manually');
    expect(
      screen.queryByTestId('custom-asset-contract-address'),
    ).not.toBeInTheDocument();
  });

  it('opens the manual ERC20 form from Add manually and returns to browse on cancel', async () => {
    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    await openManualErc20Form();
    expect(screen.getByTestId('custom-asset-name')).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-symbol')).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-decimals')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    expect(
      await screen.findByTestId('btn-add-custom-token-manually'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('custom-asset-contract-address'),
    ).not.toBeInTheDocument();
  });

  it('skips the browse step when editing a custom token', async () => {
    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        tokenToEdit={{
          address: '0x0000000000000000000000000000000000000001',
          type: EVMSmartContractType.ERC20,
          metadata: {
            type: EVMSmartContractType.ERC20,
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logo: '',
          },
        }}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(
      await screen.findByTestId('custom-asset-contract-address'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('btn-add-custom-token-manually'),
    ).not.toBeInTheDocument();
  });

  it('uses the token initials fallback when the ERC20 logo is empty', async () => {
    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    await openManualErc20Form();

    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'USDC' },
    });

    const logoFallback = await screen.findByText('US');

    expect(logoFallback).toHaveClass(
      'currency-icon',
      'add-background',
    );
    expect(
      screen
        .getByTestId('custom-asset-logo')
        .compareDocumentPosition(logoFallback),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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

    await openManualErc20Form();
    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText('Enter a valid contract address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Symbol is required.')).toBeInTheDocument();
    expect(screen.getByText('Token name is required.')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a valid decimal count between 0 and 255.'),
    ).toBeInTheDocument();
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

    await openManualErc20Form();

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.blur(screen.getByTestId('custom-asset-contract-address'));

    expect(
      await screen.findByText('This contract address is already added.'),
    ).toBeInTheDocument();
    expect(EvmTokensUtils.fetchErc20NameAndDecimalsFromChain).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'USDC' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(onSave).not.toHaveBeenCalled();
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

    await openManualErc20Form();

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.blur(screen.getByTestId('custom-asset-contract-address'));

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

    await openManualErc20Form();

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.blur(screen.getByTestId('custom-asset-contract-address'));

    await waitFor(() => {
      expect(EvmTokensUtils.fetchErc20NameAndDecimalsFromChain).toHaveBeenCalledWith(
        chain,
        '0x00000000000000000000000000000000000000AA',
      );
    });

    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'USDC' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-logo'), {
      target: { value: 'https://cdn.example/usdc.svg' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(EvmTokensUtils.fetchErc20NameAndDecimalsFromChain).toHaveBeenCalledTimes(
      1,
    );

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

  it('blocks NFT save when contract address or token IDs are invalid', async () => {
    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="nft"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText('Enter a valid contract address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Enter at least one token ID.')).toBeInTheDocument();
  });

  it('blocks NFT save for duplicate addresses', async () => {
    const onSave = jest.fn();

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="nft"
        walletAddress="0x1111111111111111111111111111111111111111"
        existingAddresses={['0x00000000000000000000000000000000000000AA']}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-token-ids'), {
      target: { value: '1,2' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText('This contract address is already added.'),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows an error when NFT type detection fails', async () => {
    const onSave = jest.fn();
    jest
      .spyOn(EvmTokensUtils, 'detectCustomNftType')
      .mockRejectedValue(new Error('unsupported'));

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="nft"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-token-ids'), {
      target: { value: '1,2' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText(
        'Could not detect a supported NFT contract at this address. Only ERC721 and ERC1155 contracts are supported.',
      ),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows an ownership error when not all NFT token IDs are owned', async () => {
    const onSave = jest.fn();
    jest
      .spyOn(EvmTokensUtils, 'detectCustomNftType')
      .mockResolvedValue(EVMSmartContractType.ERC721);
    jest
      .spyOn(EvmTokensUtils, 'getOwnedCustomNftTokenIds')
      .mockResolvedValue(['1']);

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="nft"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-token-ids'), {
      target: { value: '1,2' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    expect(
      await screen.findByText('One or more token IDs are not owned by this wallet.'),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits normalized NFT form values', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    jest
      .spyOn(EvmTokensUtils, 'detectCustomNftType')
      .mockResolvedValue(EVMSmartContractType.ERC1155);
    jest
      .spyOn(EvmTokensUtils, 'getOwnedCustomNftTokenIds')
      .mockResolvedValue(['1', '2']);

    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="nft"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByTestId('custom-asset-contract-address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-token-ids'), {
      target: { value: '1, 0x2, 2' },
    });

    fireEvent.click(screen.getByTestId('custom-asset-save'));

    await waitFor(() => {
      expect(EvmTokensUtils.detectCustomNftType).toHaveBeenCalledWith(
        chain,
        '0x1111111111111111111111111111111111111111',
        '0x00000000000000000000000000000000000000AA',
        ['1', '2'],
      );
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          contractAddress: '0x00000000000000000000000000000000000000AA',
          type: EVMSmartContractType.ERC1155,
          tokenIds: ['1', '2'],
        }),
      );
    });
  });
});

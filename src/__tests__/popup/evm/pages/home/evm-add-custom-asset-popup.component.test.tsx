import '@testing-library/jest-dom';
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
};

describe('EvmAddCustomAssetPopup', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    I18nUtils.getMessage = jest.fn(
      (key: string) => i18nMessages[key] ?? key,
    );
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([]);
    jest.spyOn(EvmTokensUtils, 'getCustomNfts').mockResolvedValue([]);
    jest
      .spyOn(EvmTokensUtils, 'fetchErc20NameAndDecimalsFromChain')
      .mockResolvedValue({ name: 'USD Coin', decimals: 6 });
  });

  it('renders the manual ERC20 form', async () => {
    render(
      <EvmAddCustomAssetPopup
        chain={chain}
        mode="erc20"
        walletAddress="0x1111111111111111111111111111111111111111"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(
      screen.getByTestId('custom-asset-contract-address'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-name')).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-symbol')).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-decimals')).toBeInTheDocument();
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

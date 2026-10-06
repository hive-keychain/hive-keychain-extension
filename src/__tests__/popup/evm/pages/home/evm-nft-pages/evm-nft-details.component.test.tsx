import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from 'src/popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from 'src/popup/evm/interfaces/evm-tokens.interface';
import { EvmNftDetailsView } from 'src/popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import { EvmChain } from 'src/popup/multichain/interfaces/chains.interface';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span aria-hidden="true" />,
}));

jest.mock('src/common-ui/evm/nft-media/nft-media.component', () => ({
  EvmNftMedia: () => <div data-testid="nft-media" />,
}));

const mockCopyTextWithToast = jest.fn();
jest.mock('src/common-ui/toast/copy-toast.utils', () => ({
  COPY_GENERIC_MESSAGE_KEY: 'swap_copied_to_clipboard',
  copyTextWithToast: (...args: unknown[]) => mockCopyTextWithToast(...args),
}));

const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const tokenId = '42';

const ethereumChain = {
  chainId: '0x1',
  blockExplorer: { url: 'https://eth.blockscout.com/' },
} as EvmChain;

const collection = {
  tokenInfo: {
    name: 'CryptoKitties',
    contractAddress,
    type: EVMSmartContractType.ERC721,
  },
} as EvmErc721Token;

const nft = {
  id: tokenId,
  metadata: {
    name: 'Kitty #42',
    image: 'https://example.com/kitty.png',
    attributes: [],
  },
} as EvmErc721TokenCollectionItem;

describe('EvmNftDetails', () => {
  const tabsCreate = jest.fn();

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    mockCopyTextWithToast.mockClear();
    tabsCreate.mockClear();
    (global as any).chrome = {
      tabs: { create: tabsCreate },
    };
  });

  const renderNftDetails = (chain: EvmChain = ethereumChain) => {
    const onSend = jest.fn();
    render(
      <EvmNftDetailsView
        nft={nft}
        collection={collection}
        chain={chain}
        onSend={onSend}
      />,
    );
    return { onSend };
  };

  it('copies the smart contract address from the nft details', async () => {
    const user = userEvent.setup();
    const { onSend } = renderNftDetails();

    expect(
      screen.getByTestId(`nft-contract-address-${contractAddress}-${tokenId}`),
    ).toHaveTextContent('0xa0b86...6eb48');

    await user.click(
      screen.getByTestId(`nft-contract-copy-${contractAddress}-${tokenId}`),
    );

    expect(mockCopyTextWithToast).toHaveBeenCalledWith(
      contractAddress,
      'swap_copied_to_clipboard',
    );
    expect(onSend).not.toHaveBeenCalled();
  });

  it('opens the nft contract page on the chain block explorer', async () => {
    const user = userEvent.setup();
    const { onSend } = renderNftDetails();

    await user.click(
      screen.getByTestId(
        `nft-contract-explorer-${contractAddress}-${tokenId}`,
      ),
    );

    expect(tabsCreate).toHaveBeenCalledWith({
      url: `https://eth.blockscout.com/token/${contractAddress}`,
    });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('hides the explorer button when the chain has no block explorer', () => {
    renderNftDetails({} as EvmChain);

    expect(
      screen.getByTestId(`nft-contract-copy-${contractAddress}-${tokenId}`),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        `nft-contract-explorer-${contractAddress}-${tokenId}`,
      ),
    ).not.toBeInTheDocument();
  });

  it('shows the token for viewing and sends from the primary button', async () => {
    const user = userEvent.setup();
    const { onSend } = renderNftDetails();

    expect(screen.getByText('Kitty #42')).toBeInTheDocument();
    expect(screen.getByText('CryptoKitties')).toBeInTheDocument();
    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.queryByTestId('nft-owned-quantity')).not.toBeInTheDocument();
    expect(screen.getAllByText('ERC721').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('nft-details-balance')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('nft-details-tab-description'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('nft-send-form')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('nft-details-send'));

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('shows how many copies are owned for an erc1155 token', () => {
    render(
      <EvmNftDetailsView
        nft={{ ...nft, balance: 2 }}
        collection={{
          ...collection,
          tokenInfo: {
            ...collection.tokenInfo,
            type: EVMSmartContractType.ERC1155,
          },
        }}
        chain={ethereumChain}
      />,
    );

    expect(screen.getByTestId('nft-owned-quantity')).toHaveTextContent(
      'evm_nft_you_own',
    );
    expect(screen.queryByText('evm_nft_your_balance')).not.toBeInTheDocument();
  });
});

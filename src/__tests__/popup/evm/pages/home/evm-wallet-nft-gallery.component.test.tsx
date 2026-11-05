import '@testing-library/jest-dom';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmWalletNftGalleryComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-gallery.component';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import {
  cleanup,
  customRender,
  screen,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';
import { I18nUtils } from 'src/utils/i18n.utils';

const chain = {
  ...initialEmptyStateStore.chain,
  type: ChainType.EVM,
  isCustom: false,
  chainId: '0x1',
  name: 'Ethereum',
} as any;

const activeAccount = (nfts: unknown[]) =>
  ({
    wallet: {
      address: '0x1111111111111111111111111111111111111111',
    },
    nfts: {
      value: nfts,
      loading: false,
      initialized: true,
    },
  }) as any;

describe('EvmWalletNftGalleryComponent', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    I18nUtils.getMessage = jest.fn((key: string) => key);
    jest
      .spyOn(EvmTokensUtils, 'filterTokensBasedOnSettings')
      .mockImplementation(async (tokens) => tokens);
  });

  afterEach(() => {
    cleanup();
  });

  it('hides the collection filter when no nfts are found', async () => {
    customRender(
      <EvmWalletNftGalleryComponent
        chain={chain}
        activeAccount={activeAccount([])}
        onClickOnNftPreview={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('evm_no_nfts_found')).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId('nft-collection-search'),
    ).not.toBeInTheDocument();
  });

  it('shows the collection filter when nfts are found', async () => {
    customRender(
      <EvmWalletNftGalleryComponent
        chain={chain}
        activeAccount={activeAccount([
          {
            tokenInfo: {
              type: EVMSmartContractType.ERC721,
              name: 'Example NFT',
              symbol: 'NFT',
              contractAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              logo: '',
            },
            collection: [
              {
                id: '1',
                metadata: {
                  name: 'Kitty #1',
                  image: 'https://example.com/nft.png',
                },
              },
            ],
          },
        ])}
        onClickOnNftPreview={jest.fn()}
      />,
    );

    expect(await screen.findByTestId('nft-collection-search')).toBeInTheDocument();
  });
});

import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { I18nUtils } from 'src/utils/i18n.utils';

const activeWalletAddress = '0x1111111111111111111111111111111111111111';

const collectionItem = {
  collection: {
    tokenInfo: {
      contractAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      type: EVMSmartContractType.ERC721,
      name: 'Example NFT',
      symbol: 'NFT',
      logo: '',
    },
  },
  item: {
    id: '1',
    metadata: {
      name: 'Kitty #1',
      image: 'https://example.com/nft.png',
    },
  },
} as EvmNftCollectionListItem;

const buildState = () => ({
  ...initialEmptyStateStore,
  chain: {
    ...initialEmptyStateStore.chain,
    type: ChainType.EVM,
    chainId: '0x1',
    name: 'Ethereum',
    logo: '',
    rpcs: [{ url: 'https://rpc.example', isDefault: true }],
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
  },
  evm: {
    ...initialEmptyStateStore.evm,
    accounts: [],
    activeAccount: {
      ...initialEmptyStateStore.evm.activeAccount,
      address: activeWalletAddress,
      wallet: { address: activeWalletAddress },
      isReady: true,
    },
  },
});

describe('EvmNftCollectionComponent', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  it('opens the selected nft without showing the send form', async () => {
    const user = userEvent.setup();
    const onSelectNft = jest.fn();

    customRender(
      <EvmNftCollectionComponent
        nftList={[collectionItem]}
        onSelectNft={onSelectNft}
      />,
      {
        initialState: buildState(),
      },
    );

    expect(screen.queryByTestId('nft-send-form')).not.toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();

    await user.click(await screen.findByText('Kitty #1'));

    expect(onSelectNft).toHaveBeenCalledWith(collectionItem);
    expect(screen.queryByTestId('nft-send-form')).not.toBeInTheDocument();
  });

  it('shows an erc1155 quantity under the artwork', () => {
    const onSelectNft = jest.fn();
    const erc1155Item = {
      ...collectionItem,
      collection: {
        tokenInfo: {
          ...collectionItem.collection.tokenInfo,
          type: EVMSmartContractType.ERC1155,
        },
      },
      item: {
        ...collectionItem.item,
        id: '2',
        balance: 3,
        metadata: {
          name: 'Paper',
          image: 'https://example.com/paper.png',
        },
      },
    } as EvmNftCollectionListItem;

    customRender(
      <EvmNftCollectionComponent
        nftList={[erc1155Item]}
        onSelectNft={onSelectNft}
      />,
      {
        initialState: buildState(),
      },
    );

    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it('filters the gallery to tokens with more than one copy', async () => {
    const user = userEvent.setup();
    const onSelectNft = jest.fn();
    const multipleCopies = {
      ...collectionItem,
      collection: {
        tokenInfo: {
          ...collectionItem.collection.tokenInfo,
          type: EVMSmartContractType.ERC1155,
        },
      },
      item: {
        ...collectionItem.item,
        id: '2',
        balance: 3,
        metadata: {
          name: 'Paper',
          image: 'https://example.com/paper.png',
          description: '',
        },
      },
    } as EvmNftCollectionListItem;

    customRender(
      <EvmNftCollectionComponent
        nftList={[collectionItem, multipleCopies]}
        onSelectNft={onSelectNft}
      />,
      {
        initialState: buildState(),
      },
    );

    await user.click(screen.getByTestId('nft-filter-button'));
    await user.click(screen.getByTestId('nft-filter-multiple'));

    expect(screen.getByText('Paper')).toBeInTheDocument();
    expect(screen.queryByText('Kitty #1')).not.toBeInTheDocument();
  });
});

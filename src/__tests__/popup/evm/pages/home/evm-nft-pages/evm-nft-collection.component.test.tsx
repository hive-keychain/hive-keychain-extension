import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
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

  it('shows the send form on the expanded nft card', async () => {
    const user = userEvent.setup();
    let resolveAutocomplete: (value: { categories: [] }) => void = () => undefined;
    const autocompletePromise = new Promise<{ categories: [] }>((resolve) => {
      resolveAutocomplete = resolve;
    });

    jest
      .spyOn(EvmAddressesUtils, 'getWhiteListAutocomplete')
      .mockReturnValue(autocompletePromise);
    jest
      .spyOn(EvmAddressesUtils, 'enrichWhiteListAutocomplete')
      .mockImplementation(async (values) => values);

    customRender(<EvmNftCollectionComponent nftList={[collectionItem]} />, {
      initialState: buildState(),
    });

    expect(
      screen.queryByPlaceholderText('evm_nft_transfer_address'),
    ).not.toBeInTheDocument();

    await user.click(await screen.findByText('Kitty #1'));

    expect(
      await screen.findByPlaceholderText('evm_nft_transfer_address'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('nft-send-form')).toBeInTheDocument();

    await act(async () => {
      resolveAutocomplete({ categories: [] });
      await Promise.resolve();
      await Promise.resolve();
    });
  });
});

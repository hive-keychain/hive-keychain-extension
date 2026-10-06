import '@testing-library/jest-dom';
import { act, cleanup, fireEvent } from '@testing-library/react';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmNftCollectionListItem } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmNftTransferFormComponent } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-transfer/evm-nft-transfer.component';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import {
  customRender,
  screen,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';

import { I18nUtils } from 'src/utils/i18n.utils';
jest.mock('src/common-ui/button/button.component', () => ({
  __esModule: true,
  default: ({ label, onClick, dataTestId }: any) => {
    const React = require('react');
    return React.createElement(
      'button',
      { type: 'button', onClick, 'data-testid': dataTestId ?? label },
      label,
    );
  },
}));

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const hasUnmountedStateUpdateWarning = (
  consoleError: jest.SpyInstance<void, any[]>,
) =>
  consoleError.mock.calls.some((call) =>
    call.some(
      (arg) =>
        typeof arg === 'string' &&
        arg.includes(
          "Can't perform a React state update on an unmounted component",
        ),
    ),
  );

describe('evm-nft-transfer autocomplete behavior', () => {
  const activeWalletAddress = '0x1111111111111111111111111111111111111111';
  const savedWalletAddress = '0x3333333333333333333333333333333333333333';

  const baseAutocomplete = {
    categories: [
      {
        title: 'evm_wallets',
        translateTitle: true,
        values: [
          {
            value: savedWalletAddress,
            label: 'NFT recipient',
            subLabel: '0x33333...33333',
            img: 'identicon://nft-recipient',
          },
        ],
      },
      {
        title: 'local_accounts',
        translateTitle: true,
        values: [],
      },
    ],
  };

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
      metadata: { image: 'https://example.com/nft.png' },
    },
  } as EvmNftCollectionListItem;

  const buildState = () => ({
    ...initialEmptyStateStore,
    navigation: {
      ...initialEmptyStateStore.navigation,
      stack: [],
    },
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
      accounts: [
        {
          id: 0,
          path: "m/44'/60'/0'/0/0",
          seedId: 1,
          seedNickname: 'Primary seed',
          nickname: 'Active wallet',
          wallet: { address: activeWalletAddress },
        },
      ],
      activeAccount: {
        ...initialEmptyStateStore.evm.activeAccount,
        address: activeWalletAddress,
        wallet: { address: activeWalletAddress },
        isReady: true,
      },
    },
  });

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup();
  });

  it('shows base autocomplete suggestions before enrichment resolves', async () => {
    const enrichmentDeferred = createDeferred<typeof baseAutocomplete>();

    jest
      .spyOn(EvmAddressesUtils, 'getWhiteListAutocomplete')
      .mockResolvedValue(baseAutocomplete);
    const enrichSpy = jest
      .spyOn(EvmAddressesUtils, 'enrichWhiteListAutocomplete')
      .mockReturnValue(enrichmentDeferred.promise);

    customRender(
      <EvmNftTransferFormComponent collectionItem={collectionItem} />,
      {
        initialState: buildState(),
      },
    );

    const input = await screen.findByRole('textbox');
    fireEvent.focus(input);

    expect(await screen.findByText('NFT recipient')).toBeInTheDocument();
    expect(enrichSpy).toHaveBeenCalledWith(baseAutocomplete);

    await act(async () => {
      enrichmentDeferred.resolve(baseAutocomplete);
      await Promise.resolve();
    });
  });

  it('does not update local state when enrichment resolves after unmount', async () => {
    const enrichmentDeferred = createDeferred<typeof baseAutocomplete>();

    jest
      .spyOn(EvmAddressesUtils, 'getWhiteListAutocomplete')
      .mockResolvedValue(baseAutocomplete);
    jest
      .spyOn(EvmAddressesUtils, 'enrichWhiteListAutocomplete')
      .mockReturnValue(enrichmentDeferred.promise);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = customRender(
      <EvmNftTransferFormComponent collectionItem={collectionItem} />,
      {
        initialState: buildState(),
      },
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    unmount();

    await act(async () => {
      enrichmentDeferred.resolve(baseAutocomplete);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });

  it('uses an integer stepper for erc1155 and omits it for erc721', async () => {
    jest
      .spyOn(EvmAddressesUtils, 'getWhiteListAutocomplete')
      .mockResolvedValue(baseAutocomplete);
    jest
      .spyOn(EvmAddressesUtils, 'enrichWhiteListAutocomplete')
      .mockImplementation(async (values) => values);

    const { unmount } = customRender(
      <EvmNftTransferFormComponent collectionItem={collectionItem} />,
      {
        initialState: buildState(),
      },
    );

    expect(screen.queryByTestId('nft-quantity-stepper')).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('popup_html_amount'),
    ).not.toBeInTheDocument();
    unmount();

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
        balance: 2,
      },
    } as EvmNftCollectionListItem;

    customRender(
      <EvmNftTransferFormComponent collectionItem={erc1155Item} />,
      {
        initialState: buildState(),
      },
    );

    expect(screen.getByTestId('nft-quantity-owned')).toHaveTextContent(
      'evm_nft_you_own',
    );
    expect(screen.getByTestId('nft-quantity-increase')).toBeEnabled();

    fireEvent.click(screen.getByTestId('nft-quantity-increase'));

    expect(screen.getByTestId('nft-quantity-value')).toHaveTextContent('2');
    expect(screen.getByTestId('nft-quantity-owned')).toHaveTextContent(
      'evm_nft_you_own',
    );
    expect(screen.getByTestId('nft-quantity-increase')).toBeDisabled();

    fireEvent.click(screen.getByTestId('nft-quantity-decrease'));

    expect(screen.getByTestId('nft-quantity-value')).toHaveTextContent('1');
    expect(screen.getByTestId('nft-quantity-decrease')).toBeDisabled();
  });
});

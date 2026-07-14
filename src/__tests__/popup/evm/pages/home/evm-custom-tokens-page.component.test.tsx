import '@testing-library/jest-dom';
import { KeychainApi } from '@api/keychain';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CatchupStatus,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmAutoDetectedTokenVisibilityUtils } from '@popup/evm/utils/evm-auto-detected-token-visibility.utils';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { EvmCustomTokensPageComponent } from '@popup/evm/pages/home/evm-custom-tokens-page/evm-custom-tokens-page.component';
import {
  customRender,
  fireEvent,
  screen,
  waitFor,
  within,
} from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import React from 'react';

describe('EvmCustomTokensPageComponent', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    LiFiUtils.clearKnownTokensCache();
    jest
      .spyOn(chrome.i18n, 'getMessage')
      .mockImplementation((key: string) => key);
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([
      {
        address: '0x0000000000000000000000000000000000000001',
        type: EVMSmartContractType.ERC20,
        metadata: {
          type: EVMSmartContractType.ERC20,
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          logo: '',
        },
      },
    ]);
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      tokens: {
        1: [
          {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000001',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: '',
            marketCapUSD: 30000000000,
          },
          {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000002',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoURI: '',
            marketCapUSD: 90000000000,
          },
          {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000003',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: 18,
            logoURI: '',
            marketCapUSD: 5000000000,
          },
        ],
      },
    });
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredTokens').mockResolvedValue({
      address: '0x1111111111111111111111111111111111111111',
      chainId: '1',
      tokens: [
        {
          type: EVMSmartContractType.ERC20,
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
          logo: '',
          chainId: '0x1',
          contractAddress: '0x0000000000000000000000000000000000000002',
          backgroundColor: '',
          priceUsd: 1,
          balance: '1000000',
          formattedBalance: '1',
          possibleSpam: false,
          verifiedContract: true,
          isProxy: false,
          proxyTarget: null,
          validated: 0,
        },
        {
          type: EVMSmartContractType.ERC20,
          name: 'Dai Stablecoin',
          symbol: 'DAI',
          decimals: 18,
          logo: '',
          chainId: '0x1',
          contractAddress: '0x0000000000000000000000000000000000000003',
          backgroundColor: '',
          priceUsd: 1,
          balance: '5000000000000000000',
          formattedBalance: '5',
          possibleSpam: false,
          verifiedContract: true,
          isProxy: false,
          proxyTarget: null,
          validated: 0,
        },
        {
          type: EVMSmartContractType.ERC20,
          name: 'Spam Token',
          symbol: 'SPAM',
          decimals: 18,
          logo: '',
          chainId: '0x1',
          contractAddress: '0x0000000000000000000000000000000000000004',
          backgroundColor: '',
          priceUsd: 1,
          balance: '100000000000000000000',
          formattedBalance: '100',
          possibleSpam: true,
          verifiedContract: true,
          isProxy: false,
          proxyTarget: null,
          validated: 0,
        },
        {
          type: EVMSmartContractType.ERC20,
          name: 'Unverified Token',
          symbol: 'UNV',
          decimals: 18,
          logo: '',
          chainId: '0x1',
          contractAddress: '0x0000000000000000000000000000000000000005',
          backgroundColor: '',
          priceUsd: 1,
          balance: '100000000000000000000',
          formattedBalance: '100',
          possibleSpam: false,
          verifiedContract: false,
          isProxy: false,
          proxyTarget: null,
          validated: 0,
        },
      ],
      catchupStatus: CatchupStatus.DONE,
      pricingStatus: PricingStatus.READY,
    });
    jest.spyOn(EvmSettingsUtils, 'getSettings').mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
      providerCompatibility: {
        preferOnLegacyDapps: true,
      },
    });
    jest
      .spyOn(
        EvmAutoDetectedTokenVisibilityUtils,
        'getHiddenAutoDetectedTokenAddresses',
      )
      .mockResolvedValue([]);
    jest
      .spyOn(EvmAutoDetectedTokenVisibilityUtils, 'hideAutoDetectedToken')
      .mockResolvedValue(undefined);
    jest
      .spyOn(EvmAutoDetectedTokenVisibilityUtils, 'restoreAutoDetectedToken')
      .mockResolvedValue(undefined);
  });

  it('lists custom tokens and opens the add popup from the manage link', async () => {
    const { store } = customRender(<EvmCustomTokensPageComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          isCustom: true,
          chainId: '0x1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            wallet: {
              address: '0x1111111111111111111111111111111111111111',
            } as any,
            nativeAndErc20Tokens: {
              value: [
                {
                  tokenInfo: {
                    type: EVMSmartContractType.ERC20,
                    contractAddress:
                      '0x0000000000000000000000000000000000000002',
                  },
                },
              ],
              loading: false,
              initialized: true,
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(EvmTokensUtils.getCustomTokens).toHaveBeenCalled();
    });

    expect(store.getState().titleContainer.title).toBe(
      'evm_custom_tokens_page_title',
    );
    expect(screen.queryByText('Auto-detected tokens')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Hide auto-detected tokens, or edit and remove custom ones/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Zero-balance tokens stay off the home page/),
    ).toBeInTheDocument();
    expect(screen.getByText('Custom tokens')).toBeInTheDocument();
    expect(screen.getByText('USDC')).toBeInTheDocument();
    const savedTokenRow = screen
      .getByTestId(
        'btn-delete-custom-token-0x0000000000000000000000000000000000000001',
      )
      .closest('li')!;

    expect(within(savedTokenRow).getByText('US')).toHaveClass(
      'currency-icon',
      'add-background',
    );
    expect(screen.queryByText('Add a token')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        'known-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('btn-add-custom-token-page')).toHaveTextContent(
      'Add custom token',
    );
    expect(
      screen
        .getByTestId('btn-add-custom-token-page')
        .closest('.evm-custom-tokens-section-header'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-add-custom-token-page'));

    expect(await screen.findByTestId('custom-asset-popup')).toBeInTheDocument();
    expect(
      await screen.findByTestId(
        'known-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        'known-token-item-0x0000000000000000000000000000000000000001',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('btn-add-custom-token-manually'),
    ).toBeInTheDocument();
  });

  it('renders auto-detected tokens for supported chains and lets them be hidden', async () => {
    customRender(<EvmCustomTokensPageComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          isCustom: false,
          chainId: '0x1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            wallet: {
              address: '0x1111111111111111111111111111111111111111',
            } as any,
            nativeAndErc20Tokens: {
              value: [],
              loading: false,
              initialized: true,
            },
          },
        },
      },
    });

    expect(await screen.findByText('Auto-detected tokens')).toBeInTheDocument();
    expect(screen.getByText('Custom tokens')).toBeInTheDocument();
    expect(
      screen.getByTestId(
        'auto-detected-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).toBeInTheDocument();
    const autoDetectedRows = await screen.findAllByTestId(
      /^auto-detected-token-item-/,
    );
    expect(
      autoDetectedRows.map((row) => row.getAttribute('data-testid')),
    ).toEqual([
      'auto-detected-token-item-0x0000000000000000000000000000000000000003',
      'auto-detected-token-item-0x0000000000000000000000000000000000000002',
    ]);
    expect(screen.queryByText('SPAM')).not.toBeInTheDocument();
    expect(screen.queryByText('UNV')).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(
        'known-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        'known-token-item-0x0000000000000000000000000000000000000003',
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId(
        'auto-detected-token-item-0x0000000000000000000000000000000000000002',
      ),
    );

    await waitFor(() => {
      expect(
        EvmAutoDetectedTokenVisibilityUtils.hideAutoDetectedToken,
      ).toHaveBeenCalledWith(
        '0x1',
        '0x0000000000000000000000000000000000000002',
      );
    });
    expect(
      screen.getByTestId(
        'auto-detected-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).toHaveClass('known-token-item--hidden');
  });

  it('shows an empty auto-detected token state for supported chains', async () => {
    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockResolvedValueOnce({
      address: '0x1111111111111111111111111111111111111111',
      chainId: '1',
      tokens: [],
      catchupStatus: CatchupStatus.DONE,
      pricingStatus: PricingStatus.READY,
    });

    customRender(<EvmCustomTokensPageComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          isCustom: false,
          chainId: '0x1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            wallet: {
              address: '0x1111111111111111111111111111111111111111',
            } as any,
          },
        },
      },
    });

    expect(
      await screen.findByText('No auto-detected tokens found for this network.'),
    ).toBeInTheDocument();
  });
});

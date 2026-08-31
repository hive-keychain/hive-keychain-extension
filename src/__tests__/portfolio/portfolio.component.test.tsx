import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import AccountSelectorOrderUtils from '@popup/multichain/utils/account-selector-order.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { EvmActiveAccountUtils } from 'src/popup/evm/utils/evm-active-account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import {
  PortfolioApiError,
  PortfolioApiUtils,
} from 'src/portfolio/portfolio-api.utils';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';
import { Portfolio } from 'src/portfolio/portfolio.component';
import { PortfolioSwapCatalogCacheUtils } from 'src/portfolio/portfolio-swap-catalog-cache.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { PortfolioEvmBalanceRefreshUtils } from 'src/portfolio/portfolio-evm-balance-refresh.utils';

jest.mock('src/popup/hive/utils/tokens.utils', () => ({
  __esModule: true,
  default: {
    getAllTokens: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('src/popup/hive/utils/active-account.utils', () => ({
  __esModule: true,
  default: {
    getActiveAccountNameFromLocalStorage: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('src/popup/evm/utils/evm-active-account.utils', () => ({
  EvmActiveAccountUtils: {
    getSavedActiveAccountWallet: jest.fn(async (accounts) => accounts[0].wallet),
  },
}));

jest.mock('src/portfolio/portfolio-swap-catalog-cache.utils', () => ({
  PortfolioSwapCatalogCacheUtils: {
    getCachedSwapCatalog: jest.fn().mockResolvedValue(null),
    ensureSwapCatalogCached: jest.fn(),
  },
}));

const swapAssetsFixture = [
  {
    assetId: 'evm:native:ethereum',
    ecosystem: 'evm',
    symbol: 'ETH',
    name: 'Ethereum',
    chainId: '0x1',
    address: null,
    decimals: 18,
    isNative: true,
    familyId: 'eth',
    logoUrl: null,
    priceUsd: 0,
    rankScore: 0,
  },
  {
    assetId: 'evm:native:polygon',
    ecosystem: 'evm',
    symbol: 'MATIC',
    name: 'Polygon',
    chainId: '0x89',
    address: null,
    decimals: 18,
    isNative: true,
    familyId: 'matic',
    logoUrl: null,
    priceUsd: 0,
    rankScore: 0,
  },
];

const mockPortfolioListAvailableAssets = () => {
  (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockImplementation(
    async (params: {
      mode: string;
      direction: string;
      sourceAssetId?: string;
    }) => {
      if (params.mode === 'swap' && !params.direction) {
        return {
          mode: 'swap',
          direction: null,
          sourceAssetId: params.sourceAssetId ?? null,
          assets: swapAssetsFixture,
          chains: {},
        };
      }

      return {
        mode: params.mode,
        direction: params.direction,
        sourceAssetId: params.sourceAssetId ?? null,
        assets: [],
        chains: {},
      };
    },
  );
};

const clickPortfolioNav = (
  container: HTMLElement,
  section: 'portfolio' | 'buy' | 'sell' | 'swap' | 'history',
) => {
  fireEvent.click(
    container.querySelector(
      `[data-testid="portfolio-nav-${section}"]`,
    ) as HTMLButtonElement,
  );
};

const selectOverlayOption = async (
  container: HTMLElement,
  selectId: string,
  matcher: (text: string) => boolean,
) => {
  fireEvent.click(
    container.querySelector(`#${selectId}`) as HTMLButtonElement,
  );
  await waitFor(() => {
    expect(container.querySelector(`#${selectId}-listbox`)).not.toBeNull();
  });

  const option = [
    ...container.querySelectorAll(`#${selectId}-listbox [role="option"]`),
  ].find((item) => matcher(item.textContent ?? ''));
  expect(option).toBeTruthy();
  fireEvent.click(option as HTMLElement);
};

jest.mock('src/portfolio/portfolio-api.utils', () => {
  const actual = jest.requireActual('src/portfolio/portfolio-api.utils');

  return {
    ...actual,
    PortfolioApiUtils: {
      ...actual.PortfolioApiUtils,
      listAssets: jest.fn().mockResolvedValue({ assets: [], chains: {} }),
      listHistory: jest.fn().mockResolvedValue([]),
      listComplianceReviewHistory: jest.fn().mockResolvedValue([]),
      getFeatures: jest.fn().mockResolvedValue({
        swapBridge: true,
        buy: true,
        sell: true,
      }),
      getQuotes: jest.fn().mockResolvedValue({ quotes: [] }),
      resolveExecutablePortfolioQuoteId: jest.fn().mockReturnValue(''),
      canExecutePortfolioQuote: jest.fn().mockReturnValue(true),
      resolvePortfolioAmountQuoteError:
        actual.PortfolioApiUtils.resolvePortfolioAmountQuoteError,
      getFiatRampOptions: jest.fn().mockResolvedValue({
        fiatCurrencies: ['USD', 'EUR', 'TWD'],
        paymentMethods: [{ id: 'card', label: 'Credit / Debit Card' }],
      }),
      getFiatRampLocale: jest.fn().mockResolvedValue({
        countryCode: null,
        source: 'unavailable',
      }),
      listAvailableAssets: jest.fn().mockResolvedValue({
        mode: 'buy',
        direction: 'to',
        sourceAssetId: null,
        assets: [],
        chains: {},
      }),
    },
  };
});

const ethereumChain: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: 'ethereum.svg',
  chainId: '0x1',
  rpcs: [{ url: 'https://ethereum.rpc' }],
  mainToken: 'ETH',
  defaultTransactionType: EvmTransactionType.EIP_1559,
};

const polygonChain: EvmChain = {
  name: 'Polygon',
  type: ChainType.EVM,
  logo: 'polygon.svg',
  chainId: '0x89',
  rpcs: [{ url: 'https://polygon.rpc' }],
  mainToken: 'MATIC',
  defaultTransactionType: EvmTransactionType.EIP_1559,
};

const ethToken = {
  tokenInfo: {
    type: EVMSmartContractType.NATIVE,
    symbol: 'ETH',
    chainId: '0x1',
    priceUsd: 100,
    logo: 'eth.svg',
  },
  formattedBalance: '1',
  balance: 1n,
  balanceInteger: 1,
  shortFormattedBalance: '1',
} as never;

const maticToken = {
  tokenInfo: {
    type: EVMSmartContractType.NATIVE,
    symbol: 'MATIC',
    chainId: '0x89',
    priceUsd: 1,
    logo: 'matic.svg',
  },
  formattedBalance: '10',
  balance: 10n,
  balanceInteger: 10,
  shortFormattedBalance: '10',
} as never;

describe('Portfolio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      ActiveAccountUtils.getActiveAccountNameFromLocalStorage as jest.Mock
    ).mockResolvedValue(undefined);
    (
      EvmActiveAccountUtils.getSavedActiveAccountWallet as jest.Mock
    ).mockImplementation(async (accounts) => accounts[0].wallet);
    window.history.replaceState(null, '', '/#portfolio');
    mockPortfolioListAvailableAssets();
    (
      PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog as jest.Mock
    ).mockResolvedValue(null);
    (
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached as jest.Mock
    ).mockImplementation(() =>
      PortfolioApiUtils.listAvailableAssets({ mode: 'swap' }),
    );
    jest
      .spyOn(ChainUtils, 'getAllSetupChainsForType')
      .mockResolvedValue([ethereumChain, polygonChain]);
    jest
      .spyOn(
        EvmAccountTokensLoadUtils,
        'loadVisibleNativeAndErc20TokensForSetupChains',
      )
      .mockImplementation(async (_chains, _walletAddress, options) => {
        options?.onChainReady?.(ethereumChain, [ethToken]);
        options?.onChainFinished?.(ethereumChain);
        await Promise.resolve();
        options?.onChainReady?.(polygonChain, [maticToken]);
        options?.onChainFinished?.(polygonChain);
        return [ethToken, maticToken];
      });
  });

  it('renders the portfolio shell and navigates between sections', async () => {
    const setTitleContainerProperties = jest.fn();
    const { container, getByTestId } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={setTitleContainerProperties}
      />,
    );

    await waitFor(() => {
      expect(getByTestId('portfolio-page')).toBeTruthy();
    });
    expect(container.querySelector('.portfolio-app-shell')).not.toBeNull();
    expect(container.querySelector('.portfolio-sidebar')).not.toBeNull();
    expect(setTitleContainerProperties).toHaveBeenCalledWith({
      title: '',
      isCloseButtonDisabled: true,
    });

    const sidebarButtons = container.querySelectorAll(
      '.portfolio-sidebar nav button',
    );
    expect(sidebarButtons).toHaveLength(5);
    expect(sidebarButtons[0].classList.contains('active')).toBe(true);
    expect(window.location.hash).toBe('#portfolio');

    expect(
      container
        .querySelector('.portfolio-card')
        ?.classList.contains('portfolio-card--compact'),
    ).toBe(false);
    expect(container.querySelector('.portfolio-card-header')).toBeNull();
    expect(container.querySelector('.portfolio-page-header h1')).not.toBeNull();
    expect(container.querySelector('.portfolio-refresh-button')).not.toBeNull();

    clickPortfolioNav(container, 'buy');

    expect(
      container
        .querySelector('[data-testid="portfolio-nav-buy"]')
        ?.classList.contains('active'),
    ).toBe(true);
    await waitFor(() => {
      expect(container.querySelector('.portfolio-flow')).not.toBeNull();
    });
    expect(window.location.hash).toBe('#buy');
    expect(
      container
        .querySelector('.portfolio-card')
        ?.classList.contains('portfolio-card--compact'),
    ).toBe(true);
    expect(
      container
        .querySelector('.portfolio-page-frame')
        ?.classList.contains('portfolio-page-frame--compact'),
    ).toBe(true);
    expect(container.querySelector('.portfolio-card-header')).toBeNull();
    expect(container.querySelector('.portfolio-page-header h1')).not.toBeNull();
    expect(container.querySelector('.portfolio-refresh-button')).toBeNull();
  });

  it('restores the current section from the URL hash', async () => {
    window.history.replaceState(null, '', '/#history');

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        container
          .querySelector('[data-testid="portfolio-nav-history"]')
          ?.classList.contains('active'),
      ).toBe(true);
    });
    expect(window.location.hash).toBe('#history');
    expect(
      container
        .querySelector('.portfolio-card')
        ?.classList.contains('portfolio-card--compact'),
    ).toBe(false);

    clickPortfolioNav(container, 'history');

    expect(
      container
        .querySelector('.portfolio-card')
        ?.classList.contains('portfolio-card--compact'),
    ).toBe(false);
  });

  it('loads evm chains in parallel and renders rows as each chain becomes ready', async () => {
    let resolvePolygon!: () => void;
    const polygonReady = new Promise<void>((resolve) => {
      resolvePolygon = resolve;
    });

    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      await polygonReady;
      options?.onChainReady?.(polygonChain, [maticToken]);
      options?.onChainFinished?.(polygonChain);
      return [ethToken, maticToken];
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledWith(
        [ethereumChain, polygonChain],
        '0xabc',
        expect.objectContaining({
          onChainReady: expect.any(Function),
        }),
      ),
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
      expect(container.textContent).toContain('Ethereum');
      expect(container.textContent).not.toContain('MATIC');
    });

    resolvePolygon();

    await waitFor(() => {
      expect(container.textContent).toContain('MATIC');
      expect(container.textContent).toContain('Polygon');
    });
  });

  it('keeps the default EVM account selected instead of falling back to Hive', async () => {
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [],
      orderedTokenList: [],
      tokens: [],
    });

    const { rerender } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledWith(
        [ethereumChain, polygonChain],
        '0xabc',
        expect.objectContaining({
          onChainReady: expect.any(Function),
        }),
      ),
    );

    expect(PortfolioUtils.getPortfolio).not.toHaveBeenCalled();

    rerender(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1),
    );
    expect(PortfolioUtils.getPortfolio).not.toHaveBeenCalled();
  });

  it('orders Hive tokens as HIVE, HBD, HP, then Hive Engine tokens by value', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccounts')
      .mockResolvedValue([{ name: 'alice' } as never]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [
        {
          account: 'alice',
          balances: [
            { symbol: 'BEE', balance: 100, usdValue: 500 },
            { symbol: 'HP', balance: 50, usdValue: 200 },
            { symbol: 'HBD', balance: 10, usdValue: 10 },
            { symbol: 'DEC', balance: 1, usdValue: 1000 },
            { symbol: 'HIVE', balance: 5, usdValue: 5 },
          ],
          totalHive: 0,
          totalUSD: 0,
        },
      ],
      orderedTokenList: ['HIVE', 'HBD', 'HP', 'DEC', 'BEE'],
      tokens: [],
    });

    const { container, getByText } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      const symbols = Array.from(
        container.querySelectorAll('.portfolio-token-identity strong'),
      ).map((element) => element.textContent);

      expect(symbols).toEqual(['HIVE', 'HBD', 'HP', 'DEC', 'BEE']);
    });
  });

  it('expands Hive Engine ownership breakdown into a vertical list', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccounts')
      .mockResolvedValue([{ name: 'alice' } as never]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [
        {
          account: 'alice',
          balances: [
            {
              symbol: 'BEE',
              balance: 0,
              usdValue: 30,
              priceUsd: 0.002,
              breakdown: {
                liquid: 0,
                stake: 96153.846,
                delegationsIn: 1,
                delegationsOut: 0,
                pendingUnstake: 100000,
                pendingUndelegations: 0,
              },
            },
            {
              symbol: 'HIVE',
              balance: 5,
              usdValue: 5,
            },
          ],
          totalHive: 0,
          totalUSD: 35,
        },
      ],
      orderedTokenList: ['HIVE', 'BEE'],
      tokens: [{ symbol: 'BEE', precision: 3, metadata: {} } as never],
    });
    (TokensUtils.getAllTokens as jest.Mock).mockResolvedValue([
      { symbol: 'BEE', precision: 3, metadata: {} },
    ]);

    const { container, getByText } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(getByText('0.000')).toBeTruthy();
      expect(
        container.querySelector('.portfolio-amount-expand'),
      ).toBeTruthy();
    });

    expect(container.querySelector('.portfolio-row-breakdown')).toBeNull();

    fireEvent.click(
      container.querySelector('.portfolio-amount-expand') as HTMLButtonElement,
    );

    await waitFor(() => {
      const breakdownValues = Array.from(
        container.querySelectorAll('.portfolio-row-breakdown__value'),
      ).map((element) => element.textContent);

      expect(breakdownValues).toEqual([
        '0.000',
        '96,153.846',
        '100,000.000',
        '1.000',
      ]);
    });

    expect(
      container.querySelectorAll('.portfolio-amount-expand'),
    ).toHaveLength(1);
  });

  it('shows Hive Engine token icons in the portfolio and swap selector', async () => {
    const decIconUrl =
      'https://images.hive.blog/0x0/https://example.com/dec.png';
    jest
      .spyOn(AccountUtils, 'getExtendedAccounts')
      .mockResolvedValue([{ name: 'alice' } as never]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [
        {
          account: 'alice',
          balances: [{ symbol: 'DEC', balance: 10, usdValue: 1 }],
          totalHive: 0,
          totalUSD: 1,
        },
      ],
      orderedTokenList: ['DEC'],
      tokens: [
        {
          symbol: 'DEC',
          precision: 3,
          metadata: { icon: decIconUrl },
        } as never,
      ],
    });
    (TokensUtils.getAllTokens as jest.Mock).mockResolvedValue([
      {
        symbol: 'DEC',
        precision: 3,
        metadata: { icon: decIconUrl },
      },
    ]);
    const decAsset = {
      assetId: 'hive_engine:DEC',
      ecosystem: 'hive_engine',
      symbol: 'DEC',
      name: 'Dark Energy Crystals',
      chainId: 'hive_engine',
      address: null,
      decimals: 3,
      isNative: false,
      familyId: 'dec',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 0,
    };
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [decAsset],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'swap',
      direction: null,
      sourceAssetId: null,
      assets: [decAsset],
      chains: {},
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector(
          '.portfolio-table-row .portfolio-token-identity .currency-icon',
        )?.getAttribute('src'),
      ).toBe(decIconUrl);
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(
        container.querySelector(
          '#portfolio-from-asset .portfolio-token-identity .currency-icon',
        )?.getAttribute('src'),
      ).toBe(decIconUrl);
    });
  });

  it('preloads swap available assets during portfolio initialization', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    await waitFor(() => {
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
        mode: 'swap',
      });
    });

    expect(container.querySelector('.portfolio-flow')).toBeNull();
  });

  it('renders direct swap from cached catalog while refresh remains pending', async () => {
    window.history.replaceState(null, '', '/#swap');
    (
      PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog as jest.Mock
    ).mockResolvedValue({
      response: {
        mode: 'swap',
        direction: null,
        sourceAssetId: null,
        assets: swapAssetsFixture,
        chains: {},
      },
      fetchedAt: Date.now() - 2 * 60 * 60 * 1000,
    });
    (
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached as jest.Mock
    ).mockImplementation(() => new Promise(() => undefined));

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('.portfolio-flow')).not.toBeNull();
      expect(container.querySelector('#portfolio-from-asset')).not.toBeNull();
    });
    expect(PortfolioApiUtils.listAssets).not.toHaveBeenCalled();
    expect(PortfolioApiUtils.listHistory).not.toHaveBeenCalled();
  });

  it('reuses cached portfolio balances when opening swap', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
      expect(container.querySelector('.portfolio-flow')).not.toBeNull();
    });
  });

  it('shows account selector in the swap flow', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');
    expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();

    clickPortfolioNav(container, 'portfolio');
    expect(container.querySelector('#portfolio-flow-account')).toBeNull();
  });

  it('refreshes portfolio data when the portfolio refresh button is clicked', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccounts')
      .mockResolvedValue([{ name: 'alice' } as never]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [
        {
          account: 'alice',
          balances: [],
          totalHive: 0,
          totalUSD: 0,
        },
      ],
      orderedTokenList: [],
      tokens: [],
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(PortfolioApiUtils.listAssets).toHaveBeenCalled(),
    );

    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [],
      orderedTokenList: [],
      tokens: [],
    });
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockClear();
    (PortfolioApiUtils.listAssets as jest.Mock).mockClear();
    (PortfolioApiUtils.listHistory as jest.Mock).mockClear();

    const refreshButton = container.querySelector('.portfolio-refresh-button');
    expect(refreshButton).not.toBeNull();
    fireEvent.click(refreshButton!);

    await waitFor(() => {
      expect(PortfolioApiUtils.listAssets).toHaveBeenCalledTimes(1);
      expect(PortfolioApiUtils.listHistory).not.toHaveBeenCalled();
      expect(PortfolioUtils.getPortfolio).toHaveBeenCalled();
    });
  });

  it('requests history with all wallet addresses as filters', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never, { name: 'bob' } as never]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xAbC' },
          } as never,
          {
            id: 2,
            wallet: { address: '0xDef' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('#portfolio-account')).not.toBeNull();
    });

    clickPortfolioNav(container, 'history');

    await waitFor(() => {
      expect(PortfolioApiUtils.listHistory).toHaveBeenCalledWith(1, {
        addresses: ['alice', 'bob', '0xAbC', '0xDef'],
      });
    });
  });

  it('renders Hive and Hive Engine token logos in history without API assets', async () => {
    const decIconUrl =
      'https://images.hive.blog/0x0/https://example.com/dec.png';
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'swap',
      direction: null,
      sourceAssetId: null,
      assets: [],
      chains: {},
    });
    (TokensUtils.getAllTokens as jest.Mock).mockResolvedValue([
      {
        symbol: 'DEC',
        metadata: { icon: decIconUrl },
      },
    ]);
    (PortfolioApiUtils.listHistory as jest.Mock).mockResolvedValue([
      {
        id: 'hive-history-without-api-assets',
        status: 'completed',
        displayStatus: 'completed',
        mode: 'swap',
        provider: 'lifi',
        providerReferenceId: null,
        fromAssetId: 'hive-hive',
        toAssetId: 'hive_engine:DEC',
        fromAmount: '1',
        toAmount: '0.99',
        receivedAmount: '0.99',
        fromAddress: '0xabc',
        toAddress: '0xabc',
        redirectUrl: null,
        transaction: null,
        fiatCurrency: null,
        paymentMethod: null,
        submittedAt: '2026-08-17T10:00:00.000Z',
        updatedAt: '2026-08-17T10:01:00.000Z',
        executionType: 'redirect',
        txHash: null,
        providerName: 'LI.FI',
        providerLogoUrl: null,
        providerStatus: 'completed',
        lastProviderStatusRefreshAt: null,
        failureCode: null,
        failureAction: null,
        providerStatusDetail: null,
        providerStatusUrl: null,
        supportUrl: null,
      },
    ]);
    window.history.replaceState(null, '', '/#history');

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector(
          '.portfolio-history-card .portfolio-token-identity .svg-icon.currency-icon',
        ),
      ).not.toBeNull();
      expect(
        container
          .querySelector(
            '.portfolio-history-card .portfolio-token-identity img.currency-icon',
          )
          ?.getAttribute('src'),
      ).toBe(decIconUrl);
    });
  });

  it('reloads only portfolio balances when changing account in the swap flow', async () => {
    const secondEthToken = {
      ...ethToken,
      formattedBalance: '2',
      balance: 2n,
      balanceInteger: 2,
      shortFormattedBalance: '2',
    };

    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, walletAddress, options) => {
      const token = walletAddress === '0xdef' ? secondEthToken : ethToken;
      options?.onChainReady?.(ethereumChain, [token]);
      options?.onChainFinished?.(ethereumChain);
      options?.onChainReady?.(polygonChain, [maticToken]);
      options?.onChainFinished?.(polygonChain);
      return [token, maticToken];
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
          {
            id: 2,
            wallet: { address: '0xdef' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(PortfolioApiUtils.listAssets).toHaveBeenCalledTimes(1);
      expect(PortfolioApiUtils.listHistory).not.toHaveBeenCalled();
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();
    });

    (PortfolioApiUtils.listAssets as jest.Mock).mockClear();
    (PortfolioApiUtils.listHistory as jest.Mock).mockClear();
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockClear();

    fireEvent.click(
      container.querySelector('#portfolio-flow-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const options = container.querySelectorAll(
        '#portfolio-flow-account-listbox [role="option"]',
      );
      expect(options.length).toBe(2);
    });

    fireEvent.click(
      container.querySelectorAll(
        '#portfolio-flow-account-listbox [role="option"]',
      )[1] as HTMLButtonElement,
    );

    await waitFor(() => {
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledWith(
        [ethereumChain, polygonChain],
        '0xdef',
        expect.objectContaining({
          onChainReady: expect.any(Function),
        }),
      );
    });

    expect(PortfolioApiUtils.listAssets).not.toHaveBeenCalled();
    expect(PortfolioApiUtils.listHistory).not.toHaveBeenCalled();
  });

  it('excludes testnet tokens from swap from options', () => {
    const options = PortfolioFlowUtils.buildPortfolioFromSelectOptions([
      {
        key: '0x1:ETH:native',
        symbol: 'ETH',
        network: 'Ethereum',
        balance: '1',
        chainId: '0x1',
        isTestnet: false,
      },
      {
        key: '0xaa36a7:ETH:native',
        symbol: 'ETH',
        network: 'Sepolia',
        balance: '5',
        chainId: '0xaa36a7',
        isTestnet: true,
      },
    ]);

    expect(options).toHaveLength(1);
    expect(options[0].label).toBe('ETH - Ethereum (1)');
  });

  it('excludes zero-balance tokens from swap from options and shows an empty-wallet message', async () => {
    const zeroEthToken = {
      ...ethToken,
      formattedBalance: '0',
      balance: 0n,
      balanceInteger: 0,
      shortFormattedBalance: '0',
    };

    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [zeroEthToken]);
      options?.onChainFinished?.(ethereumChain);
      options?.onChainReady?.(polygonChain, []);
      options?.onChainFinished?.(polygonChain);
      return [zeroEthToken];
    });

    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [
        {
          assetId: 'evm:native:ethereum',
          ecosystem: 'evm',
          symbol: 'ETH',
          name: 'Ethereum',
          chainId: '0x1',
          logoUrl: null,
        },
      ],
      chains: {},
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(
        container.querySelector('#portfolio-from-asset-error'),
      ).not.toBeNull();
      expect(container.textContent).toContain(
        "This wallet doesn't have any token.",
      );
      expect(container.textContent).not.toContain('ETH - Ethereum (0)');
    });
  });

  it('shows a partial load error and clears the bottom spinner when a chain fails', async () => {
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      options?.onChainError?.(polygonChain, new Error('polygon unavailable'));
      options?.onChainFinished?.(polygonChain);
      return [ethToken];
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
      expect(container.querySelector('.portfolio-loading-more')).toBeNull();
      expect(
        container.querySelector('.portfolio-status')?.textContent,
      ).toContain('Polygon');
    });
  });

  it('does not auto-request swap quotes when from asset id cannot be resolved', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [
        {
          assetId: 'evm:token:hmi:0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e',
          ecosystem: 'evm',
          symbol: 'HMI',
          name: 'HMI',
          chainId: '0x1',
          logoUrl: null,
        },
      ],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'swap',
      direction: null,
      sourceAssetId: null,
      assets: [],
      chains: {},
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.textContent).not.toContain('ETH - Ethereum (1)');
    });

    const amountInput = container.querySelector(
      '.portfolio-flow input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.1' } });

    await new Promise((resolve) => setTimeout(resolve, 900));

    expect(PortfolioApiUtils.getQuotes).not.toHaveBeenCalled();
  });

  it('includes native ETH in swap from options when swap-available assets provide canonical metadata', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [
        {
          assetId:
            'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          ecosystem: 'evm',
          symbol: 'USDC',
          name: 'USD Coin',
          chainId: 'ethereum',
          logoUrl: null,
        },
      ],
      chains: {},
    });
    mockPortfolioListAvailableAssets();

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-from-asset')).not.toBeNull();
      expect(container.textContent).toContain('ETH');
      expect(container.textContent).toContain('Ethereum');
      expect(container.textContent).not.toContain(
        "This wallet doesn't have any token.",
      );
    });
  });

  it('includes mainnet ETH in swap from options when another ETH chain is listed first', async () => {
    const optimismChain: EvmChain = {
      name: 'Optimism',
      type: ChainType.EVM,
      logo: 'optimism.svg',
      chainId: '0xa',
      rpcs: [{ url: 'https://optimism.rpc' }],
      mainToken: 'ETH',
      nativeCoinId: 'ethereum',
      defaultTransactionType: EvmTransactionType.EIP_1559,
    };

    jest
      .spyOn(ChainUtils, 'getAllSetupChainsForType')
      .mockResolvedValue([optimismChain, ethereumChain]);
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      return [ethToken];
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [
        {
          assetId: 'evm:native:ethereum',
          ecosystem: 'evm',
          symbol: 'ETH',
          name: 'ETH',
          chainId: 'ethereum',
          isNative: true,
          familyId: 'eth',
          logoUrl: null,
          priceUsd: 0,
          rankScore: 0,
        },
      ],
      chains: {},
    });
    mockPortfolioListAvailableAssets();

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-from-asset')).not.toBeNull();
      expect(container.textContent).toContain('ETH');
      expect(container.textContent).toContain('Ethereum');
      expect(container.textContent).not.toContain(
        "This wallet doesn't have any token.",
      );
    });
  });

  it('sorts swap from assets by portfolio display order', async () => {
    jest
      .spyOn(ChainUtils, 'getAllSetupChainsForType')
      .mockResolvedValue([polygonChain, ethereumChain]);
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(polygonChain, [maticToken]);
      options?.onChainFinished?.(polygonChain);
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      return [maticToken, ethToken];
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: swapAssetsFixture,
      chains: {},
    });
    const buildFromAssetOptionsSpy = jest.spyOn(
      PortfolioFlowUtils,
      'buildPortfolioFromSelectOptions',
    );

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
      expect(container.textContent).toContain('MATIC');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-from-asset')).not.toBeNull();
    });

    const swapFromRowsCall = buildFromAssetOptionsSpy.mock.calls.find(
      ([rows]) => {
        const symbols = rows.map((row) => row.symbol);
        return symbols.includes('ETH') && symbols.includes('MATIC');
      },
    );

    expect(swapFromRowsCall?.[0].map((row) => row.symbol)).toEqual([
      'ETH',
      'MATIC',
    ]);

    buildFromAssetOptionsSpy.mockRestore();
  });

  it('auto-fetches swap quotes once the form is complete without a get quotes button', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: swapAssetsFixture,
      chains: {},
    });

    const { container, queryByText } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-from-asset')).not.toBeNull();
    });

    await waitFor(() => {
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
        mode: 'swap',
      });
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('Get quotes')).toBeNull();
    expect(PortfolioApiUtils.getQuotes).not.toHaveBeenCalled();

    const amountInput = container.querySelector(
      '.portfolio-flow input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.1' } });

    await waitFor(
      () => {
        expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );

    expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'swap',
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:native:polygon',
        fromAddress: '0xabc',
      }),
      expect.any(AbortSignal),
    );
    expect(queryByText('Get quotes')).toBeNull();
  });

  const renderSwapPortfolio = async (options?: { amount?: string }) => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: swapAssetsFixture,
      chains: {},
    });
    mockPortfolioListAvailableAssets();

    const view = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(view.container.textContent).toContain('ETH');
    });

    clickPortfolioNav(view.container, 'swap');

    await waitFor(() => {
      expect(
        view.container.querySelector('#portfolio-from-asset'),
      ).not.toBeNull();
    });

    await waitFor(() => {
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
        mode: 'swap',
      });
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledTimes(1);
    });

    const amountInput = view.container.querySelector(
      '.portfolio-flow .portfolio-amount-field input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, {
      target: { value: options?.amount ?? '0.1' },
    });

    return view;
  };

  it('does not request swap quotes when amount is zero', async () => {
    await renderSwapPortfolio({ amount: '0' });

    await new Promise((resolve) => setTimeout(resolve, 900));

    expect(PortfolioApiUtils.getQuotes).not.toHaveBeenCalled();
  });

  it('sets the swap amount to the selected source balance', async () => {
    const { container, getByTestId } = await renderSwapPortfolio({
      amount: '0',
    });

    fireEvent.click(getByTestId('set-to-max-button'));

    expect(
      (
        container.querySelector(
          '.portfolio-flow .portfolio-amount-field input[type="number"]',
        ) as HTMLInputElement
      ).value,
    ).toBe('1');
  });

  it('does not request swap quotes when amount exceeds from balance', async () => {
    const originalSkipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
    process.env.PORTFOLIO_SKIP_BALANCE_CHECK = 'false';

    try {
      await renderSwapPortfolio({ amount: '999' });

      await new Promise((resolve) => setTimeout(resolve, 900));

      expect(PortfolioApiUtils.getQuotes).not.toHaveBeenCalled();
    } finally {
      if (originalSkipBalanceCheck === undefined) {
        delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
      } else {
        process.env.PORTFOLIO_SKIP_BALANCE_CHECK = originalSkipBalanceCheck;
      }
    }
  });

  it('requests swap quotes above balance when PORTFOLIO_SKIP_BALANCE_CHECK is true', async () => {
    const originalSkipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
    process.env.PORTFOLIO_SKIP_BALANCE_CHECK = 'true';

    try {
      await renderSwapPortfolio({ amount: '999' });

      await waitFor(
        () => {
          expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
        },
        { timeout: 2000 },
      );
    } finally {
      if (originalSkipBalanceCheck === undefined) {
        delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
      } else {
        process.env.PORTFOLIO_SKIP_BALANCE_CHECK = originalSkipBalanceCheck;
      }
    }
  });

  it('shows a loading spinner in the swap quote input while awaiting the first quote', async () => {
    let resolveQuotes!: (value: unknown) => void;
    const quotesPromise = new Promise((resolve) => {
      resolveQuotes = resolve;
    });
    (PortfolioApiUtils.getQuotes as jest.Mock).mockReturnValue(quotesPromise);
    (
      PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
    ).mockReturnValue('q1');

    const { getByTestId, queryByTestId } = await renderSwapPortfolio();

    await waitFor(() => {
      expect(getByTestId('portfolio-swap-quote-loading')).toBeTruthy();
    });

    resolveQuotes({
      quotes: [
        {
          quoteId: 'q1',
          provider: 'lifi',
          providerName: 'LiFi',
          providerLogoUrl: 'https://example.com/lifi.png',
          estimatedToAmount: '100',
          executionType: 'redirect',
        },
      ],
      request: { mode: 'swap' },
    });

    await waitFor(() => {
      expect(queryByTestId('portfolio-swap-quote-loading')).toBeNull();
    });
  });

  it('clears the loaded swap quote when amount changes', async () => {
    (PortfolioApiUtils.getQuotes as jest.Mock).mockResolvedValue({
      quotes: [
        {
          quoteId: 'q1',
          provider: 'lifi',
          providerName: 'LiFi',
          providerLogoUrl: 'https://example.com/lifi.png',
          estimatedToAmount: '100',
          executionType: 'redirect',
        },
      ],
      request: { mode: 'swap' },
    });
    (
      PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
    ).mockReturnValue('q1');

    const { container } = await renderSwapPortfolio();

    await waitFor(() => {
      const quoteInput = container.querySelector(
        '[data-testid="portfolio-swap-quote-value"]',
      );
      expect(quoteInput?.textContent).toBe('100');
    });

    const amountInput = container.querySelector(
      '.portfolio-flow .portfolio-amount-field input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.2' } });

    await waitFor(() => {
      const quoteInput = container.querySelector(
        '[data-testid="portfolio-swap-quote-value"]',
      );
      expect(quoteInput?.textContent).toBe('');
      expect(
        container.querySelector('[data-testid="portfolio-swap-quote-loading"]'),
      ).not.toBeNull();
    });
  });

  it('cancels an in-flight swap quote request when amount changes', async () => {
    const signals: AbortSignal[] = [];
    let resolveSecondQuote!: (value: unknown) => void;

    (PortfolioApiUtils.getQuotes as jest.Mock).mockImplementation(
      (_body: unknown, signal?: AbortSignal) => {
        if (signal) {
          signals.push(signal);
        }

        if (signals.length === 1) {
          return new Promise((_resolve, reject) => {
            const onAbort = () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            };
            if (signal?.aborted) {
              onAbort();
              return;
            }
            signal?.addEventListener('abort', onAbort, { once: true });
          });
        }

        return new Promise((resolve) => {
          resolveSecondQuote = resolve;
        });
      },
    );
    (
      PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
    ).mockReturnValue('q2');

    const { container } = await renderSwapPortfolio();

    await waitFor(
      () => {
        expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );

    const amountInput = container.querySelector(
      '.portfolio-flow .portfolio-amount-field input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.2' } });

    await waitFor(() => {
      expect(signals[0]?.aborted).toBe(true);
    });

    await waitFor(
      () => {
        expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 },
    );

    resolveSecondQuote({
      quotes: [
        {
          quoteId: 'q2',
          provider: 'lifi',
          providerName: 'LiFi',
          providerLogoUrl: 'https://example.com/lifi.png',
          estimatedToAmount: '200',
          executionType: 'redirect',
        },
      ],
      request: { mode: 'swap' },
    });

    await waitFor(() => {
      const quoteInput = container.querySelector(
        '[data-testid="portfolio-swap-quote-value"]',
      );
      expect(quoteInput?.textContent).toBe('200');
    });
    expect(container.textContent).not.toContain('portfolio_load_error');
  });

  it('expands all swap quotes when clicking the quote input', async () => {
    (PortfolioApiUtils.getQuotes as jest.Mock).mockResolvedValue({
      quotes: [
        {
          quoteId: 'q1',
          provider: 'lifi',
          providerName: 'LiFi',
          providerLogoUrl: 'https://example.com/lifi.png',
          estimatedToAmount: '100',
          executionType: 'redirect',
        },
        {
          quoteId: 'q2',
          provider: 'changelly',
          providerName: 'Changelly',
          providerLogoUrl: 'https://example.com/changelly.png',
          estimatedToAmount: '99',
          executionType: 'redirect',
        },
      ],
      request: { mode: 'swap' },
    });
    (
      PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
    ).mockReturnValue('q1');

    const { container, getByTestId } = await renderSwapPortfolio();

    await waitFor(() => {
      const quoteInput = container.querySelector(
        '[data-testid="portfolio-swap-quote-value"]',
      );
      expect(quoteInput?.textContent).toBe('100');
    });

    expect(container.querySelector('.portfolio-quotes-panel')).toBeNull();

    fireEvent.click(getByTestId('portfolio-swap-quote-input'));

    await waitFor(() => {
      expect(container.querySelectorAll('.portfolio-quote-card')).toHaveLength(
        2,
      );
    });
  });

  it('expands the quotes list when only one provider is available', async () => {
    (PortfolioApiUtils.getQuotes as jest.Mock).mockResolvedValue({
      quotes: [
        {
          quoteId: 'q1',
          provider: 'lifi',
          providerName: 'LiFi',
          providerLogoUrl: 'https://example.com/lifi.png',
          estimatedToAmount: '100',
          executionType: 'redirect',
        },
      ],
      request: { mode: 'swap' },
    });
    (
      PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
    ).mockReturnValue('q1');

    const { container, getByTestId } = await renderSwapPortfolio();

    await waitFor(() => {
      expect(
        getByTestId('portfolio-swap-quote-input').getAttribute('role'),
      ).toBe('button');
    });

    fireEvent.click(getByTestId('portfolio-swap-quote-input'));

    await waitFor(() => {
      expect(container.querySelectorAll('.portfolio-quote-card')).toHaveLength(
        1,
      );
    });
  });

  it('keeps the all-quotes panel open when refreshing swap quotes', async () => {
    (PortfolioApiUtils.getQuotes as jest.Mock).mockResolvedValue({
      quotes: [
        {
          quoteId: 'q1',
          provider: 'lifi',
          providerName: 'LiFi',
          providerLogoUrl: 'https://example.com/lifi.png',
          estimatedToAmount: '100',
          executionType: 'redirect',
        },
        {
          quoteId: 'q2',
          provider: 'changelly',
          providerName: 'Changelly',
          providerLogoUrl: 'https://example.com/changelly.png',
          estimatedToAmount: '99',
          executionType: 'redirect',
        },
      ],
      request: { mode: 'swap' },
    });
    (
      PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
    ).mockReturnValue('q1');

    const { container, getByTestId } = await renderSwapPortfolio();

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(getByTestId('portfolio-swap-quote-input'));

    await waitFor(() => {
      expect(container.querySelector('.portfolio-quotes-panel')).not.toBeNull();
    });

    fireEvent.click(
      container.querySelector(
        '.portfolio-swap-quote-input__refresh',
      ) as HTMLButtonElement,
    );

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(2);
      expect(container.querySelectorAll('.portfolio-quote-card')).toHaveLength(
        2,
      );
    });
  });

  it('stops auto-refreshing swap quotes when no quote is available', async () => {
    jest.useFakeTimers();
    (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
      new PortfolioApiError({
        code: 'NO_QUOTE_AVAILABLE',
        message: 'No quote available.',
      }),
    );

    await renderSwapPortfolio();

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="portfolio-swap-quote-loading"]'),
      ).toBeNull();
    });

    jest.advanceTimersByTime(35_000);

    expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('keeps auto-refreshing swap quotes after transient quote errors', async () => {
    jest.useFakeTimers();
    (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    await renderSwapPortfolio();

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(30_000);

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });

  it('stops auto-refreshing swap quotes when amount is out of range', async () => {
    jest.useFakeTimers();
    (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
      new PortfolioApiError({
        code: 'SWAP_AMOUNT_OUT_OF_RANGE',
        message: 'Amount out of range.',
      }),
    );

    await renderSwapPortfolio();

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(35_000);

    expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('fills the amount field when clicking the minimum amount error and balance covers it', async () => {
    const originalSkipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
    delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;

    try {
      (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'Amount below minimum.',
          details: {
            mergedRange: {
              min: '0.5',
              max: null,
            },
          },
        }),
      );

      const { container, getByTestId } = await renderSwapPortfolio({
        amount: '0.1',
      });

      await waitFor(() => {
        expect(getByTestId('portfolio-fill-minimum-amount')).toBeTruthy();
      });

      fireEvent.click(getByTestId('portfolio-fill-minimum-amount'));

      expect(
        (
          container.querySelector(
            '.portfolio-flow .portfolio-amount-field input[type="number"]',
          ) as HTMLInputElement
        ).value,
      ).toBe('0.5');
    } finally {
      if (originalSkipBalanceCheck === undefined) {
        delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
      } else {
        process.env.PORTFOLIO_SKIP_BALANCE_CHECK = originalSkipBalanceCheck;
      }
    }
  });

  it('fills the amount field when clicking a min-max range error and balance covers the min', async () => {
    const originalSkipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
    delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;

    try {
      (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'Amount out of range.',
          details: {
            mergedRange: {
              min: '0.5',
              max: '100',
            },
          },
        }),
      );

      const { container, getByTestId } = await renderSwapPortfolio({
        amount: '0.1',
      });

      await waitFor(() => {
        expect(getByTestId('portfolio-fill-minimum-amount')).toBeTruthy();
      });

      fireEvent.click(getByTestId('portfolio-fill-minimum-amount'));

      expect(
        (
          container.querySelector(
            '.portfolio-flow .portfolio-amount-field input[type="number"]',
          ) as HTMLInputElement
        ).value,
      ).toBe('0.5');
    } finally {
      if (originalSkipBalanceCheck === undefined) {
        delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
      } else {
        process.env.PORTFOLIO_SKIP_BALANCE_CHECK = originalSkipBalanceCheck;
      }
    }
  });

  it('does not make the minimum amount error clickable when balance is too low', async () => {
    const originalSkipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
    delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;

    try {
      (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'Amount below minimum.',
          details: {
            mergedRange: {
              min: '2',
              max: null,
            },
          },
        }),
      );

      // Allow requesting a quote above balance only long enough to land the
      // amount-below-min error would need the amount to be under balance; use 0.1
      // with min 2 so quote is requested (0.1 <= balance 1) then min is unfillable.
      const { queryByTestId } = await renderSwapPortfolio({ amount: '0.1' });

      await waitFor(() => {
        expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(
          document.body.textContent?.includes('portfolio_amount_below_minimum') ||
            document.body.textContent?.includes('Minimum amount is'),
        ).toBe(true);
      });

      expect(queryByTestId('portfolio-fill-minimum-amount')).toBeNull();
    } finally {
      if (originalSkipBalanceCheck === undefined) {
        delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
      } else {
        process.env.PORTFOLIO_SKIP_BALANCE_CHECK = originalSkipBalanceCheck;
      }
    }
  });

  it('fills the amount from quote amountHints nextUnlock without replacing quotes', async () => {
    const originalSkipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
    delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;

    try {
      (PortfolioApiUtils.getQuotes as jest.Mock).mockResolvedValue({
        quotes: [
          {
            quoteId: 'q1',
            provider: 'lifi',
            providerName: 'LI.FI',
            providerLogoUrl: 'https://example.com/lifi.png',
            estimatedToAmount: '220',
            executionType: 'redirect',
          },
        ],
        request: { mode: 'swap' },
        amountHints: {
          requestedAmount: '0.09',
          blocked: [
            {
              provider: { id: 'simpleswap', name: 'SimpleSwap', logo: null },
              reason: 'below_min',
              min: '0.1',
              max: '10',
              suggestedAmount: '0.1',
              paymentMethod: null,
            },
          ],
          nextUnlock: {
            amount: '0.1',
            direction: 'increase',
            additionalProviderCount: 1,
            providers: ['simpleswap'],
          },
        },
      });
      (
        PortfolioApiUtils.resolveExecutablePortfolioQuoteId as jest.Mock
      ).mockReturnValue('q1');

      const { container, getByTestId } = await renderSwapPortfolio({
        amount: '0.09',
      });

      await waitFor(() => {
        expect(getByTestId('portfolio-fill-amount-hint')).toBeTruthy();
      });

      expect(
        getByTestId('portfolio-fill-amount-hint').textContent,
      ).toMatch(/Increase to 0\.1 to unlock SimpleSwap|portfolio_amount_hint_increase_provider/);

      fireEvent.click(getByTestId('portfolio-fill-amount-hint'));

      expect(
        (
          container.querySelector(
            '.portfolio-flow .portfolio-amount-field input[type="number"]',
          ) as HTMLInputElement
        ).value,
      ).toBe('0.1');
    } finally {
      if (originalSkipBalanceCheck === undefined) {
        delete process.env.PORTFOLIO_SKIP_BALANCE_CHECK;
      } else {
        process.env.PORTFOLIO_SKIP_BALANCE_CHECK = originalSkipBalanceCheck;
      }
    }
  });

  it('shows a retry button in the swap quote input when no quote is available', async () => {
    (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
      new PortfolioApiError({
        code: 'NO_QUOTE_AVAILABLE',
        message: 'No quote available.',
      }),
    );

    const { container } = await renderSwapPortfolio();

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        container.querySelector(
          '[data-testid="portfolio-swap-quote-retry-label"]',
        ),
      ).not.toBeNull();
      const quoteValue = container.querySelector(
        '[data-testid="portfolio-swap-quote-value"]',
      );
      expect(quoteValue?.textContent).toMatch(
        /No quote available|portfolio_no_quote_available_short/,
      );
      expect(
        quoteValue?.classList.contains(
          'portfolio-swap-quote-input__value--error-text',
        ),
      ).toBe(true);
      expect(container.querySelector('.portfolio-status')).toBeNull();
      expect(
        container.querySelector('.portfolio-flow-pair-row'),
      ).not.toBeNull();
      expect(
        container.querySelector('.portfolio-card-header'),
      ).toBeNull();
    });

    fireEvent.click(
      container.querySelector(
        '.portfolio-swap-quote-input__refresh',
      ) as HTMLButtonElement,
    );

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(2);
    });
  });

  it('shows a country unavailability status when all providers are geo-banned', async () => {
    (PortfolioApiUtils.getQuotes as jest.Mock).mockRejectedValue(
      new PortfolioApiError({
        code: 'NO_SERVICES_IN_COUNTRY',
        message: 'No services are available in your country',
      }),
    );

    const { container } = await renderSwapPortfolio();

    await waitFor(() => {
      expect(PortfolioApiUtils.getQuotes).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        container.querySelector(
          '[data-testid="portfolio-swap-quote-retry-label"]',
        ),
      ).not.toBeNull();
      expect(container.querySelector('.portfolio-status')?.textContent).toMatch(
        /No services are available in your country|portfolio_no_services_in_country/,
      );
    });
  });

  it('renders swap to assets using metadata from listAvailableAssets when they are not in listAssets', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [swapAssetsFixture[0]],
      chains: {},
    });

    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockImplementation(
      async (params: {
        mode: string;
        direction: string;
        sourceAssetId?: string;
      }) => {
        if (params.mode === 'swap' && !params.direction) {
          return {
            mode: 'swap',
            direction: null,
            sourceAssetId: params.sourceAssetId ?? null,
            assets: [
              swapAssetsFixture[0],
              {
                assetId: 'evm:native:kaia',
                ecosystem: 'evm',
                symbol: 'KAIA',
                name: 'Kaia',
                chainId: 'kaia',
                address: null,
                decimals: 18,
                isNative: true,
                familyId: 'kaia',
                logoUrl: null,
                priceUsd: 0,
                rankScore: 0,
              },
            ],
            chains: {
              kaia: {
                id: 'kaia',
                name: 'Kaia',
                logoUrl: 'https://example.com/kaia.svg',
                numericChainId: 8217,
                rankScore: 0,
              },
            },
          };
        }

        return {
          mode: params.mode,
          direction: params.direction,
          sourceAssetId: params.sourceAssetId ?? null,
          assets: [],
          chains: {},
        };
      },
    );

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
    });

    fireEvent.click(
      container.querySelector('#portfolio-to-asset') as HTMLButtonElement,
    );

    await waitFor(() => {
      const options = container.querySelectorAll(
        '#portfolio-to-asset-listbox [role="option"]',
      );
      const optionTexts = [...options].map(
        (option) => option.textContent ?? '',
      );
      expect(optionTexts.some((text) => text.includes('KAIA'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('Kaia'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('evm:native:kaia'))).toBe(
        false,
      );
    });
  });

  it('filters swap to assets using from-asset eligibility rules', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: swapAssetsFixture,
      chains: {},
    });

    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockImplementation(
      async (params: {
        mode: string;
        direction: string;
        sourceAssetId?: string;
      }) => {
        if (params.mode === 'swap' && !params.direction) {
          return {
            mode: 'swap',
            direction: null,
            sourceAssetId: params.sourceAssetId ?? null,
            assets: [
              ...swapAssetsFixture,
              {
                assetId: 'hive:native:hive',
                ecosystem: 'hive',
                symbol: 'HIVE',
                name: 'Hive',
                chainId: 'hive',
                address: null,
                decimals: 3,
                isNative: true,
                familyId: 'hive',
                logoUrl: null,
                priceUsd: 0,
                rankScore: 0,
              },
              {
                assetId: 'hive:native:hbd',
                ecosystem: 'hive',
                symbol: 'HBD',
                name: 'Hive Backed Dollar',
                chainId: 'hive',
                address: null,
                decimals: 3,
                isNative: true,
                familyId: 'hbd',
                logoUrl: null,
                priceUsd: 0,
                rankScore: 0,
              },
            ],
            chains: {},
          };
        }

        return {
          mode: params.mode,
          direction: params.direction,
          sourceAssetId: params.sourceAssetId ?? null,
          assets: [],
          chains: {},
        };
      },
    );

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
    });

    fireEvent.click(
      container.querySelector('#portfolio-to-asset') as HTMLButtonElement,
    );

    await waitFor(() => {
      const options = container.querySelectorAll(
        '#portfolio-to-asset-listbox [role="option"]',
      );
      const optionTexts = [...options].map(
        (option) => option.textContent ?? '',
      );
      expect(optionTexts.some((text) => text.includes('MATIC'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('HIVE'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('HBD'))).toBe(false);
    });
  });

  it('excludes hidden evm accounts from the portfolio account dropdown', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xvisible' },
            hide: false,
          } as never,
          {
            id: 2,
            wallet: { address: '0xhidden' },
            hide: true,
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xvisible"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('#portfolio-account')).not.toBeNull();
    });

    fireEvent.click(
      container.querySelector('#portfolio-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const options = container.querySelectorAll(
        '#portfolio-account-listbox [role="option"]',
      );
      const optionTexts = [...options].map(
        (option) => option.textContent ?? '',
      );
      expect(optionTexts.some((text) => text.includes('0xvisible'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('0xhidden'))).toBe(false);
    });
  });

  it('shows fallback names for every unnamed EVM account in flow dropdowns', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 0,
            seedId: 1,
            nickname: 'Main account',
            wallet: { address: '0xabc' },
          } as never,
          {
            id: 1,
            seedId: 1,
            wallet: { address: '0xdef' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();
    });

    fireEvent.click(
      container.querySelector('#portfolio-flow-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const optionTexts = [
        ...container.querySelectorAll(
          '#portfolio-flow-account-listbox [role="option"]',
        ),
      ].map((option) => option.textContent ?? '');

      expect(optionTexts).toHaveLength(2);
      expect(optionTexts[0]).toContain('Main account');
      expect(optionTexts[1]).toContain('Account 2');
      expect(optionTexts[1]).toContain('0xdef');
    });
  });

  it('orders portfolio accounts using the account selector display order', async () => {
    const hiveAlice = { name: 'alice' } as never;
    const evmAccount = {
      id: 1,
      seedId: 1,
      wallet: { address: '0xabc' },
      hide: false,
    } as never;

    jest
      .spyOn(AccountSelectorOrderUtils, 'loadOrderedListItems')
      .mockResolvedValue({
        displayOrder: [
          { type: 'evm', seedId: 1, accountId: 1 },
          { type: 'hive', name: 'alice' },
        ],
        listItems: [
          { type: ChainType.EVM, id: 'evm-0xabc', account: evmAccount },
          { type: ChainType.HIVE, id: 'hive-alice', account: hiveAlice },
        ],
      });

    const { container } = render(
      <Portfolio
        hiveAccounts={[hiveAlice]}
        evmAccounts={[evmAccount]}
        mk="test-mk"
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(AccountSelectorOrderUtils.loadOrderedListItems).toHaveBeenCalled();
    });

    fireEvent.click(
      container.querySelector('#portfolio-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const options = container.querySelectorAll(
        '#portfolio-account-listbox [role="option"]',
      );
      expect(options.length).toBe(2);
      expect(options[0].textContent).toContain('0xabc');
      expect(options[1].textContent).toContain('alice');
    });
  });

  it('loads only the persisted EVM account after bootstrap resolves', async () => {
    const firstAccount = {
      id: 1,
      wallet: { address: '0xabc' },
    } as never;
    const persistedAccount = {
      id: 2,
      wallet: { address: '0xdef' },
    } as never;
    (
      EvmActiveAccountUtils.getSavedActiveAccountWallet as jest.Mock
    ).mockResolvedValue(persistedAccount.wallet);

    render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[firstAccount, persistedAccount]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
    });
    expect(
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
    ).toHaveBeenCalledWith(
      [ethereumChain, polygonChain],
      '0xdef',
      expect.any(Object),
    );
  });

  it('keeps a manual account choice authoritative while ordering resolves', async () => {
    const firstAccount = {
      id: 1,
      seedId: 1,
      wallet: { address: '0xabc' },
    } as never;
    const secondAccount = {
      id: 2,
      seedId: 1,
      wallet: { address: '0xdef' },
    } as never;
    let resolveOrder: ((value: any) => void) | undefined;
    jest
      .spyOn(AccountSelectorOrderUtils, 'loadOrderedListItems')
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveOrder = resolve;
          }),
      );

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[firstAccount, secondAccount]}
        mk="test-mk"
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    fireEvent.click(
      container.querySelector('#portfolio-account') as HTMLButtonElement,
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(
          '#portfolio-account-listbox [role="option"]',
        ),
      ).toHaveLength(2);
    });
    fireEvent.click(
      container.querySelectorAll(
        '#portfolio-account-listbox [role="option"]',
      )[1] as HTMLElement,
    );

    await act(async () => {
      resolveOrder?.({
        displayOrder: [
          { type: 'evm', seedId: 1, accountId: 1 },
          { type: 'evm', seedId: 1, accountId: 2 },
        ],
        listItems: [
          { type: ChainType.EVM, id: 'evm-0xabc', account: firstAccount },
          { type: ChainType.EVM, id: 'evm-0xdef', account: secondAccount },
        ],
      });
    });

    await waitFor(() => {
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
    });
    expect(
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
    ).toHaveBeenCalledWith(
      [ethereumChain, polygonChain],
      '0xdef',
      expect.any(Object),
    );
  });

  it('loads fiat ramp options and available buy assets when opening the buy section', async () => {
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'buy',
      direction: 'to',
      sourceAssetId: null,
      assets: [
        {
          assetId: 'evm:native:ethereum',
          ecosystem: 'evm',
          symbol: 'ETH',
          name: 'Ethereum',
          chainId: 'ethereum',
          address: null,
          decimals: 18,
          isNative: true,
          familyId: 'eth',
          logoUrl: null,
          priceUsd: 0,
          rankScore: 0,
        },
      ],
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('.portfolio-sidebar')).not.toBeNull();
    });

    clickPortfolioNav(container, 'buy');

    await waitFor(() => {
      expect(PortfolioApiUtils.getFiatRampOptions).toHaveBeenCalledWith({
        mode: 'buy',
      });
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
        mode: 'buy',
        direction: 'to',
      });
      expect(container.querySelector('#portfolio-fiat-currency')).not.toBeNull();
    });

    fireEvent.click(
      container.querySelector('#portfolio-fiat-currency') as HTMLButtonElement,
    );

    await waitFor(() => {
      expect(container.textContent).toMatch(/🇺🇸|🇪🇺|🇹🇼/);
      expect(container.textContent).toMatch(/US Dollar|Euro|New Taiwan Dollar/);
      expect(
        container.querySelector('[data-testid="set-to-max-button"]'),
      ).toBeNull();
    });
  });

  it('places the buy account selector after payment method and filters by to-asset type', async () => {
    const hiveAlice = { name: 'alice' } as never;
    const evmAccount = {
      id: 1,
      seedId: 1,
      wallet: { address: '0xabc' },
      hide: false,
    } as never;
    const hiveAsset = {
      assetId: 'hive-hive',
      ecosystem: 'hive',
      symbol: 'HIVE',
      name: 'Hive',
      chainId: 'hive',
      address: null,
      decimals: 3,
      isNative: true,
      familyId: 'hive',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 100,
    };
    const ethAsset = {
      assetId: 'evm:native:ethereum',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ethereum',
      chainId: 'ethereum',
      address: null,
      decimals: 18,
      isNative: true,
      familyId: 'eth',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 90,
    };

    jest
      .spyOn(AccountSelectorOrderUtils, 'loadOrderedListItems')
      .mockResolvedValue({
        displayOrder: [
          { type: 'hive', name: 'alice' },
          { type: 'evm', seedId: 1, accountId: 1 },
        ],
        listItems: [
          { type: ChainType.HIVE, id: 'hive-alice', account: hiveAlice },
          { type: ChainType.EVM, id: 'evm-0xabc', account: evmAccount },
        ],
      });

    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'buy',
      direction: 'to',
      sourceAssetId: null,
      assets: [hiveAsset, ethAsset],
      chains: {},
    });

    const selectBuyToAsset = async (
      container: HTMLElement,
      matcher: (text: string) => boolean,
    ) => {
      fireEvent.click(
        container.querySelector('#portfolio-to-asset') as HTMLButtonElement,
      );
      await waitFor(() => {
        expect(
          container.querySelector('#portfolio-to-asset-listbox'),
        ).not.toBeNull();
      });

      const option = [
        ...container.querySelectorAll(
          '#portfolio-to-asset-listbox [role="option"]',
        ),
      ].find((item) => matcher(item.textContent ?? ''));
      expect(option).toBeTruthy();
      fireEvent.click(option as HTMLButtonElement);
    };

    const { container } = render(
      <Portfolio
        hiveAccounts={[hiveAlice]}
        evmAccounts={[evmAccount]}
        mk="test-mk"
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('.portfolio-sidebar')).not.toBeNull();
    });

    clickPortfolioNav(container, 'buy');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
      expect(container.querySelector('#portfolio-payment-method')).not.toBeNull();
      expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();
    });

    const flow = container.querySelector('.portfolio-flow') as HTMLElement;
    const paymentMethodIndex = flow.innerHTML.indexOf(
      'id="portfolio-payment-method"',
    );
    const accountIndex = flow.innerHTML.indexOf('id="portfolio-flow-account"');
    expect(paymentMethodIndex).toBeGreaterThan(-1);
    expect(accountIndex).toBeGreaterThan(paymentMethodIndex);

    await selectBuyToAsset(container, (text) => text.includes('HIVE'));

    await waitFor(() => {
      const accountButton = container.querySelector(
        '#portfolio-flow-account',
      ) as HTMLButtonElement;
      expect(accountButton.textContent).toContain('alice');
      expect(accountButton.textContent).not.toContain('0xabc');
    });

    fireEvent.click(
      container.querySelector('#portfolio-flow-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const accountOptions = container.querySelectorAll(
        '#portfolio-flow-account-listbox [role="option"]',
      );
      const optionTexts = [...accountOptions].map(
        (option) => option.textContent ?? '',
      );
      expect(optionTexts).toHaveLength(2);
      expect(optionTexts[0]).toContain('alice');
      expect(optionTexts.some((text) => text.includes('Other'))).toBe(true);
    });

    fireEvent.click(
      container.querySelector('#portfolio-flow-account') as HTMLButtonElement,
    );

    await selectBuyToAsset(
      container,
      (text) => text.includes('Ethereum') || /\bETH\b/.test(text),
    );

    await waitFor(() => {
      const accountButton = container.querySelector(
        '#portfolio-flow-account',
      ) as HTMLButtonElement;
      expect(accountButton.textContent).toContain('0xabc');
      expect(accountButton.textContent).not.toContain('alice');
    });

    fireEvent.click(
      container.querySelector('#portfolio-flow-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const accountOptions = container.querySelectorAll(
        '#portfolio-flow-account-listbox [role="option"]',
      );
      const optionTexts = [...accountOptions].map(
        (option) => option.textContent ?? '',
      );
      expect(optionTexts).toHaveLength(2);
      expect(optionTexts[0]).toContain('0xabc');
      expect(optionTexts.some((text) => text.includes('Other'))).toBe(true);
    });

    const otherOption = [
      ...container.querySelectorAll(
        '#portfolio-flow-account-listbox [role="option"]',
      ),
    ].find((option) => (option.textContent ?? '').includes('Other'));
    fireEvent.click(otherOption as HTMLButtonElement);

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="portfolio-recipient-address"]'),
      ).not.toBeNull();
      expect(container.querySelector('#portfolio-recipient-account')).toBeNull();
    });
  });

  it('does not show a redundant recipient field on buy after a cross-ecosystem swap selection', async () => {
    const hiveAlice = { name: 'alice' } as never;
    const evmAccount = {
      id: 1,
      wallet: { address: '0xabc' },
      hide: false,
    } as never;
    const hiveAsset = {
      assetId: 'hive:native:hive',
      ecosystem: 'hive',
      symbol: 'HIVE',
      name: 'Hive',
      chainId: 'hive',
      address: null,
      decimals: 3,
      isNative: true,
      familyId: 'hive',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 100,
    };
    const ethAsset = {
      assetId: 'evm:native:ethereum',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ethereum',
      chainId: 'ethereum',
      address: null,
      decimals: 18,
      isNative: true,
      familyId: 'eth',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 90,
    };

    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      return [ethToken];
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [swapAssetsFixture[0], hiveAsset],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockImplementation(
      async (params: {
        mode: string;
        direction?: string;
        sourceAssetId?: string;
      }) => {
        if (params.mode === 'swap') {
          return {
            mode: 'swap',
            direction: params.direction ?? null,
            sourceAssetId: params.sourceAssetId ?? null,
            assets: [swapAssetsFixture[0], hiveAsset],
            chains: {},
          };
        }

        if (params.mode === 'buy') {
          return {
            mode: 'buy',
            direction: 'to',
            sourceAssetId: null,
            assets: [ethAsset],
            chains: {},
          };
        }

        return {
          mode: params.mode,
          direction: params.direction,
          sourceAssetId: params.sourceAssetId ?? null,
          assets: [],
          chains: {},
        };
      },
    );

    const { container } = render(
      <Portfolio
        hiveAccounts={[hiveAlice]}
        evmAccounts={[evmAccount]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
    });

    await selectOverlayOption(container, 'portfolio-to-asset', (text) =>
      text.includes('HIVE'),
    );

    await waitFor(() => {
      expect(
        container.querySelector('#portfolio-recipient-account'),
      ).not.toBeNull();
    });

    clickPortfolioNav(container, 'buy');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
    });

    await selectOverlayOption(
      container,
      'portfolio-to-asset',
      (text) => text.includes('Ethereum') || /\bETH\b/.test(text),
    );

    await waitFor(() => {
      expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();
      expect(container.querySelector('#portfolio-recipient-account')).toBeNull();
      expect(
        container.querySelector('[data-testid="portfolio-recipient-address"]'),
      ).toBeNull();
    });
  });

  it('orders sell fields as wallet, asset, then amount', async () => {
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      return [ethToken];
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [swapAssetsFixture[0]],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'sell',
      direction: 'from',
      sourceAssetId: null,
      assets: [swapAssetsFixture[0]],
      chains: {},
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'sell');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();
      expect(container.querySelector('#portfolio-from-asset')).not.toBeNull();
      expect(
        container.querySelector(
          '.portfolio-flow .portfolio-amount-field input[type="number"]',
        ),
      ).not.toBeNull();
    });

    const flowHtml = (
      container.querySelector('.portfolio-flow') as HTMLElement
    ).innerHTML;
    const accountIndex = flowHtml.indexOf('id="portfolio-flow-account"');
    const fromAssetIndex = flowHtml.indexOf('id="portfolio-from-asset"');
    const amountIndex = flowHtml.indexOf('portfolio-amount-field');

    expect(accountIndex).toBeGreaterThan(-1);
    expect(fromAssetIndex).toBeGreaterThan(accountIndex);
    expect(amountIndex).toBeGreaterThan(fromAssetIndex);

    fireEvent.click(
      container.querySelector('#portfolio-flow-account') as HTMLButtonElement,
    );

    await waitFor(() => {
      const accountOptions = container.querySelectorAll(
        '#portfolio-flow-account-listbox [role="option"]',
      );
      const optionTexts = [...accountOptions].map(
        (option) => option.textContent ?? '',
      );
      expect(optionTexts.some((text) => text.includes('0xabc'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('alice'))).toBe(true);
    });
  });

  it('sets the sell amount to the selected source balance', async () => {
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      return [ethToken];
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [swapAssetsFixture[0]],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'sell',
      direction: 'from',
      sourceAssetId: null,
      assets: [swapAssetsFixture[0]],
      chains: {},
    });

    const { container, getByTestId } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'sell');

    await waitFor(() => {
      expect(getByTestId('set-to-max-button')).toBeTruthy();
    });

    fireEvent.click(getByTestId('set-to-max-button'));

    expect(
      (
        container.querySelector(
          '.portfolio-flow .portfolio-amount-field input[type="number"]',
        ) as HTMLInputElement
      ).value,
    ).toBe('1');
  });

  it('does not show a recipient field on the sell page', async () => {
    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (_chains, _walletAddress, options) => {
      options?.onChainReady?.(ethereumChain, [ethToken]);
      options?.onChainFinished?.(ethereumChain);
      return [ethToken];
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [
        swapAssetsFixture[0],
        {
          assetId: 'hive-hive',
          ecosystem: 'hive',
          symbol: 'HIVE',
          name: 'Hive',
          chainId: 'hive',
          address: null,
          decimals: 3,
          isNative: true,
          familyId: 'hive',
          logoUrl: null,
          priceUsd: 0,
          rankScore: 100,
        },
        {
          assetId: 'utxo:native:bitcoin',
          ecosystem: 'utxo',
          symbol: 'BTC',
          name: 'Bitcoin',
          chainId: 'bitcoin',
          address: null,
          decimals: 8,
          isNative: true,
          familyId: 'utxo:native:btc',
          logoUrl: null,
          priceUsd: 0,
          rankScore: 90,
        },
      ],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      mode: 'sell',
      direction: 'from',
      sourceAssetId: null,
      assets: [swapAssetsFixture[0]],
      chains: {},
    });

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'sell');

    await waitFor(() => {
      expect(container.querySelector('.portfolio-flow')).not.toBeNull();
    });

    expect(container.textContent).not.toContain('evm_swap_receiver_address');
    expect(container.textContent).not.toContain(
      'portfolio_recipient_hive_account',
    );
    expect(container.textContent).not.toContain(
      'portfolio_recipient_bitcoin_address',
    );
    expect(container.textContent).not.toContain(
      'portfolio_recipient_destination_address',
    );
  });

  it('lets users pick a Keychain recipient or enter another address on swap', async () => {
    const hiveAlice = { name: 'alice' } as never;
    const hiveBob = { name: 'bob' } as never;
    const evmAccount = {
      id: 1,
      wallet: { address: '0xabc' },
      hide: false,
    } as never;
    const hiveAsset = {
      assetId: 'hive:native:hive',
      ecosystem: 'hive',
      symbol: 'HIVE',
      name: 'Hive',
      chainId: 'hive',
      address: null,
      decimals: 3,
      isNative: true,
      familyId: 'hive',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 100,
    };
    const btcAsset = {
      assetId: 'utxo:native:bitcoin',
      ecosystem: 'utxo',
      symbol: 'BTC',
      name: 'Bitcoin',
      chainId: 'bitcoin',
      address: null,
      decimals: 8,
      isNative: true,
      familyId: 'utxo:native:btc',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 90,
    };

    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [swapAssetsFixture[0], hiveAsset, btcAsset],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockImplementation(
      async (params: {
        mode: string;
        direction?: string;
        sourceAssetId?: string;
      }) => {
        if (params.mode === 'swap') {
          return {
            mode: 'swap',
            direction: params.direction ?? null,
            sourceAssetId: params.sourceAssetId ?? null,
            assets: [swapAssetsFixture[0], hiveAsset, btcAsset],
            chains: {},
          };
        }

        return {
          mode: params.mode,
          direction: params.direction,
          sourceAssetId: params.sourceAssetId ?? null,
          assets: [],
          chains: {},
        };
      },
    );

    const { container } = render(
      <Portfolio
        hiveAccounts={[hiveAlice, hiveBob]}
        evmAccounts={[evmAccount]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
    });

    await selectOverlayOption(container, 'portfolio-to-asset', (text) =>
      text.includes('HIVE'),
    );

    await waitFor(() => {
      const recipientSelect = container.querySelector(
        '#portfolio-recipient-account',
      ) as HTMLButtonElement;
      expect(recipientSelect).not.toBeNull();
      expect(recipientSelect.disabled).toBe(false);
      expect(recipientSelect.textContent).toContain('alice');
      expect(
        container.querySelector('[data-testid="portfolio-recipient-address"]'),
      ).toBeNull();
    });

    fireEvent.click(
      container.querySelector(
        '#portfolio-recipient-account',
      ) as HTMLButtonElement,
    );

    await waitFor(() => {
      expect(
        container.querySelector('#portfolio-recipient-account-listbox'),
      ).not.toBeNull();
    });

    const recipientOptions = [
      ...container.querySelectorAll(
        '#portfolio-recipient-account-listbox [role="option"]',
      ),
    ];
    const recipientOptionTexts = recipientOptions.map(
      (option) => option.textContent ?? '',
    );
    expect(recipientOptionTexts.some((text) => text.includes('alice'))).toBe(
      true,
    );
    expect(recipientOptionTexts.some((text) => text.includes('bob'))).toBe(
      true,
    );
    expect(recipientOptionTexts.some((text) => text.includes('Other'))).toBe(
      true,
    );
    expect(recipientOptionTexts.some((text) => text.includes('0xabc'))).toBe(
      false,
    );

    const otherOption = recipientOptions.find((option) =>
      (option.textContent ?? '').includes('Other'),
    );
    expect(otherOption).toBeTruthy();
    fireEvent.click(otherOption as HTMLElement);

    await waitFor(() => {
      const recipientInput = container.querySelector(
        '[data-testid="portfolio-recipient-address"]',
      ) as HTMLInputElement;
      expect(recipientInput).not.toBeNull();
      expect(recipientInput.disabled).toBe(false);
    });

    await selectOverlayOption(container, 'portfolio-to-asset', (text) =>
      text.includes('BTC') || text.includes('Bitcoin'),
    );

    await waitFor(() => {
      expect(container.querySelector('#portfolio-recipient-account')).toBeNull();
      const recipientInput = container.querySelector(
        '[data-testid="portfolio-recipient-address"]',
      ) as HTMLInputElement;
      expect(recipientInput).not.toBeNull();
      expect(recipientInput.disabled).toBe(false);
    });
  });

  it('lists Keychain EVM accounts as recipients for hive to evm swaps', async () => {
    const hiveAlice = { name: 'alice' } as never;
    const evmAccount = {
      id: 1,
      wallet: { address: '0xabc' },
      hide: false,
    } as never;
    const hiveAsset = {
      assetId: 'hive:native:hive',
      ecosystem: 'hive',
      symbol: 'HIVE',
      name: 'Hive',
      chainId: 'hive',
      address: null,
      decimals: 3,
      isNative: true,
      familyId: 'hive',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 100,
    };

    jest
      .spyOn(AccountUtils, 'getExtendedAccounts')
      .mockResolvedValue([{ name: 'alice' } as never]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue({
      portfolio: [
        {
          account: 'alice',
          balances: [{ symbol: 'HIVE', balance: 10, usdValue: 10 }],
          totalHive: 10,
          totalUSD: 10,
        },
      ],
      orderedTokenList: ['HIVE'],
      tokens: [],
    });
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: [swapAssetsFixture[0], hiveAsset],
      chains: {},
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockImplementation(
      async (params: {
        mode: string;
        direction?: string;
        sourceAssetId?: string;
      }) => {
        if (params.mode === 'swap') {
          return {
            mode: 'swap',
            direction: params.direction ?? null,
            sourceAssetId: params.sourceAssetId ?? null,
            assets: [swapAssetsFixture[0], hiveAsset],
            chains: {},
          };
        }

        return {
          mode: params.mode,
          direction: params.direction,
          sourceAssetId: params.sourceAssetId ?? null,
          assets: [],
          chains: {},
        };
      },
    );

    const { container } = render(
      <Portfolio
        hiveAccounts={[hiveAlice]}
        evmAccounts={[evmAccount]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('HIVE');
    });

    clickPortfolioNav(container, 'swap');

    await waitFor(() => {
      expect(container.querySelector('#portfolio-to-asset')).not.toBeNull();
    });

    await selectOverlayOption(
      container,
      'portfolio-to-asset',
      (text) => text.includes('Ethereum') || /\bETH\b/.test(text),
    );

    await waitFor(() => {
      const recipientSelect = container.querySelector(
        '#portfolio-recipient-account',
      ) as HTMLButtonElement;
      expect(recipientSelect).not.toBeNull();
      expect(recipientSelect.disabled).toBe(false);
      expect(recipientSelect.textContent).toContain('0xabc');
    });

    fireEvent.click(
      container.querySelector(
        '#portfolio-recipient-account',
      ) as HTMLButtonElement,
    );

    await waitFor(() => {
      const optionTexts = [
        ...container.querySelectorAll(
          '#portfolio-recipient-account-listbox [role="option"]',
        ),
      ].map((option) => option.textContent ?? '');
      expect(optionTexts.some((text) => text.includes('0xabc'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('Other'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('alice'))).toBe(false);
    });
  });

  it('resets buy/sell form fields when switching sections', async () => {
    const { container } = render(
      <Portfolio
        hiveAccounts={[{ name: 'alice' } as never]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName="alice"
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('.portfolio-sidebar')).not.toBeNull();
    });

    clickPortfolioNav(container, 'buy');

    await waitFor(() => {
      expect(container.querySelector('.portfolio-flow')).not.toBeNull();
    });

    const amountInput = container.querySelector(
      '.portfolio-flow .portfolio-amount-field input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(amountInput.value).toBe('100');

    clickPortfolioNav(container, 'sell');

    await waitFor(() => {
      const sellAmountInput = container.querySelector(
        '.portfolio-flow .portfolio-amount-field input[type="number"]',
      ) as HTMLInputElement;
      expect(sellAmountInput.value).toBe('');
    });

    const sellAmountInput = container.querySelector(
      '.portfolio-flow .portfolio-amount-field input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(sellAmountInput, { target: { value: '50' } });
    expect(sellAmountInput.value).toBe('50');

    clickPortfolioNav(container, 'buy');

    await waitFor(() => {
      const buyAmountInput = container.querySelector(
        '.portfolio-flow .portfolio-amount-field input[type="number"]',
      ) as HTMLInputElement;
      expect(buyAmountInput.value).toBe('');
    });
  });

  it('refreshes EVM balances after resolved or incoming transactions for the selected account', async () => {
    const originalDebounce =
      PortfolioEvmBalanceRefreshUtils.PORTFOLIO_EVM_BALANCE_REFRESH_DEBOUNCE_MS;
    Object.assign(PortfolioEvmBalanceRefreshUtils, {
      PORTFOLIO_EVM_BALANCE_REFRESH_DEBOUNCE_MS: 0,
    });

    let runtimeMessageListener:
      | ((message: { command?: string; value?: Record<string, string> }) => void)
      | undefined;
    const addListenerSpy = jest
      .spyOn(chrome.runtime.onMessage, 'addListener')
      .mockImplementation(((listener: typeof runtimeMessageListener) => {
        runtimeMessageListener = listener;
      }) as typeof chrome.runtime.onMessage.addListener);
    jest
      .spyOn(chrome.runtime.onMessage, 'removeListener')
      .mockImplementation(
        jest.fn() as typeof chrome.runtime.onMessage.removeListener,
      );

    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockImplementation(async (chains, _walletAddress, options) => {
      for (const chain of chains) {
        const tokens =
          chain.chainId === ethereumChain.chainId ? [ethToken] : [maticToken];
        options?.onChainReady?.(chain, tokens);
        options?.onChainFinished?.(chain);
      }
      return [ethToken, maticToken];
    });

    const { container, unmount } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[
          {
            id: 1,
            wallet: { address: '0xabc' },
          } as never,
        ]}
        activeAccountType={ChainType.EVM}
        activeEvmAccountAddress="0xabc"
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.textContent).toContain('ETH');
      expect(container.querySelector('.portfolio-loading-more')).toBeNull();
      expect(runtimeMessageListener).toBeDefined();
    });

    (
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains as jest.Mock
    ).mockClear();

    await act(async () => {
      runtimeMessageListener?.({
        command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
        value: { from: '0xdef' },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
    ).not.toHaveBeenCalled();

    await act(async () => {
      runtimeMessageListener?.({
        command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
        value: { from: '0xAbC' },
      });
      runtimeMessageListener?.({
        command: BackgroundCommand.EVM_INCOMING_TRANSACTION,
        value: { address: '0xabc' },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
    });

    unmount();
    addListenerSpy.mockRestore();
    Object.assign(PortfolioEvmBalanceRefreshUtils, {
      PORTFOLIO_EVM_BALANCE_REFRESH_DEBOUNCE_MS: originalDebounce,
    });
  });
});

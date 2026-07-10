import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import AccountSelectorOrderUtils from '@popup/multichain/utils/account-selector-order.utils';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Portfolio } from 'src/portfolio/portfolio.component';
import { PortfolioApiUtils, PortfolioApiError } from 'src/portfolio/portfolio-api.utils';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

jest.mock('src/popup/hive/utils/tokens.utils', () => ({
  __esModule: true,
  default: {
    getAllTokens: jest.fn().mockResolvedValue([]),
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

jest.mock('src/portfolio/portfolio-api.utils', () => {
  const actual = jest.requireActual('src/portfolio/portfolio-api.utils');

  return {
    ...actual,
    PortfolioApiUtils: {
      ...actual.PortfolioApiUtils,
      listAssets: jest.fn().mockResolvedValue({ assets: [], chains: {} }),
      listHistory: jest.fn().mockResolvedValue([]),
      getQuotes: jest.fn().mockResolvedValue({ quotes: [] }),
      resolveExecutablePortfolioQuoteId: jest.fn().mockReturnValue(''),
      canExecutePortfolioQuote: jest.fn().mockReturnValue(true),
      resolvePortfolioAmountQuoteError:
        actual.PortfolioApiUtils.resolvePortfolioAmountQuoteError,
      getFiatRampOptions: jest.fn().mockResolvedValue({
        fiatCurrencies: ['USD', 'EUR'],
        paymentMethods: [{ id: 'card', label: 'Credit / Debit Card' }],
      }),
      listFiatRampCountries: jest.fn().mockResolvedValue([
        { countryCode: 'US', name: 'United States' },
        { countryCode: 'DE', name: 'Germany' },
      ]),
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
    mockPortfolioListAvailableAssets();
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
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
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

    const sidebarButtons = container.querySelectorAll('.portfolio-sidebar nav button');
    expect(sidebarButtons).toHaveLength(5);
    expect(sidebarButtons[0].classList.contains('active')).toBe(true);

    clickPortfolioNav(container, 'buy');

    expect(
      container
        .querySelector('[data-testid="portfolio-nav-buy"]')
        ?.classList.contains('active'),
    ).toBe(true);
    expect(container.querySelector('.portfolio-flow')).not.toBeNull();
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
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue([[], []]);

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
    jest.spyOn(AccountUtils, 'getExtendedAccounts').mockResolvedValue([
      { name: 'alice' } as never,
    ]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue([
      [
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
      ['HIVE', 'HBD', 'HP', 'DEC', 'BEE'],
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
      const symbols = Array.from(
        container.querySelectorAll('.portfolio-token-identity strong'),
      ).map((element) => element.textContent);

      expect(symbols).toEqual(['HIVE', 'HBD', 'HP', 'DEC', 'BEE']);
    });
  });

  it('preloads swap available assets after portfolio initialization', async () => {
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
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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

  it('refreshes portfolio data when the global refresh button is clicked', async () => {
    jest.spyOn(AccountUtils, 'getExtendedAccounts').mockResolvedValue([
      { name: 'alice' } as never,
    ]);
    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue([
      [
        {
          account: 'alice',
          balances: [],
          totalHive: 0,
          totalUSD: 0,
        },
      ],
      [],
    ]);

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

    await waitFor(() => expect(PortfolioApiUtils.listAssets).toHaveBeenCalled());

    jest.spyOn(PortfolioUtils, 'getPortfolio').mockResolvedValue([[], []]);
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
      expect(PortfolioApiUtils.listHistory).toHaveBeenCalledTimes(1);
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

    await waitFor(() => {
      expect(PortfolioApiUtils.listHistory).toHaveBeenCalledWith(1, {
        addresses: ['alice', 'bob', '0xAbC', '0xDef'],
      });
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
      expect(PortfolioApiUtils.listHistory).toHaveBeenCalledTimes(1);
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
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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
      expect(container.querySelector('.portfolio-status')?.textContent).toContain(
        'Polygon',
      );
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
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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
          assetId: 'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
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
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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
        },
      ],
      chains: {},
    });
    mockPortfolioListAvailableAssets();

    const { container } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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

  it('auto-fetches swap quotes once the form is complete without a get quotes button', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue({
      assets: swapAssetsFixture,
      chains: {},
    });

    const { container, queryByText } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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
      expect(view.container.querySelector('#portfolio-from-asset')).not.toBeNull();
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
      expect(
        container.querySelectorAll('.portfolio-quote-card'),
      ).toHaveLength(2);
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
      expect(
        container.querySelectorAll('.portfolio-quote-card'),
      ).toHaveLength(2);
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
        container.querySelector('[data-testid="portfolio-swap-quote-retry-label"]'),
      ).not.toBeNull();
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
              },
            ],
            chains: {
              kaia: {
                id: 'kaia',
                name: 'Kaia',
                logoUrl: 'https://example.com/kaia.svg',
                numericChainId: 8217,
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
        evmAccounts={
          [
            {
              id: 1,
              wallet: { address: '0xabc' },
            } as never,
          ]
        }
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
      const optionTexts = [...options].map((option) => option.textContent ?? '');
      expect(optionTexts.some((text) => text.includes('KAIA'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('Kaia'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('evm:native:kaia'))).toBe(
        false,
      );
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
      const optionTexts = [...options].map((option) => option.textContent ?? '');
      expect(optionTexts.some((text) => text.includes('0xvisible'))).toBe(true);
      expect(optionTexts.some((text) => text.includes('0xhidden'))).toBe(false);
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
        },
      ],
    });

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
      expect(container.querySelector('.portfolio-sidebar')).not.toBeNull();
    });

    clickPortfolioNav(container, 'buy');

    await waitFor(() => {
      expect(PortfolioApiUtils.listFiatRampCountries).toHaveBeenCalledWith(
        'buy',
      );
      expect(PortfolioApiUtils.getFiatRampOptions).toHaveBeenCalledWith({
        countryCode: 'US',
        mode: 'buy',
      });
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
        mode: 'buy',
        direction: 'to',
      });
      expect(container.textContent).toContain('🇺🇸');
      expect(container.textContent).toContain('United States');
      expect(container.textContent).toContain('USD');
    });
  });
});

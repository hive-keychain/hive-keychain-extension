import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Portfolio } from 'src/portfolio/portfolio.component';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';
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

jest.mock('src/portfolio/portfolio-api.utils', () => ({
  PortfolioApiUtils: {
    listAssets: jest.fn().mockResolvedValue([]),
    listHistory: jest.fn().mockResolvedValue([]),
    getQuotes: jest.fn().mockResolvedValue({ quotes: [] }),
    getFiatRampOptions: jest.fn().mockResolvedValue({
      fiatCurrencies: ['USD', 'EUR'],
      paymentMethods: [{ id: 'card', label: 'Credit / Debit Card' }],
    }),
    listAvailableAssets: jest.fn().mockResolvedValue({
      mode: 'buy',
      direction: 'to',
      sourceAssetId: null,
      assets: [],
    }),
  },
}));

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
    expect(sidebarButtons).toHaveLength(6);
    expect(sidebarButtons[0].classList.contains('active')).toBe(true);

    fireEvent.click(sidebarButtons[3]);

    expect(sidebarButtons[3].classList.contains('active')).toBe(true);
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

    const sidebarButtons = container.querySelectorAll('.portfolio-sidebar nav button');
    fireEvent.click(sidebarButtons[3]);

    await waitFor(() => {
      expect(
        EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains,
      ).toHaveBeenCalledTimes(1);
      expect(container.querySelector('.portfolio-flow')).not.toBeNull();
    });
  });

  it('shows account selector in swap and bridge flows', async () => {
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

    const sidebarButtons = container.querySelectorAll('.portfolio-sidebar nav button');

    fireEvent.click(sidebarButtons[3]);
    expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();

    fireEvent.click(sidebarButtons[4]);
    expect(container.querySelector('#portfolio-flow-account')).not.toBeNull();

    fireEvent.click(sidebarButtons[1]);
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

  it('does not request swap quotes when from asset id cannot be resolved', async () => {
    (PortfolioApiUtils.listAssets as jest.Mock).mockResolvedValue([
      {
        assetId: 'evm:token:hmi:0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e',
        ecosystem: 'evm',
        symbol: 'HMI',
        name: 'HMI',
        chainId: '0x1',
        logoUrl: null,
      },
    ]);

    const { container, getByText } = render(
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

    const sidebarButtons = container.querySelectorAll('.portfolio-sidebar nav button');
    fireEvent.click(sidebarButtons[3]);

    await waitFor(() => {
      expect(container.textContent).not.toContain('ETH - Ethereum (1)');
    });

    const amountInput = container.querySelector(
      '.portfolio-flow input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.1' } });

    const getQuotesButton = container.querySelector(
      '.portfolio-flow button',
    ) as HTMLButtonElement;
    fireEvent.click(getQuotesButton);

    expect(PortfolioApiUtils.getQuotes).not.toHaveBeenCalled();
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

    const sidebarButtons = container.querySelectorAll('.portfolio-sidebar nav button');
    fireEvent.click(sidebarButtons[1]);

    await waitFor(() => {
      expect(PortfolioApiUtils.getFiatRampOptions).toHaveBeenCalledWith({
        countryCode: 'US',
        mode: 'buy',
      });
      expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
        mode: 'buy',
        direction: 'to',
      });
      expect(container.textContent).toContain('🇺🇸');
      expect(container.textContent).toContain('United States of America');
      expect(container.textContent).toContain('USD');
    });
  });
});

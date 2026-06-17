import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';

const hiveAsset: PortfolioCanonicalAsset = {
  assetId: 'hive-hive',
  ecosystem: 'hive',
  symbol: 'HIVE',
  name: 'Hive',
  chainId: null,
  logoUrl: null,
};

const hiveEngineAsset: PortfolioCanonicalAsset = {
  assetId: 'he-dec',
  ecosystem: 'hive_engine',
  symbol: 'DEC',
  name: 'Dark Energy Crystals',
  chainId: null,
  logoUrl: null,
};

const ethAsset: PortfolioCanonicalAsset = {
  assetId: 'evm-eth-1',
  ecosystem: 'evm',
  symbol: 'ETH',
  name: 'Ether',
  chainId: '0x1',
  logoUrl: null,
};

const sepoliaEthAsset: PortfolioCanonicalAsset = {
  assetId: 'evm-eth-sepolia',
  ecosystem: 'evm',
  symbol: 'ETH',
  name: 'Sepolia Ether',
  chainId: '0xaa36a7',
  logoUrl: null,
};

describe('PortfolioFlowUtils', () => {
  it('builds from asset options from positive portfolio balances and excludes testnets', () => {
    const options = PortfolioFlowUtils.buildPortfolioFromSelectOptions([
      {
        key: 'hive:HIVE',
        symbol: 'HIVE',
        network: 'Hive',
        balance: '10',
        isHive: true,
      },
      {
        key: '0xaa36a7:ETH:native',
        symbol: 'ETH',
        network: 'Sepolia',
        balance: '1',
        chainId: '0xaa36a7',
        isTestnet: true,
      },
      {
        key: '0x1:ETH:native',
        symbol: 'ETH',
        network: 'Ethereum',
        balance: '2',
        chainId: '0x1',
        isTestnet: false,
      },
      {
        key: 'hive:DEC',
        symbol: 'DEC',
        network: 'Hive',
        balance: '0',
      },
    ]);

    expect(options).toEqual([
      {
        value: 'hive:HIVE',
        label: 'HIVE - Hive (10)',
      },
      {
        value: '0x1:ETH:native',
        label: 'ETH - Ethereum (2)',
      },
    ]);
  });

  it('defaults to the first available asset option value', () => {
    expect(
      PortfolioFlowUtils.getDefaultSelectOptionValue([
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]),
    ).toBe('a');
    expect(PortfolioFlowUtils.getDefaultSelectOptionValue([])).toBe('');
  });

  it('resolves evm erc20 rows by contract address and slug chain id', () => {
    const usdcAsset: PortfolioCanonicalAsset = {
      assetId:
        'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      ecosystem: 'evm',
      symbol: 'USDC',
      name: 'USD Coin',
      chainId: 'ethereum',
      logoUrl: null,
    };
    const chains = [
      {
        name: 'Ethereum',
        chainId: '0x1',
        logo: 'ethereum.svg',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: '0x1:USDC:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          network: 'Ethereum',
          balance: '1',
          chainId: '0x1',
        },
        [usdcAsset],
        chains,
      ),
    ).toBe(
      'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    );
  });

  it('resolves native evm rows when canonical chain id uses a slug', () => {
    const nativeEthAsset: PortfolioCanonicalAsset = {
      assetId: 'evm:coin:ethereum:eth',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ether',
      chainId: 'ethereum',
      logoUrl: null,
    };
    const chains = [
      {
        name: 'Ethereum',
        chainId: '0x1',
        logo: 'ethereum.svg',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: '0x1:ETH:native',
          symbol: 'ETH',
          network: 'Ethereum',
          balance: '1',
          chainId: '0x1',
        },
        [nativeEthAsset],
        chains,
      ),
    ).toBe('evm:coin:ethereum:eth');
  });

  it('does not match evm rows to hive engine assets with the same symbol', () => {
    const hiveEngineKingAsset: PortfolioCanonicalAsset = {
      assetId: 'hive-engine:king',
      ecosystem: 'hive_engine',
      symbol: 'KING',
      name: 'KING',
      chainId: null,
      logoUrl: null,
    };
    const evmKingAsset: PortfolioCanonicalAsset = {
      assetId: 'evm:token:ethereum:0xeb1a81845234f75b412b654415b0f1ae5e8f4339',
      ecosystem: 'evm',
      symbol: 'KING',
      name: 'KING',
      chainId: 'ethereum',
      logoUrl: null,
    };
    const chains = [
      {
        name: 'Ethereum',
        chainId: '0x1',
        logo: 'ethereum.svg',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: '0x1:KING:0xeb1a81845234f75b412b654415b0f1ae5e8f4339',
          symbol: 'KING',
          network: 'Ethereum',
          balance: '1',
          chainId: '0x1',
        },
        [hiveEngineKingAsset, evmKingAsset],
        chains,
      ),
    ).toBe('evm:token:ethereum:0xeb1a81845234f75b412b654415b0f1ae5e8f4339');
  });

  it('resolves hive, hive engine, and evm rows to canonical assets', () => {
    const assets = [hiveAsset, hiveEngineAsset, ethAsset, sepoliaEthAsset];

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: 'hive:HIVE',
          symbol: 'HIVE',
          network: 'Hive',
          balance: '1',
        },
        assets,
      ),
    ).toBe('hive-hive');

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: 'hive:DEC',
          symbol: 'DEC',
          network: 'Hive',
          balance: '1',
        },
        assets,
      ),
    ).toBe('he-dec');

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: '0x1:ETH:native',
          symbol: 'ETH',
          network: 'Ethereum',
          balance: '1',
          chainId: '0x1',
        },
        assets,
      ),
    ).toBe('evm-eth-1');
  });

  it('resolves a selected row key to a canonical asset id for quotes', () => {
    const rows = [
      {
        key: '0x1:ETH:native',
        symbol: 'ETH',
        network: 'Ethereum',
        balance: '1',
        chainId: '0x1',
      },
    ];

    expect(
      PortfolioFlowUtils.resolveFromRowKeyToCanonicalAssetId(
        '0x1:ETH:native',
        rows,
        [ethAsset],
      ),
    ).toBe('evm-eth-1');
  });

  it('builds chain filter options from canonical assets', () => {
    const assets = [hiveAsset, hiveEngineAsset, ethAsset, sepoliaEthAsset];

    expect(
      PortfolioFlowUtils.buildCanonicalAssetChainFilterOptions(assets, [
        {
          name: 'Ethereum',
          chainId: '0x1',
          logo: 'ethereum.svg',
        } as never,
      ]),
    ).toEqual([
      {
        value: 'evm:11155111',
        label: '0xaa36a7',
        key: 'evm:11155111',
        img: undefined,
        imgChip: undefined,
      },
      {
        value: 'evm:1',
        label: 'Ethereum',
        key: 'evm:1',
        img: 'ethereum.svg',
        imgChip: undefined,
      },
      {
        value: 'hive',
        label: 'Hive',
        key: 'hive',
        img: '/assets/images/wallet/hive-logo.svg',
        imgChip: undefined,
      },
      {
        value: 'hive_engine',
        label: 'Hive Engine',
        key: 'hive_engine',
        img: '/assets/images/wallet/hive-engine.svg',
        imgChip: undefined,
      },
    ]);
  });

  it('filters canonical assets by text and chain', () => {
    const assets = [hiveAsset, hiveEngineAsset, ethAsset, sepoliaEthAsset];

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(assets, {
        textFilter: 'eth',
        chainFilter: 'evm:1',
      }),
    ).toEqual({
      assets: [ethAsset],
      totalMatches: 1,
    });

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(assets, {
        textFilter: 'dec',
        chainFilter: 'hive_engine',
      }),
    ).toEqual({
      assets: [hiveEngineAsset],
      totalMatches: 1,
    });

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(assets, {
        textFilter: 'dark',
      }).assets,
    ).toEqual([]);

    const wethAsset: PortfolioCanonicalAsset = {
      assetId: 'evm-weth-1',
      ecosystem: 'evm',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      chainId: '0x1',
      logoUrl: null,
    };

    expect(
      PortfolioFlowUtils.filterCanonicalAssets([wethAsset, ethAsset], {
        textFilter: 'eth',
      }).assets,
    ).toEqual([ethAsset, wethAsset]);
  });

  it('limits filtered canonical assets to maxResults', () => {
    const assets = [hiveAsset, hiveEngineAsset, ethAsset, sepoliaEthAsset];

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(assets, {
        maxResults: 2,
      }).totalMatches,
    ).toBe(4);
  });

  it('builds to asset select options with network labels', () => {
    const chains = [
      {
        name: 'Ethereum',
        chainId: '0x1',
        logo: 'ethereum.svg',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.buildCanonicalAssetSelectOptions(
        [hiveAsset, hiveEngineAsset, ethAsset],
        chains,
      ),
    ).toEqual([
      { value: 'hive-hive', label: 'HIVE - Hive' },
      { value: 'he-dec', label: 'DEC - Hive Engine' },
      { value: 'evm-eth-1', label: 'ETH - Ethereum' },
    ]);
  });

  it('resolves canonical asset network labels and logos', () => {
    const chains = [
      {
        name: 'Ethereum',
        chainId: '0x1',
        logo: 'ethereum.svg',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(hiveAsset, chains),
    ).toBe('Hive');
    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(
        hiveEngineAsset,
        chains,
      ),
    ).toBe('Hive Engine');
    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(ethAsset, chains),
    ).toBe('Ethereum');

    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(hiveAsset, chains),
    ).toBe('/assets/images/wallet/hive-logo.svg');
    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(
        hiveEngineAsset,
        chains,
      ),
    ).toBe('/assets/images/wallet/hive-engine.svg');
    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(ethAsset, chains),
    ).toBe('ethereum.svg');
  });

  it('resolves canonical assets by slug-style chain references', () => {
    const slugEthAsset: PortfolioCanonicalAsset = {
      assetId: 'evm-0g-ethereum',
      ecosystem: 'evm',
      symbol: '0G',
      name: '0G',
      chainId: 'ethereum',
      logoUrl: 'https://example.com/0g.png',
    };
    const chains = [
      {
        name: 'Ethereum',
        chainId: '0x1',
        logo: 'ethereum.svg',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(slugEthAsset, chains),
    ).toBe('Ethereum');
    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(slugEthAsset, chains),
    ).toBe('ethereum.svg');
    expect(
      PortfolioFlowUtils.resolveEvmChainForChainReference('ethereum', chains)?.name,
    ).toBe('Ethereum');
  });

  it('formats quote amounts using token decimals before API submission', () => {
    expect(
      PortfolioFlowUtils.formatPortfolioQuoteFromAmount('1.23456789', 6),
    ).toBe('1.234567');
    expect(
      PortfolioFlowUtils.formatPortfolioQuoteFromAmount('1.5000', 3),
    ).toBe('1.5');
    expect(
      PortfolioFlowUtils.formatPortfolioQuoteFromAmount('1,234.567891', 3),
    ).toBe('1234.567');
  });

  it('resolves quote amount decimals by mode and from asset', () => {
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteFromAmountDecimals({
        mode: 'buy',
        fromAssetId: '',
        rows: [],
        assets: [],
      }),
    ).toBe(2);

    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteFromAmountDecimals({
        mode: 'swap',
        fromAssetId: '0x1:USDC:0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e',
        rows: [
          {
            key: '0x1:USDC:0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e',
            symbol: 'USDC',
            network: 'Ethereum',
            balance: '10',
            decimals: 6,
          },
        ],
        assets: [],
      }),
    ).toBe(6);

    expect(PortfolioFlowUtils.resolveHiveTokenDecimals('HIVE', [])).toBe(3);
    expect(
      PortfolioFlowUtils.resolveHiveTokenDecimals('DEC', [
        { symbol: 'DEC', precision: 3 },
      ]),
    ).toBe(3);
  });
});

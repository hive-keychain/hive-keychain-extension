import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';

const createTestCanonicalAsset = (
  asset: Pick<
    PortfolioCanonicalAsset,
    'assetId' | 'ecosystem' | 'symbol' | 'name'
  > &
    Partial<PortfolioCanonicalAsset>,
): PortfolioCanonicalAsset => ({
  chainId: null,
  address: null,
  decimals: null,
  isNative: false,
    familyId: asset.symbol.toLowerCase(),
  logoUrl: null,
  priceUsd: 0,
  rankScore: 0,
  ...asset,
});

const hiveAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'hive-hive',
  ecosystem: 'hive',
  symbol: 'HIVE',
  name: 'Hive',
});

const hbdAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'hive-hbd',
  ecosystem: 'hive',
  symbol: 'HBD',
  name: 'Hive Backed Dollar',
});

const hpAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'hive-hp',
  ecosystem: 'hive',
  symbol: 'HP',
  name: 'Hive Power',
});

const hiveEngineAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'he-dec',
  ecosystem: 'hive_engine',
  symbol: 'DEC',
  name: 'Dark Energy Crystals',
});

const ethAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'evm-eth-1',
  ecosystem: 'evm',
  symbol: 'ETH',
  name: 'Ether',
  chainId: '0x1',
  isNative: true,
  familyId: 'eth',
});

const sepoliaEthAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'evm-eth-sepolia',
  ecosystem: 'evm',
  symbol: 'ETH',
  name: 'Sepolia Ether',
  chainId: '0xaa36a7',
  isNative: true,
  familyId: 'eth',
});

const btcAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'utxo:native:bitcoin',
  ecosystem: 'utxo',
  symbol: 'BTC',
  name: 'Bitcoin',
  chainId: 'bitcoin',
  isNative: true,
  familyId: 'utxo:native:btc',
});

const xrpAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
  assetId: 'external:native:ripple',
  ecosystem: 'external',
  symbol: 'XRP',
  name: 'XRP',
  chainId: 'ripple',
  isNative: true,
  familyId: 'external:native:xrp',
});

describe('PortfolioFlowUtils', () => {
  it('filters destination-only assets out of actionable swap source assets', () => {
    expect(
      PortfolioFlowUtils.filterActionableSwapSourceAssets([
        ethAsset,
        btcAsset,
        xrpAsset,
      ]),
    ).toEqual([ethAsset]);
  });

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
        key: 'hive:HP',
        symbol: 'HP',
        network: 'Hive',
        balance: '5',
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
    const usdcAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId:
        'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      ecosystem: 'evm',
      symbol: 'USDC',
      name: 'USD Coin',
      chainId: 'ethereum',
      familyId: 'usdc',
    });
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
    const nativeEthAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm:coin:ethereum:eth',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ether',
      chainId: 'ethereum',
      isNative: true,
      familyId: 'eth',
    });
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

  it('resolves evm:native:ethereum rows when other chains share the same nativeCoinId', () => {
    const nativeEthAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm:native:ethereum',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'ETH',
      chainId: 'ethereum',
      isNative: true,
      familyId: 'eth',
    });
    const chains = [
      {
        name: 'Optimism',
        chainId: '0xa',
        nativeCoinId: 'ethereum',
      } as never,
      {
        name: 'Ethereum',
        chainId: '0x1',
        nativeCoinId: 'ethereum',
      } as never,
    ];

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: '0x1:ETH:native',
          symbol: 'ETH',
          network: 'Ethereum',
          balance: '0.00596414',
          chainId: '0x1',
        },
        [nativeEthAsset],
        chains,
      ),
    ).toBe('evm:native:ethereum');
  });

  it('resolves native evm rows using portfolio chain metadata when setup chains are unavailable', () => {
    const nativeEthAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm:native:ethereum',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'ETH',
      chainId: 'ethereum',
      isNative: true,
      familyId: 'evm-native:eth',
    });
    const portfolioChains = {
      ethereum: {
        id: 'ethereum',
        name: 'Ethereum',
        logoUrl: null,
        numericChainId: 1,
        rankScore: 0,
      },
    };

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToSwapFromAssetId(
        {
          key: '0x1:ETH:native',
          symbol: 'ETH',
          network: 'Ethereum',
          balance: '0.00596414',
          chainId: '0x1',
        },
        [nativeEthAsset],
        [],
        portfolioChains,
      ),
    ).toBe('evm:native:ethereum');
  });

  it('does not match native rows to non-native assets with the same symbol', () => {
    const wrappedEthAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm:token:base:baseeth',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Base ETH',
      chainId: 'base',
      isNative: false,
      familyId: 'baseeth',
    });

    expect(
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        {
          key: '0x1:ETH:native',
          symbol: 'ETH',
          network: 'Ethereum',
          balance: '1',
          chainId: '0x1',
        },
        [wrappedEthAsset],
        [
          {
            name: 'Ethereum',
            chainId: '0x1',
          } as never,
        ],
      ),
    ).toBeUndefined();
  });

  it('does not match evm rows to hive engine assets with the same symbol', () => {
    const hiveEngineKingAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'hive-engine:king',
      ecosystem: 'hive_engine',
      symbol: 'KING',
      name: 'KING',
      familyId: 'king',
    });
    const evmKingAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm:token:ethereum:0xeb1a81845234f75b412b654415b0f1ae5e8f4339',
      ecosystem: 'evm',
      symbol: 'KING',
      name: 'KING',
      chainId: 'ethereum',
      familyId: 'king',
    });
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

  it('abbreviates chain filter chip labels to three characters', () => {
    expect(
      PortfolioFlowUtils.abbreviatePortfolioChainFilterChipLabel('Ethereum'),
    ).toBe('ETH');
    expect(
      PortfolioFlowUtils.abbreviatePortfolioChainFilterChipLabel('Arbitrum One'),
    ).toBe('ARB');
    expect(
      PortfolioFlowUtils.abbreviatePortfolioChainFilterChipLabel('Hive Engine'),
    ).toBe('HIV');
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
        chipLabel: '0XA',
        key: 'evm:11155111',
        img: undefined,
        imgChip: undefined,
      },
      {
        value: 'evm:1',
        label: 'Ethereum',
        chipLabel: 'ETH',
        key: 'evm:1',
        img: 'ethereum.svg',
        imgChip: undefined,
      },
      {
        value: 'hive',
        label: 'Hive',
        chipLabel: 'HIV',
        key: 'hive',
        img: '/assets/images/wallet/hive-logo.svg',
        imgChip: undefined,
      },
      {
        value: 'hive_engine',
        label: 'Hive Engine',
        chipLabel: 'HE',
        key: 'hive_engine',
        img: '/assets/images/wallet/hive-engine.svg',
        imgChip: undefined,
      },
    ]);
  });

  it('dedupes chain filter options that share a chain id across ecosystems', () => {
    const solSvm = createTestCanonicalAsset({
      assetId: 'svm:native:solana',
      ecosystem: 'svm',
      symbol: 'SOL',
      name: 'Solana',
      chainId: 'solana',
      isNative: true,
    });
    const solMisTaggedAsEvm = createTestCanonicalAsset({
      assetId: 'evm:token:solana:abc',
      ecosystem: 'evm',
      symbol: 'MEME',
      name: 'Meme',
      chainId: 'solana',
    });
    const tronTvm = createTestCanonicalAsset({
      assetId: 'tvm:native:tron',
      ecosystem: 'tvm',
      symbol: 'TRX',
      name: 'TRON',
      chainId: 'tron',
      isNative: true,
    });
    const tronMisTaggedAsEvm = createTestCanonicalAsset({
      assetId: 'evm:token:tron:xyz',
      ecosystem: 'evm',
      symbol: 'USDT',
      name: 'Tether',
      chainId: 'tron',
    });
    const portfolioChains = {
      solana: {
        id: 'solana',
        name: 'Solana',
        logoUrl: 'solana.svg',
        numericChainId: null,
        rankScore: 9000,
      },
      tron: {
        id: 'tron',
        name: 'Tron',
        logoUrl: 'tron.svg',
        numericChainId: null,
        rankScore: 9500,
      },
    };

    expect(
      PortfolioFlowUtils.buildCanonicalAssetChainFilterOptions(
        [solMisTaggedAsEvm, solSvm, tronMisTaggedAsEvm, tronTvm],
        [],
        portfolioChains,
      ),
    ).toEqual([
      {
        value: 'tvm:tron',
        label: 'Tron',
        chipLabel: 'TRO',
        key: 'tvm:tron',
        img: 'tron.svg',
      },
      {
        value: 'svm:solana',
        label: 'Solana',
        chipLabel: 'SOL',
        key: 'svm:solana',
        img: 'solana.svg',
      },
    ]);

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(
        [solMisTaggedAsEvm, solSvm, tronMisTaggedAsEvm, tronTvm],
        { chainFilter: 'svm:solana' },
      ).assets.map((asset) => asset.assetId),
    ).toEqual(['evm:token:solana:abc', 'svm:native:solana']);
  });

  it('sorts chain filter options by API chain rankScore descending', () => {
    const assets = [hiveAsset, ethAsset, sepoliaEthAsset];
    const portfolioChains = {
      '1': {
        id: '1',
        name: 'Ethereum',
        logoUrl: 'ethereum.svg',
        numericChainId: 1,
        rankScore: 9200,
      },
      '11155111': {
        id: '11155111',
        name: 'Sepolia',
        logoUrl: null,
        numericChainId: 11155111,
        rankScore: 10,
      },
      hive: {
        id: 'hive',
        name: 'Hive',
        logoUrl: null,
        numericChainId: null,
        rankScore: 500,
      },
    };

    expect(
      PortfolioFlowUtils.buildCanonicalAssetChainFilterOptions(
        assets,
        [],
        portfolioChains,
      ).map((option) => option.value),
    ).toEqual(['evm:1', 'hive', 'evm:11155111']);
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
    ).toEqual([hiveEngineAsset]);

    expect(
      PortfolioFlowUtils.filterCanonicalAssets([hiveAsset, hbdAsset], {
        textFilter: 'backed',
      }).assets,
    ).toEqual([hbdAsset]);

    expect(
      PortfolioFlowUtils.filterCanonicalAssets([hiveAsset, hbdAsset], {
        textFilter: 'hive',
      }).assets,
    ).toEqual([hiveAsset, hbdAsset]);

    const wethAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm-weth-1',
      ecosystem: 'evm',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      chainId: '0x1',
      familyId: 'eth',
    });

    expect(
      PortfolioFlowUtils.filterCanonicalAssets([wethAsset, ethAsset], {
        textFilter: 'eth',
      }).assets,
    ).toEqual([ethAsset, wethAsset]);
  });

  it('filters canonical assets by network label in text search', () => {
    const portfolioChains = {
      '1': {
        id: '1',
        name: 'Ethereum',
        logoUrl: 'ethereum.svg',
        numericChainId: 1,
        rankScore: 9200,
      },
      '11155111': {
        id: '11155111',
        name: 'Sepolia',
        logoUrl: null,
        numericChainId: 11155111,
        rankScore: 10,
      },
    };

    expect(
      PortfolioFlowUtils.filterCanonicalAssets([ethAsset, sepoliaEthAsset], {
        textFilter: 'ethereum',
        portfolioChains,
        chains: [
          {
            name: 'Ethereum',
            chainId: '0x1',
            logo: 'ethereum.svg',
          } as never,
        ],
      }).assets,
    ).toEqual([ethAsset]);

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(
        [hiveAsset, hiveEngineAsset, ethAsset],
        {
          textFilter: 'engine',
          portfolioChains,
        },
      ).assets,
    ).toEqual([hiveEngineAsset]);
  });

  it('limits filtered canonical assets to maxResults', () => {
    const assets = [hiveAsset, hiveEngineAsset, ethAsset, sepoliaEthAsset];

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(assets, {
        maxResults: 2,
      }).totalMatches,
    ).toBe(4);
  });

  it('sorts to assets by usd price descending by default', () => {
    const cheapAsset = createTestCanonicalAsset({
      assetId: 'evm-matic',
      ecosystem: 'evm',
      symbol: 'MATIC',
      name: 'Polygon',
      chainId: '0x89',
      priceUsd: 1,
      rankScore: 0,
    });
    const expensiveAsset = createTestCanonicalAsset({
      assetId: 'evm-eth',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ether',
      chainId: '0x1',
      priceUsd: 3000,
      rankScore: 0,
    });
    const unknownPriceAsset = createTestCanonicalAsset({
      assetId: 'evm-unknown',
      ecosystem: 'evm',
      symbol: 'UNKNOWN',
      name: 'Unknown',
      chainId: '0x1',
      priceUsd: 0,
      rankScore: 0,
    });

    expect(
      PortfolioFlowUtils.sortCanonicalAssetsByPriceUsd([
        cheapAsset,
        unknownPriceAsset,
        expensiveAsset,
      ]),
    ).toEqual([expensiveAsset, cheapAsset, unknownPriceAsset]);
  });

  it('sorts to assets by API rankScore descending by default', () => {
    const vaultAsset = createTestCanonicalAsset({
      assetId: 'evm-stata-wbtc',
      ecosystem: 'evm',
      symbol: 'stataPolWBTC',
      name: 'Static Aave Polygon WBTC',
      chainId: 'polygon',
      priceUsd: 79515,
      rankScore: 100,
    });
    const ethNative = createTestCanonicalAsset({
      assetId: 'evm-eth',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ether',
      chainId: 'ethereum',
      isNative: true,
      priceUsd: 1873,
      rankScore: 2900,
    });
    const usdcAsset = createTestCanonicalAsset({
      assetId: 'evm-usdc',
      ecosystem: 'evm',
      symbol: 'USDC',
      name: 'USD Coin',
      chainId: 'ethereum',
      priceUsd: 1,
      rankScore: 950,
    });
    const lpAsset = createTestCanonicalAsset({
      assetId: 'evm-lp',
      ecosystem: 'evm',
      symbol: 'sAMMV2-USDC/MAI',
      name: 'StableV2 AMM - USDC/MAI',
      chainId: 'optimism',
      priceUsd: 77574,
      rankScore: 50,
    });

    expect(
      PortfolioFlowUtils.sortCanonicalAssetsByRank([
        vaultAsset,
        lpAsset,
        usdcAsset,
        ethNative,
      ]),
    ).toEqual([ethNative, usdcAsset, vaultAsset, lpAsset]);

    expect(
      PortfolioFlowUtils.filterCanonicalAssets(
        [vaultAsset, lpAsset, usdcAsset, ethNative],
        { maxResults: 2 },
      ).assets,
    ).toEqual([ethNative, usdcAsset]);
  });

  it('uses chain rankScore as a tiebreaker when asset rankScores match', () => {
    const polygonUsdc = createTestCanonicalAsset({
      assetId: 'evm-usdc-polygon',
      ecosystem: 'evm',
      symbol: 'USDC',
      name: 'USD Coin',
      chainId: 'polygon',
      priceUsd: 1,
      rankScore: 100,
    });
    const ethereumUsdc = createTestCanonicalAsset({
      assetId: 'evm-usdc-ethereum',
      ecosystem: 'evm',
      symbol: 'USDC',
      name: 'USD Coin',
      chainId: 'ethereum',
      priceUsd: 1,
      rankScore: 100,
    });
    const portfolioChains = {
      ethereum: {
        id: 'ethereum',
        name: 'Ethereum',
        logoUrl: null,
        numericChainId: 1,
        rankScore: 9200,
      },
      polygon: {
        id: 'polygon',
        name: 'Polygon',
        logoUrl: null,
        numericChainId: 137,
        rankScore: 800,
      },
    };

    expect(
      PortfolioFlowUtils.sortCanonicalAssetsByRank(
        [polygonUsdc, ethereumUsdc],
        portfolioChains,
      ),
    ).toEqual([ethereumUsdc, polygonUsdc]);
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

  it('resolves hive portfolio row network logos from token symbol', () => {
    expect(
      PortfolioFlowUtils.resolveHivePortfolioRowNetworkLogoUrl('HIVE'),
    ).toBe('/assets/images/wallet/hive-logo.svg');
    expect(
      PortfolioFlowUtils.resolveHivePortfolioRowNetworkLogoUrl('HBD'),
    ).toBe('/assets/images/wallet/hive-logo.svg');
    expect(
      PortfolioFlowUtils.resolveHivePortfolioRowNetworkLogoUrl('DEC'),
    ).toBe('/assets/images/wallet/hive-engine.svg');
  });

  it('resolves canonical assets by slug-style chain references', () => {
    const slugEthAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm-0g-ethereum',
      ecosystem: 'evm',
      symbol: '0G',
      name: '0G',
      chainId: 'ethereum',
      logoUrl: 'https://example.com/0g.png',
      familyId: '0g',
    });
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

  it('prefers portfolio chain display metadata over local evm chains', () => {
    const arbitrumAsset: PortfolioCanonicalAsset = createTestCanonicalAsset({
      assetId: 'evm:native:arbitrum',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ether',
      chainId: 'arbitrum',
      logoUrl: null,
      familyId: 'eth',
    });
    const portfolioChains = {
      arbitrum: {
        id: 'arbitrum',
        name: 'Arbitrum One',
        logoUrl: 'https://example.com/arbitrum.svg',
        numericChainId: 42161,
        rankScore: 0,
      },
    };

    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(
        arbitrumAsset,
        [],
        portfolioChains,
      ),
    ).toBe('Arbitrum One');
    expect(
      PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(
        arbitrumAsset,
        [],
        portfolioChains,
      ),
    ).toBe('https://example.com/arbitrum.svg');
    expect(
      PortfolioFlowUtils.buildCanonicalAssetChainFilterOptions(
        [arbitrumAsset],
        [],
        portfolioChains,
      ),
    ).toEqual([
      expect.objectContaining({
        label: 'Arbitrum One',
        img: 'https://example.com/arbitrum.svg',
      }),
    ]);
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

  it('filters to assets based on the selected from asset ecosystem', () => {
    const assets = [
      hiveAsset,
      hbdAsset,
      hpAsset,
      hiveEngineAsset,
      ethAsset,
      sepoliaEthAsset,
      btcAsset,
    ];

    expect(
      PortfolioFlowUtils.filterToAssetsByFromAsset(assets, hiveEngineAsset),
    ).toEqual([hiveAsset, hbdAsset]);

    expect(
      PortfolioFlowUtils.filterToAssetsByFromAsset(assets, hiveAsset),
    ).toEqual(
      assets.filter(
        (asset) =>
          asset.assetId !== 'hive-hive' && asset.assetId !== 'hive-hp',
      ),
    );

    expect(
      PortfolioFlowUtils.filterToAssetsByFromAsset(assets, hbdAsset),
    ).toEqual([hiveAsset, hiveEngineAsset]);

    expect(
      PortfolioFlowUtils.filterToAssetsByFromAsset(assets, ethAsset),
    ).toEqual([hiveAsset, sepoliaEthAsset, btcAsset]);

    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(ethAsset, btcAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(hiveEngineAsset, ethAsset),
    ).toBe(false);
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(ethAsset, hbdAsset),
    ).toBe(false);
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(ethAsset, hiveAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(hbdAsset, ethAsset),
    ).toBe(false);
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(hiveAsset, hpAsset),
    ).toBe(false);
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(
        hiveEngineAsset,
        hiveEngineAsset,
      ),
    ).toBe(false);
    expect(
      PortfolioFlowUtils.filterToAssetsByFromAsset(assets, undefined),
    ).toEqual(assets.filter((asset) => asset.assetId !== 'hive-hp'));
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

  it('requires a destination address for external to-only assets', () => {
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(ethAsset, xrpAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.resolvePortfolioRecipientAddressLabelKey(xrpAsset),
    ).toBe('portfolio_recipient_destination_address');
    expect(
      PortfolioFlowUtils.isEligibleToAssetForFromAsset(ethAsset, xrpAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        fromAsset: ethAsset,
        toAsset: xrpAsset,
      }),
    ).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
  });

  it('requires a destination address for bitcoin to-only assets', () => {
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(ethAsset, btcAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.resolvePortfolioRecipientAddressLabelKey(btcAsset),
    ).toBe('portfolio_recipient_bitcoin_address');
  });

  it('accepts valid external destination addresses', () => {
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        fromAsset: ethAsset,
        toAsset: btcAsset,
      }),
    ).toBe('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: 'not-a-bitcoin-address',
        fromAsset: ethAsset,
        toAsset: btcAsset,
      }),
    ).toBeUndefined();
  });

  it('requires a separate recipient address for hive to evm and evm to hive swaps', () => {
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(hiveAsset, ethAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(ethAsset, hiveAsset),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(
        hiveEngineAsset,
        ethAsset,
      ),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(ethAsset, ethAsset),
    ).toBe(false);
    expect(
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(hiveAsset, hbdAsset),
    ).toBe(false);
  });

  it('defaults toAddress to fromAddress for same-ecosystem swaps', () => {
    const evmAddress = '0x0000000000000000000000000000000000000001';
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: evmAddress,
        recipientAddress: '',
        fromAsset: ethAsset,
        toAsset: sepoliaEthAsset,
      }),
    ).toBe(evmAddress);
  });

  it('uses the recipient address for cross-ecosystem swaps', () => {
    const evmAddress = '0x0000000000000000000000000000000000000001';
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: 'alice',
        recipientAddress: evmAddress,
        fromAsset: hiveAsset,
        toAsset: ethAsset,
      }),
    ).toBe(evmAddress);
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: evmAddress,
        recipientAddress: '@bob',
        fromAsset: ethAsset,
        toAsset: hiveAsset,
      }),
    ).toBe('bob');
  });

  it('rejects invalid cross-ecosystem recipient addresses', () => {
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: 'alice',
        recipientAddress: 'not-an-evm-address',
        fromAsset: hiveAsset,
        toAsset: ethAsset,
      }),
    ).toBeUndefined();
    expect(
      PortfolioFlowUtils.resolvePortfolioToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: '',
        fromAsset: ethAsset,
        toAsset: hiveAsset,
      }),
    ).toBeUndefined();
  });

  it('uses a placeholder toAddress for quote requests when recipient is missing', () => {
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
        fromAddress: 'alice',
        recipientAddress: '',
        fromAsset: hiveAsset,
        toAsset: ethAsset,
      }),
    ).toBe('0x0000000000000000000000000000000000000001');
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: '',
        fromAsset: ethAsset,
        toAsset: hiveAsset,
      }),
    ).toBe('portfolio');
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: '',
        fromAsset: ethAsset,
        toAsset: btcAsset,
      }),
    ).toBe('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
        fromAddress: '0x0000000000000000000000000000000000000001',
        recipientAddress: '',
        fromAsset: ethAsset,
        toAsset: xrpAsset,
      }),
    ).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
  });

  it('prefers a valid recipient over the quote placeholder', () => {
    const evmAddress = '0x00000000000000000000000000000000000000aa';
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
        fromAddress: 'alice',
        recipientAddress: evmAddress,
        fromAsset: hiveAsset,
        toAsset: ethAsset,
      }),
    ).toBe(evmAddress);
  });

  it('keeps same-ecosystem quote toAddress as fromAddress without a placeholder', () => {
    const evmAddress = '0x0000000000000000000000000000000000000001';
    expect(
      PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
        fromAddress: evmAddress,
        recipientAddress: '',
        fromAsset: ethAsset,
        toAsset: sepoliaEthAsset,
      }),
    ).toBe(evmAddress);
  });

  it('builds format-valid quote placeholder addresses per destination ecosystem', () => {
    expect(
      PortfolioFlowUtils.isValidPortfolioRecipientAddress(
        PortfolioFlowUtils.resolvePortfolioQuotePlaceholderAddress(ethAsset),
        'evm',
      ),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.isValidPortfolioRecipientAddress(
        PortfolioFlowUtils.resolvePortfolioQuotePlaceholderAddress(hiveAsset),
        'hive',
      ),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.isValidPortfolioRecipientAddress(
        PortfolioFlowUtils.resolvePortfolioQuotePlaceholderAddress(btcAsset),
        'utxo',
        'bitcoin',
      ),
    ).toBe(true);
    expect(
      PortfolioFlowUtils.isValidPortfolioRecipientAddress(
        PortfolioFlowUtils.resolvePortfolioQuotePlaceholderAddress(xrpAsset),
        'external',
        'ripple',
      ),
    ).toBe(true);
  });
});

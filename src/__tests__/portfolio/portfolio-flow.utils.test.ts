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
});

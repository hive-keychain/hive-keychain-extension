import { PortfolioAllocationUtils } from 'src/portfolio/portfolio-allocation.utils';

describe('PortfolioAllocationUtils', () => {
  const rows = [
    {
      key: 'eth',
      symbol: 'eth',
      network: 'Ethereum',
      usdValue: 100,
    },
    {
      key: 'matic',
      symbol: 'MATIC',
      network: 'Polygon',
      usdValue: 10,
    },
    {
      key: 'dust',
      symbol: 'DUST',
      network: 'Ethereum',
      usdValue: 0,
    },
    {
      key: 'unknown',
      symbol: 'UNKNOWN',
      network: 'Base',
      usdValue: null,
    },
  ];

  it('sums priced rows and splits the donut by each token value', () => {
    const allocation = PortfolioAllocationUtils.buildPortfolioAllocation(rows);

    expect(allocation.totalUsd).toBe(110);
    expect(allocation.hasKnownValue).toBe(true);
    expect(allocation.slices.map((slice) => slice.key)).toEqual([
      'eth',
      'matic',
    ]);
    expect(allocation.slices[0]).toMatchObject({
      symbol: 'ETH',
      network: 'Ethereum',
      usdValue: 100,
      color: PortfolioAllocationUtils.ALLOCATION_COLORS[0],
    });
    expect(allocation.slices[0].share).toBeCloseTo(100 / 110);
    expect(allocation.slices[1].share).toBeCloseTo(10 / 110);
    expect(
      PortfolioAllocationUtils.formatPortfolioAllocationPercent(
        allocation.slices[0].share,
      ),
    ).toBe('90.9%');
    expect(
      PortfolioAllocationUtils.formatPortfolioAllocationPercent(
        allocation.slices[1].share,
      ),
    ).toBe('9.1%');
  });

  it('returns an empty allocation when nothing on screen has a price', () => {
    const allocation = PortfolioAllocationUtils.buildPortfolioAllocation([
      {
        key: 'unknown',
        symbol: 'UNKNOWN',
        network: 'Base',
        usdValue: null,
      },
    ]);

    expect(allocation).toEqual({
      totalUsd: 0,
      hasKnownValue: false,
      slices: [],
    });
  });

  it('labels a full holding as 100% and dust below a tenth of a percent', () => {
    expect(PortfolioAllocationUtils.formatPortfolioAllocationPercent(1)).toBe(
      '100%',
    );
    expect(PortfolioAllocationUtils.formatPortfolioAllocationPercent(0)).toBe(
      '0%',
    );
    expect(
      PortfolioAllocationUtils.formatPortfolioAllocationPercent(0.0002),
    ).toBe('<0.1%');
  });
});

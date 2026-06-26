import { SVGIcons } from 'src/common-ui/icons.enum';
import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import { PortfolioHistoryDisplayUtils } from 'src/portfolio/ui/portfolio-history-display.utils';

const createAsset = (
  overrides: Partial<PortfolioCanonicalAsset> = {},
): PortfolioCanonicalAsset => ({
  assetId: 'evm:token:ethereum:0xabc',
  ecosystem: 'evm',
  symbol: 'USDC',
  name: 'USD Coin',
  chainId: 'ethereum',
  address: '0xabc',
  decimals: 6,
  isNative: false,
  familyId: 'usdc',
  logoUrl: null,
  ...overrides,
});

describe('PortfolioHistoryDisplayUtils', () => {
  describe('getPortfolioHistoryStatusKind', () => {
    it('maps completed-like statuses to completed regardless of casing', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('COMPLETED'),
      ).toBe('completed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind(' finished '),
      ).toBe('completed');
    });

    it('maps failure-like statuses to failed', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('refunded'),
      ).toBe('failed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('Expired'),
      ).toBe('failed');
    });

    it('falls back to pending for unknown statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('awaiting_deposit'),
      ).toBe('pending');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind(''),
      ).toBe('pending');
    });
  });

  describe('getPortfolioHistoryStatusIcon', () => {
    it('returns the matching swap status icon per kind', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon('completed'),
      ).toBe(SVGIcons.SWAPS_STATUS_FINISHED);
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon('failed'),
      ).toBe(SVGIcons.SWAPS_STATUS_CANCELED);
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon('pending'),
      ).toBe(SVGIcons.SWAPS_STATUS_PROCESSING);
    });
  });

  describe('getPortfolioHistoryStatusMessageKey', () => {
    it('returns the matching translation key per kind', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey('done'),
      ).toBe('portfolio_history_status_completed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey('error'),
      ).toBe('portfolio_history_status_failed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey('created'),
      ).toBe('portfolio_history_status_pending');
    });
  });

  describe('isCreatedOrExpiredHistoryStatus', () => {
    it('flags created and expired statuses regardless of casing', () => {
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus('created'),
      ).toBe(true);
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus(' EXPIRED '),
      ).toBe(true);
    });

    it('does not flag other statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus('completed'),
      ).toBe(false);
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus('pending'),
      ).toBe(false);
    });
  });

  describe('formatPortfolioHistoryAmount', () => {
    it('formats numeric amounts with commas and trims trailing zeros', () => {
      expect(
        PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount('1234.5000'),
      ).toBe('1,234.5');
    });

    it('returns an empty string for missing amounts', () => {
      expect(
        PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount(null),
      ).toBe('');
    });

    it('returns the original value when it is not numeric', () => {
      expect(
        PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount('n/a'),
      ).toBe('n/a');
    });
  });

  describe('resolvePortfolioAssetById', () => {
    it('finds the matching asset by assetId', () => {
      const asset = createAsset();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
          asset.assetId,
          [asset],
        ),
      ).toBe(asset);
    });

    it('returns undefined for a null id or missing asset', () => {
      const asset = createAsset();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(null, [asset]),
      ).toBeUndefined();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById('unknown', [asset]),
      ).toBeUndefined();
    });
  });

  describe('getPortfolioHistoryAssetSymbol', () => {
    it('prefers the resolved asset symbol', () => {
      const asset = createAsset({ symbol: 'WETH' });
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
          asset.assetId,
          asset,
        ),
      ).toBe('WETH');
    });

    it('derives an uppercase symbol from non-address asset id tails', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol('hive:hive'),
      ).toBe('HIVE');
    });

    it('shortens contract addresses when no symbol is available', () => {
      const result = PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
        'evm:token:ethereum:0x1234567890abcdef1234567890abcdef12345678',
      );
      expect(result).toContain('...');
    });

    it('returns an empty string for a null id', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(null),
      ).toBe('');
    });
  });
});

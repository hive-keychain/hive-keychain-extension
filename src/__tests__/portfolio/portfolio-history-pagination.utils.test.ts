import { PortfolioHistoryItem } from 'src/portfolio/portfolio-api.interface';
import { PortfolioHistoryPaginationUtils } from 'src/portfolio/portfolio-history-pagination.utils';

const createHistoryItem = (
  id: string,
  overrides: Partial<PortfolioHistoryItem> = {},
): PortfolioHistoryItem => ({
  id,
  status: 'completed',
  displayStatus: 'completed',
  mode: 'swap',
  provider: 'lifi',
  providerReferenceId: null,
  fromAssetId: 'evm:native:ethereum',
  toAssetId: 'evm:native:polygon',
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
  executionType: 'in_app',
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
  ...overrides,
});

describe('PortfolioHistoryPaginationUtils', () => {
  describe('dedupePortfolioHistoryItems', () => {
    it('keeps the first occurrence of each id', () => {
      const first = createHistoryItem('a', { status: 'pending' });
      const duplicate = createHistoryItem('a', { status: 'completed' });
      const other = createHistoryItem('b');

      expect(
        PortfolioHistoryPaginationUtils.dedupePortfolioHistoryItems([
          first,
          duplicate,
          other,
        ]),
      ).toEqual([first, other]);
    });
  });

  describe('mergePortfolioHistoryPageOne', () => {
    it('replaces the list when only page 1 is loaded', () => {
      const current = [
        createHistoryItem('a'),
        createHistoryItem('b'),
      ];
      const pageOne = [
        createHistoryItem('n'),
        createHistoryItem('a', { status: 'submitted' }),
      ];

      expect(
        PortfolioHistoryPaginationUtils.mergePortfolioHistoryPageOne(
          current,
          pageOne,
          1,
        ),
      ).toEqual(pageOne);
    });

    it('prepends refreshed page 1 and keeps older loaded pages', () => {
      const current = [
        createHistoryItem('a'),
        createHistoryItem('b'),
        createHistoryItem('c'),
      ];
      const pageOne = [
        createHistoryItem('n'),
        createHistoryItem('a', { status: 'completed' }),
      ];

      expect(
        PortfolioHistoryPaginationUtils.mergePortfolioHistoryPageOne(
          current,
          pageOne,
          2,
        ).map((item) => item.id),
      ).toEqual(['n', 'a', 'b', 'c']);
    });

    it('uses the refreshed page-1 version when an id already exists', () => {
      const current = [
        createHistoryItem('a', { status: 'pending' }),
        createHistoryItem('b'),
      ];
      const refreshed = createHistoryItem('a', { status: 'completed' });

      const merged =
        PortfolioHistoryPaginationUtils.mergePortfolioHistoryPageOne(
          current,
          [refreshed],
          2,
        );

      expect(merged[0]).toBe(refreshed);
      expect(merged.map((item) => item.id)).toEqual(['a', 'b']);
    });
  });

  describe('appendPortfolioHistoryPage', () => {
    it('appends the next page and skips ids already loaded', () => {
      const current = [createHistoryItem('a'), createHistoryItem('b')];
      const nextPage = [
        createHistoryItem('b', { status: 'failed' }),
        createHistoryItem('c'),
      ];

      expect(
        PortfolioHistoryPaginationUtils.appendPortfolioHistoryPage(
          current,
          nextPage,
        ).map((item) => item.id),
      ).toEqual(['a', 'b', 'c']);
    });
  });
});

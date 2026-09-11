import { PortfolioHistoryItem } from 'src/portfolio/portfolio-api.interface';

const dedupePortfolioHistoryItems = (
  items: PortfolioHistoryItem[],
): PortfolioHistoryItem[] => {
  const seenIds = new Set<string>();
  const uniqueItems: PortfolioHistoryItem[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) {
      continue;
    }
    seenIds.add(item.id);
    uniqueItems.push(item);
  }

  return uniqueItems;
};

/**
 * Applies a page-1 refresh onto already-loaded pages.
 * Offset paging shifts later rows when new items appear at the top, so extra
 * pages are kept and matched ids take the refreshed page-1 version.
 */
const mergePortfolioHistoryPageOne = (
  currentItems: PortfolioHistoryItem[],
  pageOneItems: PortfolioHistoryItem[],
  loadedPageCount: number,
): PortfolioHistoryItem[] => {
  if (loadedPageCount <= 1) {
    return dedupePortfolioHistoryItems(pageOneItems);
  }

  const pageOneIds = new Set(pageOneItems.map((item) => item.id));
  const olderItems = currentItems.filter((item) => !pageOneIds.has(item.id));
  return dedupePortfolioHistoryItems([...pageOneItems, ...olderItems]);
};

const appendPortfolioHistoryPage = (
  currentItems: PortfolioHistoryItem[],
  nextPageItems: PortfolioHistoryItem[],
): PortfolioHistoryItem[] =>
  dedupePortfolioHistoryItems([...currentItems, ...nextPageItems]);

export const PortfolioHistoryPaginationUtils = {
  dedupePortfolioHistoryItems,
  mergePortfolioHistoryPageOne,
  appendPortfolioHistoryPage,
};

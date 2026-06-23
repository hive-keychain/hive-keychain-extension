import {
  PortfolioQuote,
  PortfolioQuoteFee,
} from 'src/portfolio/portfolio-api.interface';

export type PortfolioQuoteDetailRow = {
  key: string;
  labelKey: string;
  value: string;
};

const formatPortfolioQuoteFee = (fee: PortfolioQuoteFee | null): string | null => {
  if (!fee?.amount || !fee.currency) {
    return null;
  }

  return `${fee.amount} ${fee.currency}`;
};

const formatPortfolioQuoteEnumLabel = (value: string): string =>
  value.replace(/_/g, ' ');

const getPortfolioQuoteDetailRows = (quote: PortfolioQuote): PortfolioQuoteDetailRow[] => {
  const rows: PortfolioQuoteDetailRow[] = [];

  const providerFee = formatPortfolioQuoteFee(quote.providerFee);
  if (providerFee) {
    rows.push({
      key: 'provider-fee',
      labelKey: 'portfolio_quote_provider_fee',
      value: providerFee,
    });
  }

  const networkFee = formatPortfolioQuoteFee(quote.networkFeeEstimate);
  if (networkFee) {
    rows.push({
      key: 'network-fee',
      labelKey: 'portfolio_quote_network_fee',
      value: networkFee,
    });
  }

  return rows;
};

export const PortfolioQuoteDisplayUtils = {
  formatPortfolioQuoteEnumLabel,
  formatPortfolioQuoteFee,
  getPortfolioQuoteDetailRows,
};

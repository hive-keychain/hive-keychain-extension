import {
  PortfolioCanonicalAsset,
  PortfolioQuote,
  PortfolioQuoteFee,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';
import { ConfirmationPageFields } from 'src/common-ui/confirmation-page/confirmation-page.interface';

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

const formatPortfolioConfirmationTokenAmount = (
  amount: string,
  asset: PortfolioCanonicalAsset | null | undefined,
): string => {
  const symbol = asset?.symbol?.trim();
  return symbol ? `${amount} ${symbol}` : amount;
};

export type PortfolioInAppConfirmationFieldInput = {
  quote: PortfolioQuote;
  fromAsset?: PortfolioCanonicalAsset | null;
  toAsset?: PortfolioCanonicalAsset | null;
  fromAddress: string;
  toAddress: string;
};

const buildPortfolioInAppConfirmationFields = (
  input: PortfolioInAppConfirmationFieldInput,
): ConfirmationPageFields[] => {
  const { quote, fromAsset, toAsset, fromAddress, toAddress } = input;
  const resolvedFromAsset = quote.fromAsset ?? fromAsset ?? null;
  const resolvedToAsset = quote.toAsset ?? toAsset ?? null;

  const fields: ConfirmationPageFields[] = [
    {
      label: 'portfolio_confirmation_from',
      value: formatPortfolioConfirmationTokenAmount(
        quote.fromAmount,
        resolvedFromAsset,
      ),
    },
    {
      label: 'portfolio_confirmation_to',
      value: formatPortfolioConfirmationTokenAmount(
        quote.estimatedToAmount,
        resolvedToAsset,
      ),
    },
  ];

  if (
    PortfolioFlowUtils.requiresPortfolioRecipientAddress(
      resolvedFromAsset ?? undefined,
      resolvedToAsset ?? undefined,
    ) &&
    toAddress &&
    toAddress !== fromAddress
  ) {
    fields.push({
      label: 'portfolio_confirmation_to_account',
      value: toAddress,
    });
  }

  fields.push({
    label: 'portfolio_provider',
    value: quote.providerName || quote.provider,
  });

  return fields;
};

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
  buildPortfolioInAppConfirmationFields,
  formatPortfolioConfirmationTokenAmount,
  formatPortfolioQuoteEnumLabel,
  formatPortfolioQuoteFee,
  getPortfolioQuoteDetailRows,
};

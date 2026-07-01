import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import {
  PortfolioCanonicalAsset,
  PortfolioQuote,
  PortfolioQuoteFee,
} from 'src/portfolio/portfolio-api.interface';
import {
  isDestinationOnlyPortfolioEcosystem,
  isHivePortfolioEcosystem,
  PortfolioFlowUtils,
} from 'src/portfolio/portfolio-flow.utils';
import {
  ConfirmationPageFields,
  ConfirmationPageFieldType,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';

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

const buildPortfolioConfirmationAmountField = (
  label: string,
  amount: string,
  asset: PortfolioCanonicalAsset | null | undefined,
): ConfirmationPageFields => {
  const symbol = asset?.symbol?.trim();
  return {
    label,
    value: amount,
    tag: ConfirmationPageFieldType.AMOUNT,
    tokenSymbol: symbol || undefined,
    tokenLogoUrl: asset?.logoUrl ?? undefined,
  };
};

const buildPortfolioConfirmationRecipientField = (
  toAddress: string,
  asset: PortfolioCanonicalAsset | null | undefined,
): ConfirmationPageFields => {
  if (asset && isHivePortfolioEcosystem(asset.ecosystem)) {
    return {
      label: 'portfolio_confirmation_to_account',
      value: toAddress,
      tag: ConfirmationPageFieldType.USERNAME,
    };
  }

  if (asset && isDestinationOnlyPortfolioEcosystem(asset.ecosystem)) {
    return {
      label: 'portfolio_confirmation_to_account',
      value: toAddress,
    };
  }

  return {
    label: 'portfolio_confirmation_to_account',
    value: EvmFormatUtils.formatAddress(toAddress),
  };
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
    buildPortfolioConfirmationAmountField(
      'portfolio_confirmation_from',
      quote.fromAmount,
      resolvedFromAsset,
    ),
    buildPortfolioConfirmationAmountField(
      'portfolio_confirmation_to',
      quote.estimatedToAmount,
      resolvedToAsset,
    ),
  ];

  if (
    PortfolioFlowUtils.requiresPortfolioRecipientAddress(
      resolvedFromAsset ?? undefined,
      resolvedToAsset ?? undefined,
    ) &&
    toAddress &&
    toAddress !== fromAddress
  ) {
    fields.push(
      buildPortfolioConfirmationRecipientField(toAddress, resolvedToAsset),
    );
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
  formatPortfolioQuoteEnumLabel,
  formatPortfolioQuoteFee,
  getPortfolioQuoteDetailRows,
};

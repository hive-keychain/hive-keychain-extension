import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import {
  ConfirmationPageFields,
  ConfirmationPageFieldType,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import {
  PortfolioCanonicalAsset,
  PortfolioChainDisplayRecord,
  PortfolioQuote,
  PortfolioQuoteFee,
} from 'src/portfolio/portfolio-api.interface';
import {
  isDestinationOnlyPortfolioEcosystem,
  isHivePortfolioEcosystem,
  PortfolioFlowUtils,
} from 'src/portfolio/portfolio-flow.utils';
import { PortfolioProviderValue } from 'src/portfolio/ui/portfolio-provider-value.component';

export type PortfolioQuoteDetailRow = {
  key: string;
  labelKey: string;
  value: string;
};

const formatPortfolioQuoteFee = (fee: PortfolioQuoteFee | null): string | null => {
  if (!fee?.amount || !fee.currency) {
    return null;
  }

  return `${fee.amount} ${fee.currency.trim().toUpperCase()}`;
};

const formatPortfolioQuoteEnumLabel = (value: string): string =>
  value.replace(/_/g, ' ');

const buildPortfolioConfirmationAmountField = (
  label: string,
  amount: string,
  asset: PortfolioCanonicalAsset | null | undefined,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): ConfirmationPageFields => {
  const symbol = asset?.symbol?.trim();
  const tokenNetwork = asset
    ? PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(
        asset,
        chains,
        portfolioChains,
      )
    : undefined;
  const tokenNetworkLogoUrl = asset
    ? PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(
        asset,
        chains,
        portfolioChains,
      ) ?? undefined
    : undefined;

  return {
    label,
    value: amount,
    tag: ConfirmationPageFieldType.AMOUNT,
    tokenSymbol: symbol || undefined,
    tokenLogoUrl: asset?.logoUrl ?? undefined,
    tokenNetwork: tokenNetwork || undefined,
    tokenNetworkLogoUrl,
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
  chains?: EvmChain[];
  portfolioChains?: PortfolioChainDisplayRecord;
};

const buildPortfolioInAppConfirmationFields = (
  input: PortfolioInAppConfirmationFieldInput,
): ConfirmationPageFields[] => {
  const {
    quote,
    fromAsset,
    toAsset,
    fromAddress,
    toAddress,
    chains = [],
    portfolioChains = {},
  } = input;
  const resolvedFromAsset = quote.fromAsset ?? fromAsset ?? null;
  const resolvedToAsset = quote.toAsset ?? toAsset ?? null;

  const fields: ConfirmationPageFields[] = [
    buildPortfolioConfirmationAmountField(
      'portfolio_confirmation_from',
      quote.fromAmount,
      resolvedFromAsset,
      chains,
      portfolioChains,
    ),
    buildPortfolioConfirmationAmountField(
      'portfolio_confirmation_to',
      quote.estimatedToAmount,
      resolvedToAsset,
      chains,
      portfolioChains,
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

  const providerLabel = quote.providerName || quote.provider;
  fields.push({
    label: 'portfolio_provider',
    value: React.createElement(PortfolioProviderValue, {
      label: providerLabel,
      logoUrl: quote.providerLogoUrl,
    }),
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

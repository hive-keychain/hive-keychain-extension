import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import {
  ConfirmationPageFields,
  ConfirmationPageFieldType,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import {
  isPortfolioHiveTransaction,
  PortfolioCanonicalAsset,
  PortfolioChainDisplayRecord,
  PortfolioHiveTransaction,
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
  value?: string;
  valueKey?: string;
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

const resolveHiveCustomJsonProviderAccount = (
  json: string,
): string | undefined => {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }

    const payload = (parsed as { contractPayload?: unknown }).contractPayload;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return undefined;
    }

    const to = (payload as { to?: unknown }).to;
    if (typeof to !== 'string') {
      return undefined;
    }

    const normalized = PortfolioFlowUtils.normalizePortfolioRecipientAddress(to);
    return normalized || undefined;
  } catch {
    return undefined;
  }
};

const resolveHiveProviderAccount = (
  transaction: PortfolioHiveTransaction | null | undefined,
): string | undefined => {
  if (!transaction) {
    return undefined;
  }

  for (const operation of transaction.operations) {
    if (operation[0] === 'transfer') {
      const to = PortfolioFlowUtils.normalizePortfolioRecipientAddress(
        operation[1].to ?? '',
      );
      if (to) {
        return to;
      }
    }

    if (operation[0] === 'custom_json') {
      const to = resolveHiveCustomJsonProviderAccount(operation[1].json);
      if (to) {
        return to;
      }
    }
  }

  return undefined;
};

const resolveHiveConfirmationTransaction = (
  quote: PortfolioQuote,
  hiveTransaction?: PortfolioHiveTransaction | null,
): PortfolioHiveTransaction | null => {
  if (hiveTransaction) {
    return hiveTransaction;
  }

  if (quote.transaction && isPortfolioHiveTransaction(quote.transaction)) {
    return quote.transaction;
  }

  return null;
};

export type PortfolioInAppConfirmationFieldInput = {
  quote: PortfolioQuote;
  fromAsset?: PortfolioCanonicalAsset | null;
  toAsset?: PortfolioCanonicalAsset | null;
  fromAddress: string;
  toAddress: string;
  chains?: EvmChain[];
  portfolioChains?: PortfolioChainDisplayRecord;
  hiveTransaction?: PortfolioHiveTransaction | null;
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
    hiveTransaction,
  } = input;
  const resolvedFromAsset = quote.fromAsset ?? fromAsset ?? null;
  const resolvedToAsset = quote.toAsset ?? toAsset ?? null;
  const fields: ConfirmationPageFields[] = [];

  if (
    fromAddress &&
    resolvedFromAsset &&
    isHivePortfolioEcosystem(resolvedFromAsset.ecosystem)
  ) {
    fields.push({
      label: 'portfolio_confirmation_account',
      value: fromAddress,
      tag: ConfirmationPageFieldType.USERNAME,
    });
  }

  fields.push(
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
  );

  const showsRecipient = Boolean(
    PortfolioFlowUtils.requiresPortfolioRecipientAddress(
      resolvedFromAsset ?? undefined,
      resolvedToAsset ?? undefined,
    ) &&
      toAddress &&
      toAddress !== fromAddress,
  );
  const providerAccount = resolveHiveProviderAccount(
    resolveHiveConfirmationTransaction(quote, hiveTransaction),
  );
  if (
    providerAccount &&
    providerAccount !== fromAddress &&
    !(showsRecipient && providerAccount === toAddress)
  ) {
    fields.push({
      label: 'portfolio_confirmation_provider_account',
      value: providerAccount,
      tag: ConfirmationPageFieldType.USERNAME,
    });
  }

  if (showsRecipient) {
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
      kyc: quote.kyc,
    }),
  });

  return fields;
};

const getPortfolioQuoteDetailRows = (quote: PortfolioQuote): PortfolioQuoteDetailRow[] => {
  const rows: PortfolioQuoteDetailRow[] = [];

  const providerFee = formatPortfolioQuoteFee(quote.providerFee);
  rows.push(
    providerFee
      ? {
          key: 'provider-fee',
          labelKey: 'portfolio_quote_provider_fee',
          value: providerFee,
        }
      : {
          key: 'provider-fee',
          labelKey: 'portfolio_quote_provider_fee',
          valueKey: 'portfolio_quote_provider_fee_undisclosed',
        },
  );

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

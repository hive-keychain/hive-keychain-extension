import { CustomTooltip } from '@common-ui/custom-tooltip/custom-tooltip.component';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import moment from 'moment';
import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  PortfolioCanonicalAsset,
  PortfolioChainDisplayRecord,
  PortfolioHistoryItem,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioFiatLocaleUtils } from 'src/portfolio/portfolio-fiat-locale.utils';
import { PortfolioAccountAvatar } from 'src/portfolio/ui/portfolio-account-avatar.component';
import { PortfolioHistoryDisplayUtils } from 'src/portfolio/ui/portfolio-history-display.utils';
import {
  canonicalAssetToTokenIdentityProps,
  PortfolioTokenIdentity,
  PortfolioTokenIdentityProps,
} from 'src/portfolio/ui/portfolio-token-identity.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { EvmAddressUtils } from 'src/utils/evm/evm-address.utils';
import FormatUtils from 'src/utils/format.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

import './portfolio-history-card.component.scss';

export interface PortfolioHistoryCardProps {
  item: PortfolioHistoryItem;
  fromAsset?: PortfolioCanonicalAsset;
  toAsset?: PortfolioCanonicalAsset;
  chains: EvmChain[];
  portfolioChains?: PortfolioChainDisplayRecord;
}

const DATE_TOOLTIP_FORMAT = 'YYYY-MM-DD HH:mm';

const resolveTokenIdentity = (
  assetId: string | null,
  asset: PortfolioCanonicalAsset | undefined,
  chains: EvmChain[],
  portfolioChains: PortfolioChainDisplayRecord = {},
  fiatCurrency: string | null = null,
): PortfolioTokenIdentityProps => {
  if (asset) {
    return canonicalAssetToTokenIdentityProps(asset, chains, portfolioChains);
  }

  const symbol = PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
    assetId,
    undefined,
    fiatCurrency,
  );

  if (!assetId && fiatCurrency?.trim()) {
    return {
      symbol,
      avatarFallback:
        PortfolioFiatLocaleUtils.getFiatCurrencyNarrowSymbol(fiatCurrency),
    };
  }

  return { symbol };
};

export const PortfolioHistoryCard = ({
  item,
  fromAsset,
  toAsset,
  chains,
  portfolioChains = {},
}: PortfolioHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fromIdentity = resolveTokenIdentity(
    item.fromAssetId,
    fromAsset,
    chains,
    portfolioChains,
    item.fromAssetId ? null : item.fiatCurrency,
  );
  const toIdentity = resolveTokenIdentity(
    item.toAssetId,
    toAsset,
    chains,
    portfolioChains,
    item.toAssetId ? null : item.fiatCurrency,
  );

  const fromAmount = PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount(
    item.fromAmount,
  );
  const displayToAmount =
    PortfolioHistoryDisplayUtils.resolvePortfolioHistoryDisplayToAmount(item);
  const toAmount = PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount(
    displayToAmount,
  );

  const statusIcon = PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon(
    item,
  );
  const statusLabel = I18nUtils.getMessage(
    PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLabelKey(item),
  );
  const failureActionKey =
    PortfolioHistoryDisplayUtils.resolvePortfolioHistoryFailureActionMessageKey(
      item.failureAction,
    );
  const failureActionLabel = failureActionKey
    ? I18nUtils.getMessage(failureActionKey)
    : null;
  const statusLink = PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
    item,
    fromAsset,
    toAsset,
    chains,
  );

  const eventDate = item.submittedAt ?? item.updatedAt;
  const relativeDate = eventDate
    ? moment(eventDate).fromNow()
    : I18nUtils.getMessage('portfolio_history_unknown_date');
  const fullDate = eventDate
    ? moment(eventDate).format(DATE_TOOLTIP_FORMAT)
    : null;

  const modeLabel = item.mode
    ? I18nUtils.getMessage(`portfolio_section_${item.mode}`)
    : '';
  const providerLabel = item.providerName ?? item.provider.replace(/_/g, ' ');

  const renderAddressValue = (address: string): React.ReactNode => {
    if (EvmAddressUtils.isValidEvmAddress(address)) {
      return (
        <span className="portfolio-history-card__address">
          <PortfolioAccountAvatar
            kind="evm"
            address={address}
            className="portfolio-history-card__address-avatar"
          />
          <span className="portfolio-history-card__address-label">
            {EvmFormatUtils.formatAddress(address)}
          </span>
        </span>
      );
    }

    const username = String(address).replace(/^@+/, '');
    return (
      <span className="portfolio-history-card__address">
        <PortfolioAccountAvatar
          kind="hive"
          username={username}
          className="portfolio-history-card__address-avatar"
        />
        <span className="portfolio-history-card__address-label">
          @{username}
        </span>
      </span>
    );
  };

  const renderCopyableValue = (value: string): React.ReactNode => {
    const display =
      value.length > 16 ? FormatUtils.shortenString(value, 6) : value;

    const copyButton = (
      <button
        type="button"
        className="portfolio-history-card__copyable"
        title={I18nUtils.getMessage('html_popup_copy')}
        onClick={() => void copyTextWithToast(value, COPY_GENERIC_MESSAGE_KEY)}>
        <span className="portfolio-history-card__copyable-text">{display}</span>
        <SVGIcon
          icon={SVGIcons.SELECT_COPY}
          className="portfolio-history-card__copy-icon"
        />
      </button>
    );

    if (display === value) {
      return copyButton;
    }

    return (
      <CustomTooltip message={value} skipTranslation position="left">
        {copyButton}
      </CustomTooltip>
    );
  };

  const renderProviderValue = (): React.ReactNode => (
    <span className="portfolio-history-card__provider">
      {item.providerLogoUrl ? (
        <PortfolioLogoImage
          className="portfolio-history-card__provider-logo"
          src={item.providerLogoUrl}
        />
      ) : null}
      <span className="portfolio-history-card__provider-label">
        {providerLabel}
      </span>
    </span>
  );

  const detailRows: { label: string; value: React.ReactNode }[] = [];

  if (providerLabel) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_provider'),
      value: renderProviderValue(),
    });
  }

  const formatExactAmountValue = (
    amount: string,
    symbol: string,
  ): string => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    return normalizedSymbol ? `${amount} ${normalizedSymbol}` : amount;
  };

  if (item.fromAmount) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_exact_from_amount'),
      value: renderCopyableValue(
        formatExactAmountValue(item.fromAmount, fromIdentity.symbol),
      ),
    });
  }
  if (item.receivedAmount) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_received_amount'),
      value: renderCopyableValue(
        formatExactAmountValue(item.receivedAmount, toIdentity.symbol),
      ),
    });
  }
  if (
    item.toAmount &&
    (!item.receivedAmount || item.toAmount.trim() !== item.receivedAmount.trim())
  ) {
    detailRows.push({
      label: I18nUtils.getMessage(
        item.receivedAmount
          ? 'portfolio_history_estimated_to_amount'
          : 'portfolio_history_exact_to_amount',
      ),
      value: renderCopyableValue(
        formatExactAmountValue(item.toAmount, toIdentity.symbol),
      ),
    });
  }
  if (item.fiatCurrency) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_fiat_currency'),
      value: item.fiatCurrency.trim().toUpperCase(),
    });
  }
  if (item.paymentMethod) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_payment_method'),
      value: PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: item.paymentMethod,
        label: '',
      }),
    });
  }

  const normalizeAddress = (address: string): string =>
    address.replace(/^@+/, '').toLowerCase();
  const hasSameAccount =
    !!item.fromAddress &&
    !!item.toAddress &&
    normalizeAddress(item.fromAddress) === normalizeAddress(item.toAddress);

  if (hasSameAccount && item.fromAddress) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_account'),
      value: renderAddressValue(item.fromAddress),
    });
  } else {
    if (item.fromAddress) {
      detailRows.push({
        label: I18nUtils.getMessage('portfolio_history_from'),
        value: renderAddressValue(item.fromAddress),
      });
    }
    if (item.toAddress) {
      detailRows.push({
        label: I18nUtils.getMessage('portfolio_history_to'),
        value: renderAddressValue(item.toAddress),
      });
    }
  }
  if (item.providerReferenceId) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_provider_reference'),
      value: renderCopyableValue(item.providerReferenceId),
    });
  }
  if (statusLink) {
    const statusLinkLabel =
      statusLink.kind === 'provider'
        ? I18nUtils.getMessage('portfolio_history_view_on_provider', [
            providerLabel,
          ])
        : I18nUtils.getMessage('portfolio_history_view_on_explorer');
    detailRows.push({
      label: I18nUtils.getMessage(
        statusLink.kind === 'provider'
          ? 'portfolio_history_provider_status'
          : 'portfolio_history_block_explorer',
      ),
      value: (
        <button
          type="button"
          className="portfolio-history-card__action-link"
          onClick={() => {
            chrome.tabs.create({ url: statusLink.url });
          }}>
          {statusLinkLabel}
        </button>
      ),
    });
  }
  if (item.submittedAt) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_submitted_at'),
      value: moment(item.submittedAt).format(DATE_TOOLTIP_FORMAT),
    });
  }
  if (item.updatedAt) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_updated_at'),
      value: moment(item.updatedAt).format(DATE_TOOLTIP_FORMAT),
    });
  }
  if (item.txHash) {
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_tx_hash'),
      value: renderCopyableValue(item.txHash),
    });
  }
  if (failureActionLabel) {
    const supportActionUrl =
      PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl(item);
    detailRows.push({
      label: I18nUtils.getMessage('portfolio_history_suggested_action'),
      value: supportActionUrl ? (
        <button
          type="button"
          className="portfolio-history-card__action-link"
          onClick={() => {
            chrome.tabs.create({ url: supportActionUrl });
          }}>
          {failureActionLabel}
        </button>
      ) : (
        failureActionLabel
      ),
    });
  }

  const renderLeg = (
    side: 'from' | 'to',
    label: string,
    amount: string,
    identity: PortfolioTokenIdentityProps,
  ) => (
    <>
      <span
        className={`portfolio-history-card__leg-label portfolio-history-card__leg-label--${side}`}>
        {label}
      </span>
      <span
        className={`portfolio-history-card__leg-amount portfolio-history-card__leg-amount--${side}`}>
        {amount || '\u00a0'}
      </span>
      <div
        className={`portfolio-history-card__leg-identity portfolio-history-card__leg-identity--${side}`}>
        <PortfolioTokenIdentity {...identity} />
      </div>
    </>
  );

  return (
    <div className="portfolio-history-card">
      <button
        type="button"
        className="portfolio-history-card__summary"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((previous) => !previous)}>
        <div className="portfolio-history-card__swap">
          {renderLeg(
            'from',
            I18nUtils.getMessage('portfolio_history_from'),
            fromAmount,
            fromIdentity,
          )}
          <SVGIcon
            icon={SVGIcons.SWAPS_BETWEEN}
            className="portfolio-history-card__between"
          />
          {renderLeg(
            'to',
            I18nUtils.getMessage('portfolio_history_to'),
            toAmount,
            toIdentity,
          )}
        </div>
        <div className="portfolio-history-card__meta">
          <CustomTooltip message={statusLabel} skipTranslation position="top">
            <SVGIcon
              icon={statusIcon}
              className="portfolio-history-card__status-icon"
            />
          </CustomTooltip>
          {fullDate ? (
            <CustomTooltip message={fullDate} skipTranslation position="top">
              <span className="portfolio-history-card__date">
                {relativeDate}
              </span>
            </CustomTooltip>
          ) : (
            <span className="portfolio-history-card__date">{relativeDate}</span>
          )}
          <SVGIcon
            icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
            className={`portfolio-history-card__chevron ${
              isExpanded ? 'open' : 'closed'
            }`}
          />
        </div>
      </button>

      {isExpanded ? (
        <div className="portfolio-history-card__details">
          {modeLabel ? (
            <span className="portfolio-history-card__mode-tag">{modeLabel}</span>
          ) : null}
          {detailRows.map((row) => (
            <div className="portfolio-history-card__detail-row" key={row.label}>
              <span className="portfolio-history-card__detail-label">
                {row.label}
              </span>
              <div className="portfolio-history-card__detail-value">
                {row.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

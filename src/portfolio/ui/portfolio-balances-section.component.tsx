import { OptionItem } from '@common-ui/custom-select/custom-select.component';
import React, { useMemo } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioMode } from 'src/portfolio/portfolio-api.interface';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';
import { PortfolioHiveEngineBalanceBreakdown } from 'src/portfolio/portfolio.interface';
import { PortfolioOverlayListSelect } from 'src/portfolio/ui/portfolio-overlay-list-select.component';
import {
  portfolioRowToTokenIdentityProps,
  PortfolioTokenIdentity,
} from 'src/portfolio/ui/portfolio-token-identity.component';
import FormatUtils from 'src/utils/format.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

export type PortfolioBalancesRow = {
  key: string;
  symbol: string;
  network: string;
  balance: string;
  usdValue: number | null;
  priceUsd: number | null;
  decimals?: number;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  isTestnet?: boolean;
  breakdown?: PortfolioHiveEngineBalanceBreakdown;
};

export type PortfolioBalancesSectionProps = {
  hasAccounts: boolean;
  selectedAccountKey: string;
  isHiveAccount: boolean;
  showNetworkFilter: boolean;
  accountOptions: OptionItem[];
  networkOptions: OptionItem[];
  selectedNetwork: string;
  tokenFilter: string;
  rows: PortfolioBalancesRow[];
  expandedRowKeys: string[];
  rowActions: PortfolioMode[];
  isLoadingMoreChains: boolean;
  onSelectedAccountChange: (accountKey: string) => void;
  onSelectedNetworkChange: (network: string) => void;
  onTokenFilterChange: (value: string) => void;
  onToggleRowExpanded: (rowKey: string) => void;
  onOpenFlowForRow: (row: PortfolioBalancesRow, mode: PortfolioMode) => void;
  renderAccountOption: (accountKey: string) => React.ReactNode;
  renderNetworkOption: (networkValue: string) => React.ReactNode;
};

const SECTION_ACTION_ICONS: Record<'buy' | 'sell' | 'swap', SVGIcons> = {
  buy: SVGIcons.PORTFOLIO_BUY,
  sell: SVGIcons.PORTFOLIO_SELL,
  swap: SVGIcons.PORTFOLIO_SWAP,
};

const formatUsd = (value: number | null): string =>
  value === null ? '—' : `$${FormatUtils.formatCurrencyValue(value, 2)}`;

const formatPrice = (value: number | null): string => {
  if (value === null) {
    return '—';
  }
  if (value >= 1) {
    return formatUsd(value);
  }
  return `$${value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}`;
};

const formatTokenAmount = (value: string): string => {
  const amount = Number(value.replace(/,/g, ''));
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 8 })
    : value;
};

const formatHiveEngineTokenAmount = (
  value: string | number,
  decimals?: number,
): string => {
  const amount =
    typeof value === 'number' ? value : Number(value.replace(/,/g, ''));
  if (!Number.isFinite(amount)) {
    return String(value);
  }

  if (typeof decimals === 'number' && Number.isFinite(decimals)) {
    return FormatUtils.trimUselessZero(amount, decimals);
  }

  return formatTokenAmount(String(amount));
};

const getHiveEngineBalanceBreakdownLabels = () => ({
  liquid: I18nUtils.getMessage('liquid_balance'),
  staked: I18nUtils.getMessage('popup_html_token_staking'),
  delegatedIn: I18nUtils.getMessage('popup_html_token_delegation_in'),
  delegatedOut: I18nUtils.getMessage('popup_html_token_delegation_out'),
  unstaking: I18nUtils.getMessage('popup_html_token_pending_unstake'),
  undelegating: I18nUtils.getMessage('popup_html_token_pending_undelegation'),
});

const getHiveEngineBalanceBreakdownItems = (
  breakdown?: PortfolioHiveEngineBalanceBreakdown,
) => {
  if (!breakdown) {
    return [];
  }

  return PortfolioFlowUtils.getPortfolioHiveEngineBalanceBreakdownItems(
    breakdown,
    getHiveEngineBalanceBreakdownLabels(),
  );
};

const PortfolioBalancesSectionComponent = ({
  hasAccounts,
  selectedAccountKey,
  isHiveAccount,
  showNetworkFilter,
  accountOptions,
  networkOptions,
  selectedNetwork,
  tokenFilter,
  rows,
  expandedRowKeys,
  rowActions,
  isLoadingMoreChains,
  onSelectedAccountChange,
  onSelectedNetworkChange,
  onTokenFilterChange,
  onToggleRowExpanded,
  onOpenFlowForRow,
  renderAccountOption,
  renderNetworkOption,
}: PortfolioBalancesSectionProps) => {
  const visibleRows = useMemo(() => {
    const filter = tokenFilter.trim().toLowerCase();
    const filteredRows = [...rows]
      .filter((row) => !selectedNetwork || row.network === selectedNetwork)
      .filter(
        (row) =>
          !filter ||
          row.symbol.toLowerCase().includes(filter) ||
          row.network.toLowerCase().includes(filter),
      );

    return PortfolioUtils.sortPortfolioDisplayItems(filteredRows, isHiveAccount);
  }, [isHiveAccount, rows, selectedNetwork, tokenFilter]);

  const totalUsd = useMemo(
    () =>
      visibleRows.reduce((total, row) => total + (row.usdValue ?? 0), 0),
    [visibleRows],
  );
  const hasKnownValue = useMemo(
    () => visibleRows.some((row) => row.usdValue !== null),
    [visibleRows],
  );

  return (
    <div className="portfolio-card-body">
      {hasAccounts ? (
        <div className="portfolio-sticky-menu-bar">
          <div className="portfolio-controls">
            <PortfolioOverlayListSelect
              id="portfolio-account"
              className="portfolio-controls__account"
              label={I18nUtils.getMessage('portfolio_account')}
              value={selectedAccountKey}
              onChange={onSelectedAccountChange}
              options={accountOptions}
              renderDisplay={renderAccountOption}
              renderOption={renderAccountOption}
            />
            {showNetworkFilter && (
              <PortfolioOverlayListSelect
                id="portfolio-network"
                className="portfolio-controls__network"
                label={I18nUtils.getMessage('portfolio_network')}
                value={selectedNetwork}
                onChange={onSelectedNetworkChange}
                options={networkOptions}
                renderDisplay={renderNetworkOption}
                renderOption={renderNetworkOption}
              />
            )}
            <div className="portfolio-token-filter">
              <label htmlFor="portfolio-token-filter">
                {I18nUtils.getMessage('portfolio_assets')}
              </label>
              <input
                id="portfolio-token-filter"
                type="text"
                placeholder={I18nUtils.getMessage('portfolio_token_filter')}
                value={tokenFilter}
                onChange={(event) => onTokenFilterChange(event.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="portfolio-empty">
          {I18nUtils.getMessage('portfolio_no_assets')}
        </div>
      )}

      <div className="portfolio-table-wrap">
        <div className="portfolio-table-head">
          <span>{I18nUtils.getMessage('portfolio_token')}</span>
          <span>{I18nUtils.getMessage('portfolio_actions')}</span>
          <span>{I18nUtils.getMessage('popup_html_transfer_amount')}</span>
          <span>{I18nUtils.getMessage('portfolio_price')}</span>
          <span>{I18nUtils.getMessage('portfolio_value')}</span>
        </div>
        {visibleRows.length === 0 ? (
          <div className="portfolio-empty">
            {I18nUtils.getMessage('portfolio_no_assets')}
          </div>
        ) : (
          visibleRows.map((row) => {
            const breakdownItems = getHiveEngineBalanceBreakdownItems(
              row.breakdown,
            );
            const canExpandBreakdown = breakdownItems.length > 0;
            const isExpanded =
              canExpandBreakdown && expandedRowKeys.includes(row.key);

            return (
              <div
                className={`portfolio-table-row-group${
                  isExpanded ? ' is-expanded' : ''
                }`}
                key={row.key}>
                <div
                  className={`portfolio-table-row${
                    isExpanded ? ' is-expanded' : ''
                  }`}>
                  <PortfolioTokenIdentity
                    {...portfolioRowToTokenIdentityProps({
                      ...row,
                      isHive: isHiveAccount,
                    })}
                  />
                  <div className="portfolio-row-actions">
                    {rowActions.map((action) => (
                      <button
                        aria-label={I18nUtils.getMessage(
                          `portfolio_section_${action}`,
                        )}
                        key={`${row.key}:${action}`}
                        onClick={() => onOpenFlowForRow(row, action)}
                        title={I18nUtils.getMessage(
                          `portfolio_section_${action}`,
                        )}
                        type="button">
                        <SVGIcon
                          icon={SECTION_ACTION_ICONS[action]}
                          className="portfolio-row-action-icon"
                        />
                      </button>
                    ))}
                  </div>
                  <span className="portfolio-number amount">
                    {canExpandBreakdown ? (
                      <button
                        type="button"
                        className="portfolio-amount-expand"
                        aria-expanded={isExpanded}
                        aria-label={I18nUtils.getMessage(
                          isExpanded
                            ? 'portfolio_he_breakdown_collapse'
                            : 'portfolio_he_breakdown_expand',
                        )}
                        onClick={() => onToggleRowExpanded(row.key)}>
                        <SVGIcon
                          icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
                          className={`portfolio-row-expand-icon ${
                            isExpanded ? 'open' : 'closed'
                          }`}
                        />
                        <span className="portfolio-amount-total">
                          {formatHiveEngineTokenAmount(
                            row.balance,
                            row.decimals,
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="portfolio-amount-total">
                        {row.breakdown
                          ? formatHiveEngineTokenAmount(
                              row.balance,
                              row.decimals,
                            )
                          : formatTokenAmount(row.balance)}
                      </span>
                    )}
                  </span>
                  <span className="portfolio-number">
                    {formatPrice(row.priceUsd)}
                  </span>
                  <strong className="portfolio-number">
                    {formatUsd(row.usdValue)}
                  </strong>
                </div>
                {isExpanded ? (
                  <div className="portfolio-row-breakdown">
                    {breakdownItems.map((item) => (
                      <div
                        className="portfolio-row-breakdown__item"
                        key={`${row.key}:${item.key}`}>
                        <span className="portfolio-row-breakdown__label">
                          {item.label}
                        </span>
                        <span className="portfolio-row-breakdown__value">
                          {formatHiveEngineTokenAmount(
                            item.amount,
                            row.decimals,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="portfolio-total">
        <span>{I18nUtils.getMessage('portfolio_total_value_usd')}</span>
        <strong>{hasKnownValue ? formatUsd(totalUsd) : '—'}</strong>
      </div>
      {isLoadingMoreChains ? (
        <div className="portfolio-loading-more">
          <RotatingLogoComponent />
        </div>
      ) : null}
    </div>
  );
};

export const PortfolioBalancesSection = React.memo(
  PortfolioBalancesSectionComponent,
);

PortfolioBalancesSection.displayName = 'PortfolioBalancesSection';

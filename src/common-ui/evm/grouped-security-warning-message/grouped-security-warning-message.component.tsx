import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  getGroupedSecurityDetailReasons,
  hasGroupedSecurityDetails,
} from '@popup/evm/utils/evm-grouped-security-warning.utils';
import React from 'react';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
export type GroupedSecurityWarningVariant = 'tag' | 'panel';

interface Props {
  warning: EvmTransactionWarning;
  onIconClick?: () => void;
  showLeadingIcon?: boolean;
  variant?: GroupedSecurityWarningVariant;
}

export const GroupedSecurityWarningMessage = ({
  warning,
  onIconClick,
  showLeadingIcon = true,
  variant = 'tag',
}: Props) => {
  const detailReasons = getGroupedSecurityDetailReasons(warning);
  const hasDetails = hasGroupedSecurityDetails(warning);
  const levelClass = EvmRiskWarningUtils.getLevelModifierClass(warning.level);
  const severityLabel = I18nUtils.getMessage(
    EvmRiskWarningUtils.getSeverityLabelKey(warning.level),
  );
  const summaryMessage = I18nUtils.getMessage(
    warning.message,
    warning.messageParams ?? [],
  );

  if (variant === 'panel') {
    const PanelWrapper = onIconClick ? 'button' : 'div';

    return (
      <PanelWrapper
        type={onIconClick ? 'button' : undefined}
        className={`evm-risk-warning-panel ${levelClass}${
          onIconClick ? ' evm-risk-warning-panel--clickable' : ''
        }${warning.ignored ? ' evm-risk-warning-panel--acknowledged' : ''}`}
        onClick={onIconClick}>
        <div className="evm-risk-warning-panel__header">
          {showLeadingIcon && (
            <SVGIcon
              className="evm-risk-warning-panel__icon"
              icon={
                warning.ignored
                  ? SVGIcons.GLOBAL_CHECK
                  : EvmRiskWarningUtils.getWarningIcon(warning.level)
              }
            />
          )}
          <span className="evm-risk-warning-panel__level">{severityLabel}</span>
        </div>
        <div className="evm-risk-warning-panel__message">{summaryMessage}</div>
        {hasDetails && (
          <ul className="evm-risk-warning-panel__details">
            {detailReasons.map((detail, index) => (
              <li key={`${detail.message}-${index}`}>
                {I18nUtils.getMessage(
                  detail.message,
                  detail.messageParams ?? [],
                )}
              </li>
            ))}
          </ul>
        )}
      </PanelWrapper>
    );
  }

  const TagWrapper = onIconClick ? 'button' : 'div';

  return (
    <div className="evm-risk-tag-group">
      <TagWrapper
        type={onIconClick ? 'button' : undefined}
        className={`evm-risk-tag ${levelClass}${
          onIconClick ? ' evm-risk-tag--clickable' : ''
        }${warning.ignored ? ' evm-risk-tag--acknowledged' : ''}`}
        onClick={onIconClick}>
        {showLeadingIcon && (
          <SVGIcon
            className="evm-risk-tag__icon"
            icon={
              warning.ignored
                ? SVGIcons.GLOBAL_CHECK
                : EvmRiskWarningUtils.getWarningIcon(warning.level)
            }
          />
        )}
        <span className="evm-risk-tag__level">{severityLabel}</span>
        <span className="evm-risk-tag__message">{summaryMessage}</span>
      </TagWrapper>
      {hasDetails && (
        <ul className="evm-risk-tag-group__details">
          {detailReasons.map((detail, index) => (
            <li key={`${detail.message}-${index}`}>
              {I18nUtils.getMessage(
                detail.message,
                detail.messageParams ?? [],
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

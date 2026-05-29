import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import { isGroupedSecurityWarning } from '@popup/evm/utils/evm-grouped-security-warning.utils';
import React from 'react';
import { GroupedSecurityWarningMessage } from 'src/common-ui/evm/grouped-security-warning-message/grouped-security-warning-message.component';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

export type EvmRiskWarningVariant = 'tag' | 'panel';

interface Props {
  warning: EvmTransactionWarning;
  onWarningClicked?: () => void;
  showSeverityPill?: boolean;
  variant?: EvmRiskWarningVariant;
}

export const EvmRiskWarningRow = ({
  warning,
  onWarningClicked,
  showSeverityPill = true,
  variant = 'tag',
}: Props) => {
  if (isGroupedSecurityWarning(warning)) {
    return (
      <GroupedSecurityWarningMessage
        warning={warning}
        onIconClick={onWarningClicked}
        showLeadingIcon={true}
        variant={variant}
      />
    );
  }

  const levelClass = EvmRiskWarningUtils.getLevelModifierClass(warning.level);
  const severityLabel = chrome.i18n.getMessage(
    EvmRiskWarningUtils.getSeverityLabelKey(warning.level),
  );
  const message = chrome.i18n.getMessage(
    warning.message,
    warning.messageParams ?? [],
  );

  if (variant === 'panel') {
    const PanelWrapper = onWarningClicked ? 'button' : 'div';

    return (
      <PanelWrapper
        type={onWarningClicked ? 'button' : undefined}
        className={`evm-risk-warning-panel ${levelClass}${
          onWarningClicked ? ' evm-risk-warning-panel--clickable' : ''
        }${warning.ignored ? ' evm-risk-warning-panel--acknowledged' : ''}`}
        data-testid="evm-risk-warning-row"
        onClick={onWarningClicked}>
        <div className="evm-risk-warning-panel__header">
          <SVGIcon
            className="evm-risk-warning-panel__icon"
            icon={
              warning.ignored
                ? SVGIcons.GLOBAL_CHECK
                : EvmRiskWarningUtils.getWarningIcon(warning.level)
            }
          />
          {showSeverityPill && (
            <span className="evm-risk-warning-panel__level">
              {severityLabel}
            </span>
          )}
        </div>
        <div className="evm-risk-warning-panel__message">{message}</div>
        {warning.ignored && (
          <span className="evm-risk-warning-panel__acknowledged-label">
            {chrome.i18n.getMessage('evm_risk_warning_reviewed')}
          </span>
        )}
      </PanelWrapper>
    );
  }

  const TagWrapper = onWarningClicked ? 'button' : 'div';

  return (
    <TagWrapper
      type={onWarningClicked ? 'button' : undefined}
      className={`evm-risk-tag ${levelClass}${
        onWarningClicked ? ' evm-risk-tag--clickable' : ''
      }${warning.ignored ? ' evm-risk-tag--acknowledged' : ''}`}
      data-testid="evm-risk-warning-row"
      onClick={onWarningClicked}>
      <SVGIcon
        className="evm-risk-tag__icon"
        icon={
          warning.ignored
            ? SVGIcons.GLOBAL_CHECK
            : EvmRiskWarningUtils.getWarningIcon(warning.level)
        }
      />
      {showSeverityPill && (
        <span className="evm-risk-tag__level">{severityLabel}</span>
      )}
      <span className="evm-risk-tag__message">{message}</span>
      {warning.ignored && (
        <span className="evm-risk-tag__level">
          {chrome.i18n.getMessage('evm_risk_warning_reviewed')}
        </span>
      )}
    </TagWrapper>
  );
};

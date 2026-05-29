import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
} from '@popup/evm/interfaces/evm-transactions.interface';
import React from 'react';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface EvmRiskAlertPanelProps {
  level: EvmTransactionWarningLevel;
  message: string;
  onReviewClick?: () => void;
  dataTestId?: string;
}

const EvmRiskAlertPanel = ({
  level,
  message,
  onReviewClick,
  dataTestId = 'evm-risk-alert',
}: EvmRiskAlertPanelProps) => {
  const levelClass = EvmRiskWarningUtils.getLevelModifierClass(level);
  const severityLabel = chrome.i18n.getMessage(
    EvmRiskWarningUtils.getSeverityLabelKey(level),
  );
  const AlertWrapper = onReviewClick ? 'button' : 'div';

  return (
    <AlertWrapper
      type={onReviewClick ? 'button' : undefined}
      className={`evm-risk-alert${
        onReviewClick ? ' evm-risk-alert--clickable' : ''
      } ${levelClass}`}
      data-testid={dataTestId}
      onClick={onReviewClick}
      role={onReviewClick ? undefined : 'alert'}>
      <div className="evm-risk-alert__header">
        <SVGIcon
          className="evm-risk-alert__icon"
          icon={EvmRiskWarningUtils.getWarningIcon(level)}
        />
        <span className="evm-risk-alert__level">{severityLabel}</span>
      </div>
      <p className="evm-risk-alert__message">{message}</p>
    </AlertWrapper>
  );
};

interface Props {
  warnings: EvmTransactionWarning[];
  warningCount: number;
  onReviewClick: () => void;
  dataTestId?: string;
}

export const EvmRiskAlertBanner = ({
  warnings,
  warningCount,
  onReviewClick,
  dataTestId = 'evm-risk-alert-banner',
}: Props) => {
  const highestLevel = EvmRiskWarningUtils.getHighestLevelFromWarnings(warnings);

  if (warningCount === 0 || !highestLevel) {
    return null;
  }

  const severityLabel = chrome.i18n.getMessage(
    EvmRiskWarningUtils.getSeverityLabelKey(highestLevel),
  );

  return (
    <EvmRiskAlertPanel
      level={highestLevel}
      message={chrome.i18n.getMessage('evm_risk_banner_message', [
        warningCount.toString(),
        severityLabel,
      ])}
      onReviewClick={onReviewClick}
      dataTestId={dataTestId}
    />
  );
};

interface EvmRiskStaticAlertProps {
  message: string;
  messageParams?: string[];
  level?: EvmTransactionWarningLevel;
  skipTranslation?: boolean;
  dataTestId?: string;
}

export const EvmRiskStaticAlert = ({
  message,
  messageParams,
  level = EvmTransactionWarningLevel.HIGH,
  skipTranslation = false,
  dataTestId = 'evm-risk-static-alert',
}: EvmRiskStaticAlertProps) => {
  const displayMessage = skipTranslation
    ? message
    : chrome.i18n.getMessage(message, messageParams);

  return (
    <EvmRiskAlertPanel
      level={level}
      message={displayMessage}
      dataTestId={dataTestId}
    />
  );
};

interface EvmRiskWarningAlertProps {
  warning: EvmTransactionWarning;
  onReviewClick?: () => void;
  dataTestId?: string;
}

export const EvmRiskWarningAlert = ({
  warning,
  onReviewClick,
  dataTestId = 'evm-risk-warning-alert',
}: EvmRiskWarningAlertProps) => {
  if (warning.ignored) {
    return null;
  }

  return (
    <EvmRiskAlertPanel
      level={warning.level}
      message={chrome.i18n.getMessage(
        warning.message,
        warning.messageParams ?? [],
      )}
      onReviewClick={onReviewClick}
      dataTestId={dataTestId}
    />
  );
};

import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

const getSeverityLabelKey = (level: EvmTransactionWarningLevel): string => {
  switch (level) {
    case EvmTransactionWarningLevel.HIGH:
      return 'evm_risk_severity_high';
    case EvmTransactionWarningLevel.MEDIUM:
      return 'evm_risk_severity_medium';
    case EvmTransactionWarningLevel.LOW:
    default:
      return 'evm_risk_severity_low';
  }
};

const getModalTitleKey = (level: EvmTransactionWarningLevel): string => {
  switch (level) {
    case EvmTransactionWarningLevel.HIGH:
      return 'evm_risk_modal_title_high';
    case EvmTransactionWarningLevel.MEDIUM:
      return 'evm_risk_modal_title_medium';
    case EvmTransactionWarningLevel.LOW:
    default:
      return 'evm_risk_modal_title_low';
  }
};

const getWarningIcon = (level: EvmTransactionWarningLevel): SVGIcons => {
  switch (level) {
    case EvmTransactionWarningLevel.HIGH:
      return SVGIcons.GLOBAL_WARNING;
    case EvmTransactionWarningLevel.MEDIUM:
      return SVGIcons.GLOBAL_WARNING;
    case EvmTransactionWarningLevel.LOW:
    default:
      return SVGIcons.GLOBAL_INFO;
  }
};

const getLevelModifierClass = (level: EvmTransactionWarningLevel): string =>
  level;

const getActiveWarnings = (
  warnings: EvmTransactionWarning[],
): EvmTransactionWarning[] =>
  warnings.filter((warning) => !warning.ignored);

const getHighestLevelFromWarnings = (
  warnings: EvmTransactionWarning[],
): EvmTransactionWarningLevel | undefined => {
  const active = getActiveWarnings(warnings);
  if (active.length === 0) {
    return undefined;
  }
  return EvmTransactionParserUtils.getHighestWarningLevel(active);
};

const collectWarningsFromConfirmationFields = (
  fields: { warnings?: EvmTransactionWarning[] }[] | undefined,
): EvmTransactionWarning[] => {
  if (!fields?.length) {
    return [];
  }
  return fields.flatMap((field) => field.warnings ?? []);
};

const getWhitelistLabelKey = (
  fieldName: string,
  warningIndex: number,
): string => `${fieldName}:${warningIndex}`;

const getWhitelistDefaultLabel = (warning: EvmTransactionWarning): string => {
  if (warning.type !== EvmTransactionWarningType.WHITELIST_ADDRESS) {
    return '';
  }
  const extraData = warning.extraData ?? {};
  const defaultLabel = extraData.defaultLabel?.trim();
  if (defaultLabel) {
    return defaultLabel;
  }
  const ensName = extraData.ensName?.trim();
  if (ensName) {
    return ensName;
  }
  return '';
};

const countFieldsWithActiveWarnings = (
  fields: { warnings?: EvmTransactionWarning[] }[] | undefined,
): number => {
  if (!fields?.length) {
    return 0;
  }
  return fields.filter((field) =>
    field.warnings?.some((warning) => !warning.ignored),
  ).length;
};

export const EvmRiskWarningUtils = {
  getSeverityLabelKey,
  getModalTitleKey,
  getWarningIcon,
  getLevelModifierClass,
  getActiveWarnings,
  getHighestLevelFromWarnings,
  getWhitelistLabelKey,
  getWhitelistDefaultLabel,
  collectWarningsFromConfirmationFields,
  countFieldsWithActiveWarnings,
};

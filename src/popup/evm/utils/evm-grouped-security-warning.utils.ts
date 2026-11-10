import {
  EvmGroupedSecurityWarningDetail,
  EvmGroupedSecurityWarningExtraData,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmSecurityReasonWarningMessage } from '@popup/evm/utils/evm-security-reason.utils';

const isGroupedSecurityWarningExtraData = (
  extraData: unknown,
): extraData is EvmGroupedSecurityWarningExtraData => {
  if (!extraData || typeof extraData !== 'object' || Array.isArray(extraData)) {
    return false;
  }
  return Array.isArray(
    (extraData as EvmGroupedSecurityWarningExtraData).detailReasons,
  );
};

export const isGroupedSecurityWarning = (
  warning: EvmTransactionWarning,
): boolean => warning.type === EvmTransactionWarningType.GROUPED_SECURITY;

export const getGroupedSecurityDetailReasons = (
  warning: EvmTransactionWarning,
): EvmGroupedSecurityWarningDetail[] => {
  if (!isGroupedSecurityWarning(warning)) {
    return [];
  }
  if (!isGroupedSecurityWarningExtraData(warning.extraData)) {
    return [];
  }
  return warning.extraData.detailReasons;
};

export const hasGroupedSecurityDetails = (
  warning: EvmTransactionWarning,
): boolean => getGroupedSecurityDetailReasons(warning).length > 0;

export const createGroupedSecurityWarning = (
  summaryMessage: string,
  detailReasons: EvmSecurityReasonWarningMessage[],
  warningKey?: string,
): EvmTransactionWarning => {
  const extraData: EvmGroupedSecurityWarningExtraData = {
    detailReasons: [...detailReasons],
  };
  return {
    ignored: false,
    level: EvmTransactionWarningLevel.HIGH,
    message: summaryMessage,
    type: EvmTransactionWarningType.GROUPED_SECURITY,
    extraData,
    ...(warningKey ? { warningKey } : {}),
  };
};

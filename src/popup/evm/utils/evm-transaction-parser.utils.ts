import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';

export enum EvmInputDisplayType {
  ADDRESS = 'address',
  BALANCE = 'balance',
  NUMBER = 'number',
  STRING = 'string',
  LONG_TEXT = 'longText',
}

const getDisplayInputType = (
  abi: any,
  methodName: string,
  inputType: string,
  name: string,
): EvmInputDisplayType => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  console.log({ methodName, inputType });
  switch (tokenType) {
    case EVMTokenType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          switch (name) {
            case 'amount':
              return EvmInputDisplayType.BALANCE;
          }
        }
        case 'approve': {
          switch (name) {
            case 'value':
              return EvmInputDisplayType.BALANCE;
          }
        }
        case 'transferFrom': {
          switch (name) {
            case 'value': {
              return EvmInputDisplayType.BALANCE;
            }
          }
        }
      }
      break;
    }
    case EVMTokenType.ERC_721: {
      break;
    }
    default: {
    }
  }
  return inputType as EvmInputDisplayType;
};

const shouldDisplayBalanceChange = (abi: any, methodName: string) => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  switch (tokenType) {
    case EVMTokenType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          return true;
        }
      }
      break;
    }
    case EVMTokenType.ERC_721: {
      return false;
    }
    default: {
      return false;
    }
  }
  return false;
};

const getFieldWarnings = async (
  abi: any,
  methodName: string,
  inputType: string,
  name: string,
  value: string,
): Promise<EvmTransactionWarning[]> => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  const warnings: EvmTransactionWarning[] = [];
  switch (tokenType) {
    case EVMTokenType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          if (name === 'recipient') {
            // Check error here
            warnings.push({
              level: EvmTransactionWarningLevel.MEDIUM,
              message: 'evm_transaction_warning_possible_scam',
              ignored: false,
            });
            warnings.push({
              level: EvmTransactionWarningLevel.HIGH,
              message: 'evm_transaction_warning_possible_scam',
              ignored: false,
            });
            warnings.push({
              level: EvmTransactionWarningLevel.LOW,
              message: 'evm_transaction_warning_possible_scam',
              ignored: false,
            });
          } else if (name === 'amount') {
            warnings.push({
              level: EvmTransactionWarningLevel.LOW,
              message: 'evm_transaction_warning_possible_scam',
              ignored: false,
            });
          }
        }
      }
      break;
    }
    case EVMTokenType.ERC_721: {
      break;
    }
    default: {
    }
  }
  return warnings;
};

const getAllWarnings = async (
  abi: any,
  methodName: string,
  inputType: string,
  name: string,
  fields: TransactionConfirmationFields,
) => {
  for (const field of fields.otherFields) {
    field.warnings = await getFieldWarnings(
      abi,
      methodName,
      inputType,
      name,
      field.value,
    );
  }
  return fields;
};

const getHighestWarning = (warnings: EvmTransactionWarning[]) => {
  let highestWarning = 0;

  for (const warning of warnings) {
    let level = 0;
    switch (warning.level) {
      case EvmTransactionWarningLevel.HIGH:
        level = 2;
        break;
      case EvmTransactionWarningLevel.MEDIUM:
        level = 1;
        break;
      case EvmTransactionWarningLevel.LOW:
        level = 0;
        break;
    }
    if (level > highestWarning) highestWarning = level;
  }
  switch (highestWarning) {
    case 0:
      return EvmTransactionWarningLevel.LOW;
    case 1:
      return EvmTransactionWarningLevel.MEDIUM;
    case 2:
      return EvmTransactionWarningLevel.HIGH;
  }
};

const getDomainWarnings = (domain: string, protocol: string) => {
  const warnings: EvmTransactionWarning[] = [];
  if (protocol.replace(':', '') === 'http') {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.MEDIUM,
      message: 'evm_protocol_not_secured',
    });
  }
  return warnings;
};

export const EvmTransactionParser = {
  getDisplayInputType,
  shouldDisplayBalanceChange,
  getFieldWarnings,
  getAllWarnings,
  getHighestWarning,
  getDomainWarnings,
};

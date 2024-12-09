import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { KeychainApi } from 'src/api/keychain';

export enum EvmInputDisplayType {
  ADDRESS = 'address',
  BALANCE = 'balance',
  NUMBER = 'number',
  STRING = 'string',
  LONG_TEXT = 'longText',
  ARRAY_STRING = 'arrayString',
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
    case EVMTokenType.ERC721: {
      switch (methodName) {
        case 'approve': {
          switch (name) {
            case 'tokenId':
              return EvmInputDisplayType.STRING;
          }
        }
        case 'transferFrom': {
          switch (name) {
            case 'tokenId': {
              return EvmInputDisplayType.STRING;
            }
          }
        }
        case 'setApprovalForAll': {
          switch (name) {
            case '_approved': {
              return EvmInputDisplayType.STRING;
            }
          }
        }
        case 'safeTransferFrom': {
          switch (name) {
            case 'tokenId': {
              return EvmInputDisplayType.STRING;
            }
            case 'data': {
              return EvmInputDisplayType.STRING;
            }
          }
        }
        case 'transfer': {
          switch (name) {
            case 'tokenId': {
              return EvmInputDisplayType.STRING;
            }
          }
        }
      }
      break;
    }
    case EVMTokenType.ERC1155: {
      switch (methodName) {
        case 'transferBatch': {
          switch (name) {
            case 'ids':
              return EvmInputDisplayType.ARRAY_STRING;
            case 'values':
              return EvmInputDisplayType.ARRAY_STRING;
          }
        }
        case 'transferSingle': {
          switch (name) {
            case 'id':
              return EvmInputDisplayType.STRING;
            case 'value':
              return EvmInputDisplayType.STRING;
          }
        }
        case 'safeBatchTransferFrom': {
          switch (name) {
            case 'ids':
              return EvmInputDisplayType.ARRAY_STRING;
            case 'amounts':
              return EvmInputDisplayType.ARRAY_STRING;
            case 'data':
              return EvmInputDisplayType.STRING;
          }
        }
        case 'safeTransferFrom': {
          switch (name) {
            case 'id':
              return EvmInputDisplayType.STRING;
            case 'amount':
              return EvmInputDisplayType.STRING;
            case 'data':
              return EvmInputDisplayType.STRING;
          }
        }
        case 'setApprovalForAll': {
          switch (name) {
            case 'approved':
              return EvmInputDisplayType.STRING;
          }
        }
      }
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
    case EVMTokenType.ERC721: {
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
  chainId: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
): Promise<EvmTransactionWarning[]> => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  const warnings: EvmTransactionWarning[] = [];
  switch (tokenType) {
    case EVMTokenType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          if (name === 'recipient') {
            // Check error here
            return getAddressWarning(
              value,
              chainId,
              verifyTransactionInformation,
            );
          } else if (name === 'amount') {
          }
        }
      }
      break;
    }
    case EVMTokenType.ERC721: {
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
  domain: string,
  chainId: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
) => {
  for (const field of fields.otherFields) {
    field.warnings = await getFieldWarnings(
      abi,
      methodName,
      inputType,
      name,
      field.value,
      chainId,
      verifyTransactionInformation,
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

const getDomainWarnings = (
  domain: string,
  protocol: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
) => {
  const warnings: EvmTransactionWarning[] = [];
  if (protocol.replace(':', '') === 'http') {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.MEDIUM,
      message: 'evm_protocol_not_secured',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (verifyTransactionInformation.domain.isBlacklisted) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_domain_blacklisted',
      type: EvmTransactionWarningType.BASE,
    });
  }

  return warnings;
};

const getAddressWarning = async (
  address: string,
  chainId: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
) => {
  const warnings: EvmTransactionWarning[] = [];
  if (verifyTransactionInformation.to.isBlacklisted) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_receiver_blacklisted',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (!(await EvmAddressesUtils.isWhitelisted(address, chainId))) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      message: 'evm_transaction_receiver_not_whitelisted',
      type: EvmTransactionWarningType.WHITELIST_ADDRESS,
      extraData: {
        placeholder: 'evm_transaction_receiver_favorite_label',
      },
      onConfirm: (label: string) => {
        EvmAddressesUtils.saveWalletAddress(address, chainId, label);
      },
    });
  }

  const spoofingAddress = await EvmAddressesUtils.isPotentialSpoofing(address);

  if (!!spoofingAddress) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.MEDIUM,
      message: spoofingAddress.errorMessage,
      messageParams: [spoofingAddress.address],
      type: EvmTransactionWarningType.BASE,
    });
  }

  // Check for spoofing
  return warnings;
};

const getSmartContractWarningAndInfo = async (
  address: string,
  chainId: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
) => {
  const warningAndInfo: Partial<TransactionConfirmationField> = {
    warnings: [],
    information: [],
  };

  if (verifyTransactionInformation.contract.proxy.target) {
    warningAndInfo.information!.push({
      message: 'evm_transaction_contract_use_proxy',
      messageParams: [verifyTransactionInformation.contract.proxy.target],
    });
  }

  console.log('isSmartContractwhitelisted', address);
  if (await EvmAddressesUtils.isWhitelisted(address, chainId)) {
    warningAndInfo.information?.push({
      message: 'evm_transaction_contract_already_used',
    });
  } else {
    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      type: EvmTransactionWarningType.WHITELIST_ADDRESS,
      message: 'evm_transaction_contract_not_used',
      onConfirm: (label: string) => {
        EvmAddressesUtils.saveContractAddress(address, chainId, label);
      },
    });
  }

  console.log(warningAndInfo);
  return warningAndInfo;
};

const verifyTransactionInformation = async (
  domain: string,
  to: string,
  contract?: string,
): Promise<EvmTransactionVerificationInformation> => {
  return await KeychainApi.get(
    `evm/verifyTransaction?domain=${domain}&to=${to}&contract=${contract}`,
  );
};

export const EvmTransactionParserUtils = {
  getDisplayInputType,
  shouldDisplayBalanceChange,
  getFieldWarnings,
  getAllWarnings,
  getHighestWarning,
  getDomainWarnings,
  verifyTransactionInformation,
  getAddressWarning,
  getSmartContractWarningAndInfo,
};

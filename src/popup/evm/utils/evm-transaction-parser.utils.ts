import { Interface } from '@ethersproject/abi';
import * as Eth from '@metamask/ethjs';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { AbiList } from '@popup/evm/reference-data/abi.data';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmDataParser } from '@popup/evm/utils/evm-data-parser.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { MethodRegistry } from 'eth-method-registry';
import { ethers } from 'ethers';
import detectProxyTarget from 'evm-proxy-detection';
import { KeychainApi } from 'src/api/keychain';

export enum EvmInputDisplayType {
  BYTES = 'bytes',
  ADDRESS = 'address',
  CONTRACT_ADDRESS = 'contract-address',
  WALLET_ADDRESS = 'wallet-address',
  BALANCE = 'balance',
  NUMBER = 'number',
  STRING = 'string',
  STRING_CENTERED = 'string-centered',
  LONG_TEXT = 'longText',
  ARRAY_STRING = 'arrayString',
  IMAGE = 'image',
  UINT256 = 'uint256',
  HTML_ELEMENT = 'html-element',
}

const getDisplayInputType = (
  abi: any,
  methodName: string,
  inputType: string,
  name: string,
): EvmInputDisplayType => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  switch (tokenType) {
    case EVMSmartContractType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          switch (name) {
            case 'amount':
              return EvmInputDisplayType.BALANCE;
            case 'recipient':
              return EvmInputDisplayType.WALLET_ADDRESS;
          }
        }
        case 'approve': {
          switch (name) {
            case 'spender': {
              return EvmInputDisplayType.WALLET_ADDRESS;
            }
            case 'amount':
              return EvmInputDisplayType.BALANCE;
          }
        }
        case 'transferFrom': {
          switch (name) {
            case 'value': {
              return EvmInputDisplayType.BALANCE;
            }
            case 'sender':
            case 'recipient': {
              return EvmInputDisplayType.WALLET_ADDRESS;
            }
          }
        }
      }
      break;
    }
    case EVMSmartContractType.ERC721: {
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
    case EVMSmartContractType.ERC1155: {
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
    case EVMSmartContractType.ERC20: {
      switch (methodName) {
        case 'approve':
        case 'transfer': {
          return true;
        }
      }
      break;
    }
    case EVMSmartContractType.ERC721: {
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
  if (!abi) return [];
  const tokenType = EvmTokensUtils.getTokenType(abi);
  const warnings: EvmTransactionWarning[] = [];
  switch (tokenType) {
    case EVMSmartContractType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          if (name === 'recipient') {
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
    case EVMSmartContractType.ERC721: {
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

const getDomainWarnings = async (
  domain: string,
  protocol: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
) => {
  const warnings: EvmTransactionWarning[] = [];

  const knownDomains = await EvmAddressesUtils.getDomainAddresses();

  if (!knownDomains.includes(domain)) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      message: 'evm_domain_never_visited',
      type: EvmTransactionWarningType.BASE,
    });
  }
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
  if (verifyTransactionInformation?.to?.isBlacklisted) {
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

  if (!ethers.isAddress(address)) {
    if ((await EvmRequestsUtils.resolveEns(address)) === '') {
      warnings.push({
        ignored: false,
        level: EvmTransactionWarningLevel.MEDIUM,
        message: 'evm_ens_recipient_not_existing',
        type: EvmTransactionWarningType.BASE,
      });
    }
  }

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

  if (verifyTransactionInformation?.contract?.proxy?.target) {
    warningAndInfo.information!.push({
      message: 'evm_transaction_contract_use_proxy',
      messageParams: [verifyTransactionInformation.contract.proxy.target],
    });
  }

  if (!(await EvmAddressesUtils.isWhitelisted(address, chainId))) {
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

  return warningAndInfo;
};

const verifyTransactionInformation = async (
  domain?: string,
  to?: string,
  contract?: string,
  proxy?: string,
): Promise<EvmTransactionVerificationInformation> => {
  let url = `evm/verifyTransaction?`;
  if (domain) {
    url += `domain=${domain}`;
  }
  if (to) {
    url += `&to=${to}`;
  }
  if (contract) {
    url += `&contract=${contract}`;
  }

  const result = await KeychainApi.get(url);
  if (proxy) {
    if (!result.contract) {
      result.contract = { proxy: '' };
    }
    result.contract.proxy = proxy;
  }

  return result;
};

const getSmartContractProxy = async (
  smartContractAddress: string,
  chain: EvmChain,
): Promise<string | undefined> => {
  const EIP1193RequestFunc = ({
    method,
    params,
  }: {
    method: string;
    params: any[];
  }): Promise<unknown> => EthersUtils.getProvider(chain).send(method, params);

  const res = await detectProxyTarget(
    smartContractAddress as unknown as any,
    EIP1193RequestFunc,
  );
  if (res?.target) return res.target as string;
};

const findAbiFromData = async (data: string, chain: EvmChain) => {
  data = data.substring(2);

  const functionNameInHex = data.substring(0, 8);

  const foundSignature = await EvmDataParser.getMethodFromSignature(
    functionNameInHex,
  );

  if (foundSignature) {
    const name = foundSignature.split('(')[0];
    const inputs = parseSignature(foundSignature);

    if (name && inputs)
      for (const abi of AbiList) {
        const foundFunction = abi.abi.find(
          (f) => f.name === name && inputs.length === f.inputs.length,
        );
        if (foundFunction) {
          let allMatch = true;
          for (let i = 0; i < inputs.length; i++) {
            if (foundFunction.inputs[i].type !== inputs[i].type) {
              allMatch = false;
              break;
            }
          }
          if (allMatch) return JSON.stringify(abi.abi);
        }
      }
  }
};

const parseData = async (
  data: string,
  chain: EvmChain,
): Promise<{ operationName: string; inputs: any[] } | undefined> => {
  const functionNameInHex = data.slice(0, 10);

  const foundSignature = await EvmDataParser.getMethodFromSignature(
    functionNameInHex,
  );

  if (foundSignature) {
    let registry;
    try {
      registry = new MethodRegistry({
        provider: new Eth.HttpProvider(
          `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        ),
        network: chain.chainId,
      });
      console.log({ registry });
      if (registry) {
        const parsedRegistry = registry.parse(foundSignature);
        console.log(parsedRegistry);
        if (parsedRegistry.name && parsedRegistry.args)
          return {
            operationName: parsedRegistry.name,
            inputs: parsedRegistry.args,
          };
      } else {
        const name = foundSignature.split('(')[0];
        const inputs = parseSignature(foundSignature);

        const valueData = EvmFormatUtils.addHexPrefix(data.slice(10));
        const values = Interface.getAbiCoder().decode(
          inputs,
          valueData,
        ) as any[];
        const params = inputs.map((input, index) =>
          decodeParam(input, index, values),
        );
        return { operationName: name, inputs: params };
      }
    } catch (e) {
      const name = foundSignature.split('(')[0];
      const inputs = parseSignature(foundSignature);

      const valueData = EvmFormatUtils.addHexPrefix(data.slice(10));
      const values = Interface.getAbiCoder().decode(inputs, valueData) as any[];
      const params = inputs.map((input, index) =>
        decodeParam(input, index, values),
      );
      return { operationName: name, inputs: params };
    }
  }
};

function decodeParam(input: any, index: number, values: any[]): any {
  const value = values[index] as any[];
  const { type, name } = input;

  let children = input.components?.map((child: any, childIndex: number) =>
    decodeParam(child, childIndex, value),
  );

  if (type.endsWith('[]')) {
    const childType = type.slice(0, -2);

    children = value.map((_arrayItem, arrayIndex) => {
      const childName = `Item ${arrayIndex + 1}`;

      return decodeParam(
        { ...input, name: childName, type: childType } as any,
        arrayIndex,
        value,
      );
    });
  }

  return {
    name,
    type,
    value,
    children,
  };
}

function parseSignature(signature: string): any[] {
  let typeString = signature.slice(signature.indexOf('(') + 1, -1);
  const nested = [];

  while (typeString.includes('(')) {
    const nestedBrackets = findFirstNestedBrackets(typeString);

    if (!nestedBrackets) {
      break;
    }

    nested.push(nestedBrackets.value);

    typeString = `${typeString.slice(0, nestedBrackets.start)}${
      nested.length - 1
    }#${typeString.slice(nestedBrackets.end + 1)}`;
  }

  return createInput(typeString, nested);
}

function createInput(typeString: string, nested: string[]): any[] {
  return typeString.split(',').map((value) => {
    const parts = value.split('#');

    const nestedIndex = parts.length > 1 ? parseInt(parts[0], 10) : undefined;
    const type = nestedIndex === undefined ? value : `tuple${parts[1] ?? ''}`;

    const components =
      nestedIndex === undefined
        ? undefined
        : createInput(nested[nestedIndex], nested);

    return {
      type,
      components,
    };
  });
}

function findFirstNestedBrackets(
  value: string,
): { start: number; end: number; value: string } | undefined {
  let start = -1;

  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') {
      start = i;
    } else if (value[i] === ')' && start !== -1) {
      return {
        start,
        end: i,
        value: value.slice(start + 1, i),
      };
    }
  }

  return undefined;
}

const recipientInputNameList = ['recipient', 'spender'];
const amountInputNameList = ['amount'];

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
  getSmartContractProxy,
  parseData,
  findAbiFromData,
  recipientInputNameList,
  amountInputNameList,
};

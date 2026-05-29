import {
  EvmSmartContractInfo,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmAddressVerificationFlags,
  EvmTransactionDecodedData,
  EvmTransactionDecodedDataInput,
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
  TransactionConfirmationFields,
  VerifyTransactionParams,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmLightNodeSecurityCheck } from '@popup/evm/interfaces/evm-light-node.interface';
import { LightNodeVerificationData } from '@popup/evm/interfaces/evm-verification.interface';
import { EvmAccountOrPublic } from '@popup/evm/interfaces/wallet.interface';
import { AbiList } from '@popup/evm/reference-data/abi.data';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import {
  EvmSecurityReasonUtils,
  EvmSecurityReasonWarningContext,
} from '@popup/evm/utils/evm-security-reason.utils';
import { createGroupedSecurityWarning } from '@popup/evm/utils/evm-grouped-security-warning.utils';
import { EvmVerificationUtils } from '@popup/evm/utils/evm-verification.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers, Interface, Result } from 'ethers';
import Logger from 'src/utils/logger.utils';

const recipientInputNameList = ['recipient', 'spender'];
const amountInputNameList = ['amount'];

const erc20TransferRecipientArgNames = ['recipient', 'to', '_to'];
const erc20TransferAmountArgNames = ['amount', 'value', '_value'];
const erc20TransferFromSenderArgNames = ['sender', 'from'];

const isErc20TransferRecipientArg = (
  methodName: string,
  inputName: string,
): boolean =>
  methodName === 'transfer' &&
  erc20TransferRecipientArgNames.includes(inputName.toLowerCase());

const isErc20TransferAmountArg = (
  methodName: string,
  inputName: string,
): boolean =>
  methodName === 'transfer' &&
  erc20TransferAmountArgNames.includes(inputName.toLowerCase());

const getErc20DecodedFieldName = (
  methodName: string,
  inputName: string,
): string | undefined => {
  const normalizedMethodName = methodName.toLowerCase();
  const normalizedInputName = inputName.toLowerCase();

  if (normalizedMethodName === 'transfer') {
    if (isErc20TransferRecipientArg(methodName, inputName)) {
      return 'evm_operation_to';
    }
    if (isErc20TransferAmountArg(methodName, inputName)) {
      return 'evm_operation_amount';
    }
    return undefined;
  }

  if (normalizedMethodName === 'transferfrom') {
    if (erc20TransferFromSenderArgNames.includes(normalizedInputName)) {
      return 'evm_operation_from';
    }
    if (erc20TransferRecipientArgNames.includes(normalizedInputName)) {
      return 'evm_operation_to';
    }
    if (erc20TransferAmountArgNames.includes(normalizedInputName)) {
      return 'evm_operation_amount';
    }
  }

  return undefined;
};

const resolveErc20TransferFromDecodedArgs = (
  methodName: string,
  inputs: ReadonlyArray<{ name: string }>,
  args: ReadonlyArray<unknown>,
): { receiverAddress: string; amountRaw: bigint } | null => {
  if (methodName !== 'transfer' || args.length < 2) {
    return null;
  }

  let receiverIndex = inputs.findIndex((input) =>
    isErc20TransferRecipientArg(methodName, input.name),
  );
  let amountIndex = inputs.findIndex((input) =>
    isErc20TransferAmountArg(methodName, input.name),
  );

  if (receiverIndex < 0) {
    receiverIndex = 0;
  }
  if (amountIndex < 0) {
    amountIndex = 1;
  }

  const receiverValue = args[receiverIndex];
  const amountValue = args[amountIndex];

  if (
    (typeof receiverValue !== 'string' && typeof receiverValue !== 'bigint') ||
    !ethers.isAddress(String(receiverValue))
  ) {
    return null;
  }

  if (
    typeof amountValue !== 'bigint' &&
    typeof amountValue !== 'number' &&
    typeof amountValue !== 'string'
  ) {
    return null;
  }

  return {
    receiverAddress: String(receiverValue),
    amountRaw: BigInt(amountValue.toString()),
  };
};

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
  WARNING_ONLY = 'warning-only',
  /** Decoded ABI `tuple` / `tuple[]` — custom collapsible renderer */
  TUPLE = 'tuple',
}

const getDisplayInputType = (
  abi: any,
  methodName: string,
  inputType: string,
  name: string,
  tokenInfo?: EvmSmartContractInfo,
): EvmInputDisplayType => {
  let tokenType;
  if (tokenInfo) {
    tokenType = tokenInfo.type;
  } else {
    tokenType = EvmTokensUtils.getTokenType(abi);
  }
  switch (tokenType) {
    case EVMSmartContractType.ERC20: {
      switch (methodName) {
        case 'transferFrom':
        case 'transfer': {
          switch (name.toLowerCase()) {
            case 'amount':
            case 'value':
            case '_value':
              return EvmInputDisplayType.BALANCE;
            case 'recipient':
            case 'to':
            case '_to':
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
    case EVMSmartContractType.PROTOCOL: {
      break;
    }
    case EVMSmartContractType.ERC1155: {
      if (['from', 'to'].includes(name))
        return EvmInputDisplayType.WALLET_ADDRESS;
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
        case 'transfer': {
          return true;
        }
      }
      break;
    }
    case EVMSmartContractType.ERC721: {
      return false;
    }
    case EVMSmartContractType.ERC1155: {
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
  localAccounts: EvmAccountOrPublic[],
): Promise<EvmTransactionWarning[]> => {
  if (!abi) return [];
  const tokenType = EvmTokensUtils.getTokenType(abi);
  const warnings: EvmTransactionWarning[] = [];
  switch (tokenType) {
    case EVMSmartContractType.ERC20: {
      if (recipientInputNameList.includes(name)) {
        return getAddressWarning(
          value,
          chainId,
          verifyTransactionInformation,
          localAccounts,
        );
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
  localAccounts: EvmAccountOrPublic[],
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
      localAccounts,
    );
  }
  return fields;
};

const getHighestWarning = (warnings: EvmTransactionWarning[]) => {
  let highestWarning: EvmTransactionWarning;
  let highestWarningLevel = -1;

  let warningIndex = 0;
  for (let index = 0; index < warnings.length; index++) {
    const warning = warnings[index];
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
    if (level > highestWarningLevel) {
      highestWarningLevel = level;
      highestWarning = warning;
      warningIndex = index;
    }
  }
  return highestWarning!;
};

const getHighestWarningLevel = (warnings: EvmTransactionWarning[]) => {
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
  origin: string,
  protocol: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
) => {
  const warnings: EvmTransactionWarning[] = [];

  const knownDomains = await EvmAddressesUtils.getDomainAddresses();

  if (!knownDomains.includes(origin)) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      message: 'evm_domain_never_visited',
      type: EvmTransactionWarningType.BASE,
    });
    if (protocol.replace(':', '') === 'http') {
      warnings.push({
        ignored: false,
        level: EvmTransactionWarningLevel.MEDIUM,
        message: 'evm_protocol_not_secured',
        type: EvmTransactionWarningType.BASE,
      });
    }
  }

  if (verifyTransactionInformation?.domain?.isBlacklisted) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_domain_blacklisted',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (verifyTransactionInformation?.domain?.fuzzy) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_domain_fuzzy',
      messageParams: [verifyTransactionInformation.domain.fuzzy],
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (
    verifyTransactionInformation?.domain?.isPhishing &&
    !verifyTransactionInformation?.domain?.isBlacklisted
  ) {
    appendSecurityReasonWarnings(
      warnings,
      verifyTransactionInformation.domain.securityReasons,
      true,
      'domain',
    );
  }

  return warnings;
};

const getAddressVerificationFlags = (
  verifyTransactionInformation: EvmTransactionVerificationInformation,
  address: string,
): EvmAddressVerificationFlags => {
  if (ethers.isAddress(address)) {
    const perAddress =
      verifyTransactionInformation.addresses?.[address.toLowerCase()];
    if (perAddress) {
      return perAddress;
    }
  }

  return {
    isBlacklisted: verifyTransactionInformation.to?.isBlacklisted,
    isMalicious: verifyTransactionInformation.to?.isMalicious,
    isWhitelisted: verifyTransactionInformation.to?.isWhitelisted,
  };
};

const setAddressVerificationFlags = (
  verification: EvmTransactionVerificationInformation,
  address: string,
  flags: EvmAddressVerificationFlags,
) => {
  if (!ethers.isAddress(address)) {
    return;
  }
  const key = address.toLowerCase();
  if (!verification.addresses) {
    verification.addresses = {};
  }
  verification.addresses[key] = {
    ...verification.addresses[key],
    ...flags,
  };
};

const applyLightNodeSecurityCheck = (
  verification: EvmTransactionVerificationInformation,
  address: string,
  security?: EvmLightNodeSecurityCheck,
) => {
  if (!security) {
    return;
  }
  setAddressVerificationFlags(verification, address, {
    isMalicious: security.isMalicious,
    securityReasons: security.reasons.length ? [...security.reasons] : undefined,
    rugPullRisk: security.isRugPull === true ? true : undefined,
    rugPullReasons: security.isRugPullReason?.length
      ? [...security.isRugPullReason]
      : undefined,
  });
};

const applyLightNodeContractSecurity = (
  contract: EvmTransactionVerificationInformation['contract'],
  security?: EvmLightNodeSecurityCheck,
) => {
  if (!security) {
    return;
  }
  if (security.isMalicious) {
    contract.isMalicious = true;
  }
  if (security.reasons.length) {
    contract.securityReasons = [...security.reasons];
  }
  if (security.isRugPull === true) {
    contract.rugPullRisk = true;
    if (security.isRugPullReason?.length) {
      contract.rugPullReasons = [...security.isRugPullReason];
    }
  }
};

const ADDRESS_SECURITY_SUMMARY_MESSAGE = 'evm_security_reason_grouped_address_risk';
const DOMAIN_SECURITY_SUMMARY_MESSAGE = 'evm_security_reason_grouped_domain_risk';
const RUG_PULL_SUMMARY_MESSAGE = 'evm_security_reason_rug_pull';
const ADDRESS_MALICIOUS_FALLBACK_MESSAGE = 'evm_transaction_receiver_malicious';
const DOMAIN_PHISHING_FALLBACK_MESSAGE = 'evm_transaction_domain_phishing';

const appendSecurityReasonWarnings = (
  warnings: EvmTransactionWarning[],
  securityReasons: string[] | undefined,
  isMalicious: boolean,
  context: EvmSecurityReasonWarningContext,
) => {
  const detailReasons = EvmSecurityReasonUtils.buildWarningsForSecurityReasons(
    securityReasons ?? [],
    isMalicious,
    context,
  );
  if (detailReasons.length === 0) {
    return;
  }

  const fallbackMessage =
    context === 'domain'
      ? DOMAIN_PHISHING_FALLBACK_MESSAGE
      : ADDRESS_MALICIOUS_FALLBACK_MESSAGE;
  const onlyFallback =
    detailReasons.length === 1 && detailReasons[0].message === fallbackMessage;

  if (onlyFallback) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: detailReasons[0].message,
      messageParams: detailReasons[0].messageParams,
      type: EvmTransactionWarningType.BASE,
    });
    return;
  }

  const summaryMessage =
    context === 'domain'
      ? DOMAIN_SECURITY_SUMMARY_MESSAGE
      : ADDRESS_SECURITY_SUMMARY_MESSAGE;
  warnings.push(
    createGroupedSecurityWarning(
      summaryMessage,
      detailReasons,
      context === 'domain' ? 'domainSecurity' : 'addressSecurity',
    ),
  );
};

const appendRugPullReasonWarnings = (
  warnings: EvmTransactionWarning[],
  rugPullReasons: string[] | undefined,
  isRugPull: boolean,
) => {
  if (!isRugPull) {
    return;
  }

  const detailReasons = EvmSecurityReasonUtils.buildWarningsForRugPullReasons(
    rugPullReasons ?? [],
    true,
  );
  if (detailReasons.length === 0) {
    return;
  }

  const onlyFallback =
    detailReasons.length === 1 &&
    detailReasons[0].message === RUG_PULL_SUMMARY_MESSAGE &&
    (rugPullReasons?.length ?? 0) === 0;

  if (onlyFallback) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: RUG_PULL_SUMMARY_MESSAGE,
      type: EvmTransactionWarningType.BASE,
      warningKey: 'rugPull',
    });
    return;
  }

  warnings.push(
    createGroupedSecurityWarning(
      RUG_PULL_SUMMARY_MESSAGE,
      detailReasons,
      'rugPull',
    ),
  );
};

const isDomainPhishing = (security?: EvmLightNodeSecurityCheck): boolean => {
  if (!security) {
    return false;
  }
  return (
    security.isMalicious ||
    security.reasons.includes('phishing_site') ||
    security.reasons.includes('scamsniffer_blacklist')
  );
};

const collectRecipientAddressesFromDecodedArgs = (
  inputs: ReadonlyArray<{ name: string }>,
  args: ReadonlyArray<unknown>,
): string[] => {
  const addresses: string[] = [];
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index];
    const value = args[index];
    if (
      recipientInputNameList.includes(input.name) &&
      typeof value === 'string' &&
      ethers.isAddress(value)
    ) {
      addresses.push(value);
    }
  }
  return addresses;
};

const getAddressWarning = async (
  address: string,
  chainId: string,
  verifyTransactionInformation: EvmTransactionVerificationInformation,
  localAccounts: EvmAccountOrPublic[],
) => {
  const warnings: EvmTransactionWarning[] = [];
  const isAddress = ethers.isAddress(address);
  const resolvedEnsAddress = !isAddress
    ? await EvmRequestsUtils.resolveEns(address)
    : '';

  const addressFlags = getAddressVerificationFlags(
    verifyTransactionInformation,
    address,
  );

  if (addressFlags.isBlacklisted) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_receiver_blacklisted',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (addressFlags.isMalicious && !addressFlags.isBlacklisted) {
    appendSecurityReasonWarnings(
      warnings,
      addressFlags.securityReasons,
      true,
      'address',
    );
  }
  if (addressFlags.rugPullRisk) {
    appendRugPullReasonWarnings(
      warnings,
      addressFlags.rugPullReasons,
      true,
    );
  }
  const hasLightNodeSecurityRisk =
    !!addressFlags.isBlacklisted ||
    !!addressFlags.isMalicious ||
    !!addressFlags.rugPullRisk ||
    !!addressFlags.securityReasons?.length ||
    !!addressFlags.rugPullReasons?.length;
  if (
    !hasLightNodeSecurityRisk &&
    !(await EvmAddressesUtils.isWhitelisted(address, chainId, localAccounts))
  ) {
    const savedEns = isAddress
      ? await EvmAddressesUtils.getEnsDataFromAddress(address)
      : await EvmAddressesUtils.getEnsDataFromEns(address);
    const ensName =
      savedEns?.ens ??
      (isAddress
        ? await EvmRequestsUtils.getEnsForAddress(address)
        : resolvedEnsAddress
          ? address
          : undefined);

    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      message: 'evm_transaction_receiver_not_whitelisted',
      type: EvmTransactionWarningType.WHITELIST_ADDRESS,
      extraData: {
        placeholder: 'evm_transaction_receiver_favorite_label',
        resolveAllLabel: address,
        ...(ensName ? { ensName, defaultLabel: ensName } : {}),
      },
      onConfirm: (label: string) => {
        return EvmAddressesUtils.saveWalletAddress(chainId, address, label);
      },
    });
  }

  const spoofingAddress = await EvmAddressesUtils.isPotentialSpoofing(
    address,
    localAccounts,
  );

  if (!!spoofingAddress) {
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.MEDIUM,
      message: spoofingAddress.errorMessage,
      messageParams: [spoofingAddress.address],
      type: EvmTransactionWarningType.BASE,
    });
  }

  if (!isAddress) {
    if (resolvedEnsAddress === '') {
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
  localAccounts: EvmAccountOrPublic[],
  usedToken: EvmSmartContractInfo,
) => {
  const warningAndInfo: Partial<TransactionConfirmationField> = {
    warnings: [],
    information: [],
  };
  const contractInfo = verifyTransactionInformation?.contract;
  const hasLightNodeContractSecurityRisk =
    !!contractInfo?.isBlacklisted ||
    !!contractInfo?.isMalicious ||
    !!contractInfo?.rugPullRisk ||
    !!contractInfo?.securityReasons?.length ||
    !!contractInfo?.rugPullReasons?.length;

  if (verifyTransactionInformation?.contract?.proxy?.target) {
    warningAndInfo.information!.push({
      message: 'evm_transaction_contract_use_proxy',
      messageParams: [verifyTransactionInformation.contract.proxy.target],
    });
  }

  if (
    !hasLightNodeContractSecurityRisk &&
    !(await EvmAddressesUtils.isWhitelisted(address, chainId, localAccounts))
  ) {
    if (
      usedToken &&
      usedToken.type !== EVMSmartContractType.NATIVE &&
      usedToken.verifiedContract &&
      !usedToken.possibleSpam
    ) {
      return warningAndInfo;
    }

    const defaultLabel =
      usedToken?.type !== EVMSmartContractType.NATIVE
        ? usedToken?.name?.trim()
        : undefined;

    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      type: EvmTransactionWarningType.WHITELIST_ADDRESS,
      message: 'evm_transaction_contract_not_used',
      extraData: {
        placeholder: 'evm_transaction_receiver_favorite_label',
        ...(defaultLabel ? { defaultLabel } : {}),
        resolveAllLabel: defaultLabel || address,
      },
      onConfirm: (label: string) => {
        return EvmAddressesUtils.saveContractAddress(address, chainId, label);
      },
    });
  }

  if (contractInfo?.isMalicious) {
    appendSecurityReasonWarnings(
      warningAndInfo.warnings!,
      contractInfo.securityReasons,
      true,
      'address',
    );
  }
  if (contractInfo?.rugPullRisk) {
    appendRugPullReasonWarnings(
      warningAndInfo.warnings!,
      contractInfo.rugPullReasons,
      true,
    );
  }

  return warningAndInfo;
};

const normalizeVerificationInformation = (
  verificationInformation: Partial<EvmTransactionVerificationInformation> = {},
  proxyTarget?: string | null,
): EvmTransactionVerificationInformation => {
  const normalizedProxyTarget =
    typeof verificationInformation.contract?.proxy === 'string'
      ? verificationInformation.contract.proxy
      : (verificationInformation.contract?.proxy?.target ?? proxyTarget);

  return {
    ...verificationInformation,
    contract: {
      ...(verificationInformation.contract ?? {}),
      proxy: normalizedProxyTarget ? { target: normalizedProxyTarget } : {},
    },
    domain: verificationInformation.domain ?? {},
    to: verificationInformation.to ?? {},
  } as EvmTransactionVerificationInformation;
};

const mergeLightNodeSecurityIntoVerification = (
  verification: EvmTransactionVerificationInformation,
  lightNodeData: LightNodeVerificationData,
): EvmTransactionVerificationInformation => {
  if (!lightNodeData || Object.keys(lightNodeData).length === 0) {
    return verification;
  }

  const merged: EvmTransactionVerificationInformation = {
    ...verification,
    domain: { ...verification.domain },
    to: { ...verification.to },
    contract: { ...verification.contract },
  };

  if (lightNodeData.unavailable) {
    merged.lightNodeSecurityUnavailable = true;
  }

  const domainSecurity = lightNodeData.domainSecurity;
  if (isDomainPhishing(domainSecurity)) {
    merged.domain.isPhishing = true;
    if (domainSecurity?.reasons.length) {
      merged.domain.securityReasons = [...domainSecurity.reasons];
    }
  }

  if (lightNodeData.addressSecurityByAddress) {
    for (const [address, security] of Object.entries(
      lightNodeData.addressSecurityByAddress,
    )) {
      applyLightNodeSecurityCheck(merged, address, security);
    }
  }

  applyLightNodeContractSecurity(merged.contract, lightNodeData.contractSecurity);

  return merged;
};

const enrichVerificationForAddresses = async (
  verification: EvmTransactionVerificationInformation,
  addresses: string[],
  _params: { chainId: string; domain?: string },
): Promise<EvmTransactionVerificationInformation> => {
  const uniqueAddresses = [
    ...new Set(
      addresses
        .filter((address) => ethers.isAddress(address))
        .map((address) => address.toLowerCase()),
    ),
  ];

  if (uniqueAddresses.length === 0) {
    return verification;
  }

  await Promise.all(
    uniqueAddresses.map(async (address) => {
      const receiverSecurity = await EvmLightNodeUtils.getReceiverSecurity(
        address,
      ).catch(() => undefined);

      applyLightNodeSecurityCheck(verification, address, receiverSecurity);
    }),
  );

  return verification;
};

const verifyTransactionInformation = async (
  params: VerifyTransactionParams = {},
): Promise<EvmTransactionVerificationInformation> => {
  const verification = normalizeVerificationInformation(
    {},
    params.proxyTarget,
  );

  const lightNodeResult = await EvmVerificationUtils.fetchLightNodeVerificationData(
    params,
  )
    .then((value) => ({ status: 'fulfilled', value }) as const)
    .catch((reason) => ({ status: 'rejected', reason }) as const);

  const lightNodeData =
    lightNodeResult.status === 'fulfilled'
      ? lightNodeResult.value
      : { unavailable: true };

  if (lightNodeResult.status === 'rejected') {
    Logger.error('Light-node security verification failed', lightNodeResult.reason);
  }

  const merged = mergeLightNodeSecurityIntoVerification(
    verification,
    lightNodeData,
  );

  if (params.to && ethers.isAddress(params.to)) {
    const toKey = params.to.toLowerCase();
    const receiverFlags = merged.addresses?.[toKey];
    setAddressVerificationFlags(merged, params.to, {
      isBlacklisted: merged.to?.isBlacklisted,
      isMalicious: receiverFlags?.isMalicious ?? merged.to?.isMalicious,
      isWhitelisted: merged.to?.isWhitelisted,
    });
  }

  for (const recipient of params.recipients ?? []) {
    if (!ethers.isAddress(recipient)) {
      continue;
    }
    const receiverSecurity =
      lightNodeData.addressSecurityByAddress?.[recipient.toLowerCase()];
    applyLightNodeSecurityCheck(merged, recipient, receiverSecurity);
  }

  return merged;
};

/**
 * Resolves bundled ABI from `AbiList` by matching the 4-byte selector to a
 * known function fragment. No external signature registry.
 */
const findAbiFromDataBySelector = (data: string): string | undefined => {
  if (!data || data.length < 10) {
    return undefined;
  }
  const selector = data.slice(0, 10);
  for (const entry of AbiList) {
    try {
      const iface = new Interface(entry.abi as any);
      let fn;
      try {
        fn = iface.getFunction(selector);
      } catch {
        continue;
      }
      if (fn == null) {
        continue;
      }
      return JSON.stringify(entry.abi);
    } catch {
      continue;
    }
  }
  return undefined;
};

const findAbiFromData = async (
  data: string,
  _chain?: EvmChain,
): Promise<string | undefined> => {
  return findAbiFromDataBySelector(data);
};

const getBundledAbiByDataSelector = (data: string): any[] | null => {
  const abiJson = findAbiFromDataBySelector(data);
  if (!abiJson) {
    return null;
  }
  try {
    return JSON.parse(abiJson);
  } catch {
    return null;
  }
};

const parseData = async (
  data: string,
  _chain: EvmChain,
): Promise<EvmTransactionDecodedData | undefined> => {
  if (!data || data.length < 10) {
    return undefined;
  }
  const abiJson = findAbiFromDataBySelector(data);
  if (!abiJson) {
    return undefined;
  }
  try {
    const iface = new Interface(JSON.parse(abiJson));
    const parsed = iface.parseTransaction({ data });
    if (parsed == null) {
      return undefined;
    }
    const inputs: EvmTransactionDecodedDataInput[] =
      parsed.fragment.inputs.map((input, index) => ({
        name: input.name,
        type: input.type,
        value: parsed.args[index],
        components: input.components,
      }));
    return {
      operationName: parsed.name,
      inputs,
    };
  } catch {
    return undefined;
  }
};

const parseArgs = (args: Result): any[] => {
  return args.toArray().map((arg) => {
    if (typeof arg === 'object') {
      return parseArgs(arg);
    }
    return arg;
  });
};

export const EvmTransactionParserUtils = {
  getDisplayInputType,
  shouldDisplayBalanceChange,
  getFieldWarnings,
  getAllWarnings,
  getHighestWarningLevel,
  getHighestWarning,
  getDomainWarnings,
  normalizeVerificationInformation,
  verifyTransactionInformation,
  enrichVerificationForAddresses,
  collectRecipientAddressesFromDecodedArgs,
  getAddressWarning,
  getSmartContractWarningAndInfo,
  parseData,
  findAbiFromData,
  getBundledAbiByDataSelector,
  isErc20TransferRecipientArg,
  isErc20TransferAmountArg,
  getErc20DecodedFieldName,
  resolveErc20TransferFromDecodedArgs,
  recipientInputNameList,
  amountInputNameList,
  parseArgs,
};

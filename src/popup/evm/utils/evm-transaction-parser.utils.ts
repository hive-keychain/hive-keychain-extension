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
import {
  GoPlusAddressSecurityInfo,
  GoPlusVerificationData,
} from '@popup/evm/interfaces/evm-verification.interface';
import { EvmAccountOrPublic } from '@popup/evm/interfaces/wallet.interface';
import { AbiList } from '@popup/evm/reference-data/abi.data';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmVerificationUtils } from '@popup/evm/utils/evm-verification.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers, Interface, Result } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import Logger from 'src/utils/logger.utils';

const recipientInputNameList = ['recipient', 'spender'];
const amountInputNameList = ['amount'];

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
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_domain_phishing',
      type: EvmTransactionWarningType.BASE,
    });
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

const applyGoPlusAddressSecurity = (
  verification: EvmTransactionVerificationInformation,
  address: string,
  addressSecurity?: GoPlusAddressSecurityInfo,
) => {
  if (!addressSecurity) {
    return;
  }
  setAddressVerificationFlags(verification, address, {
    isMalicious: EvmVerificationUtils.isAddressMalicious(addressSecurity),
  });
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
    warnings.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_receiver_malicious',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (
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
        ...(ensName ? { ensName } : {}),
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

  if (verifyTransactionInformation?.contract?.proxy?.target) {
    warningAndInfo.information!.push({
      message: 'evm_transaction_contract_use_proxy',
      messageParams: [verifyTransactionInformation.contract.proxy.target],
    });
  }

  if (
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

    const defaultLabel = usedToken?.name?.trim();

    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.LOW,
      type: EvmTransactionWarningType.WHITELIST_ADDRESS,
      message: 'evm_transaction_contract_not_used',
      extraData: {
        ...(defaultLabel ? { defaultLabel } : {}),
        resolveAllLabel: defaultLabel || address,
      },
      onConfirm: (label: string) => {
        return EvmAddressesUtils.saveContractAddress(address, chainId, label);
      },
    });
  }

  const contractInfo = verifyTransactionInformation?.contract;
  if (contractInfo?.isHoneypot) {
    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_contract_honeypot',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (contractInfo?.cannotSellAll) {
    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_contract_cannot_sell',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (contractInfo?.highSellTax || contractInfo?.highBuyTax) {
    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.MEDIUM,
      message: 'evm_transaction_contract_high_tax',
      type: EvmTransactionWarningType.BASE,
    });
  }
  if (contractInfo?.rugPullRisk) {
    warningAndInfo.warnings?.push({
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      message: 'evm_transaction_contract_rug_pull',
      type: EvmTransactionWarningType.BASE,
    });
  }

  const nftSecurity = verifyTransactionInformation?.goPlus?.nftSecurity;
  if (nftSecurity) {
    if (EvmVerificationUtils.isGoPlusTruthy(nftSecurity.restricted_approval)) {
      warningAndInfo.warnings?.push({
        ignored: false,
        level: EvmTransactionWarningLevel.HIGH,
        message: 'evm_transaction_nft_restricted_approval',
        type: EvmTransactionWarningType.BASE,
      });
    }
    if (
      EvmVerificationUtils.isGoPlusTruthy(
        nftSecurity.transfer_without_approval?.value,
      )
    ) {
      warningAndInfo.warnings?.push({
        ignored: false,
        level: EvmTransactionWarningLevel.MEDIUM,
        message: 'evm_transaction_nft_transfer_without_approval',
        type: EvmTransactionWarningType.BASE,
      });
    }
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

const mergeGoPlusIntoVerification = (
  verification: EvmTransactionVerificationInformation,
  goPlusData: GoPlusVerificationData,
): EvmTransactionVerificationInformation => {
  if (!goPlusData || Object.keys(goPlusData).length === 0) {
    return verification;
  }

  const merged: EvmTransactionVerificationInformation = {
    ...verification,
    goPlus: goPlusData,
    domain: { ...verification.domain },
    to: { ...verification.to },
    contract: { ...verification.contract },
  };

  if (goPlusData.phishingSite?.phishing_site === 1) {
    merged.domain.isPhishing = true;
  }

  if (goPlusData.addressSecurityByAddress) {
    for (const [address, addressSecurity] of Object.entries(
      goPlusData.addressSecurityByAddress,
    )) {
      applyGoPlusAddressSecurity(merged, address, addressSecurity);
    }
  } else if (goPlusData.addressSecurity) {
    if (EvmVerificationUtils.isAddressMalicious(goPlusData.addressSecurity)) {
      merged.to.isMalicious = true;
    }
  }

  const tokenSecurity = goPlusData.tokenSecurity;
  if (tokenSecurity) {
    if (EvmVerificationUtils.isGoPlusTruthy(tokenSecurity.is_honeypot)) {
      merged.contract.isHoneypot = true;
    }
    if (EvmVerificationUtils.isGoPlusTruthy(tokenSecurity.cannot_sell_all)) {
      merged.contract.cannotSellAll = true;
    }
    if (EvmVerificationUtils.isHighTax(tokenSecurity.sell_tax)) {
      merged.contract.highSellTax = true;
    }
    if (EvmVerificationUtils.isHighTax(tokenSecurity.buy_tax)) {
      merged.contract.highBuyTax = true;
    }
  }

  const rugPull = goPlusData.rugPull;
  if (rugPull) {
    const hasRugPullRisk =
      EvmVerificationUtils.isGoPlusTruthy(rugPull.blacklist) ||
      EvmVerificationUtils.isGoPlusTruthy(rugPull.selfdestruct) ||
      EvmVerificationUtils.isGoPlusTruthy(rugPull.approval_abuse) ||
      EvmVerificationUtils.isGoPlusTruthy(rugPull.privilege_withdraw) ||
      EvmVerificationUtils.isGoPlusTruthy(rugPull.withdraw_missing);
    if (hasRugPullRisk) {
      merged.contract.rugPullRisk = true;
    }
  }

  return merged;
};

const fetchKeychainVerification = async (
  params: VerifyTransactionParams = {},
): Promise<Partial<EvmTransactionVerificationInformation>> => {
  let url = `evm/verify-transaction?`;
  if (params.domain) {
    url += `domain=${encodeURIComponent(params.domain)}`;
  }
  if (params.to) {
    url += `${params.domain ? '&' : ''}to=${encodeURIComponent(params.to)}`;
  }
  if (params.contract) {
    url += `${params.domain || params.to ? '&' : ''}contract=${encodeURIComponent(params.contract)}`;
  }

  return await KeychainApi.get(url);
};

const enrichVerificationForAddresses = async (
  verification: EvmTransactionVerificationInformation,
  addresses: string[],
  params: { chainId: string; domain?: string },
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

  const goPlusChainId = EvmVerificationUtils.toGoPlusChainId(params.chainId);

  await Promise.all(
    uniqueAddresses.map(async (address) => {
      const [keychainResult, goPlusSecurity] = await Promise.all([
        fetchKeychainVerification({
          domain: params.domain,
          to: address,
        }).catch(
          () => ({}) as Partial<EvmTransactionVerificationInformation>,
        ),
        goPlusChainId
          ? EvmVerificationUtils.getAddressSecurity(address, goPlusChainId)
              .then((response) =>
                response.code === EvmVerificationUtils.GOPLUS_SUCCESS_CODE
                  ? response.result
                  : undefined,
              )
              .catch(() => undefined)
          : Promise.resolve(undefined),
      ]);

      if (keychainResult.to) {
        setAddressVerificationFlags(verification, address, {
          isBlacklisted: keychainResult.to.isBlacklisted,
          isWhitelisted: keychainResult.to.isWhitelisted,
        });
      }

      applyGoPlusAddressSecurity(verification, address, goPlusSecurity);
    }),
  );

  return verification;
};

const verifyTransactionInformation = async (
  params: VerifyTransactionParams = {},
): Promise<EvmTransactionVerificationInformation> => {
  const [keychainResult, goPlusResult] = await Promise.allSettled([
    fetchKeychainVerification(params),
    EvmVerificationUtils.fetchGoPlusVerificationData(params),
  ]);

  let verification: EvmTransactionVerificationInformation;

  if (keychainResult.status === 'fulfilled') {
    verification = normalizeVerificationInformation(
      keychainResult.value,
      params.proxyTarget,
    );
  } else {
    Logger.error(
      'Error while fetching transaction information',
      keychainResult.reason,
    );
    verification = normalizeVerificationInformation(
      { unableToReach: true },
      params.proxyTarget,
    );
  }

  const goPlusData =
    goPlusResult.status === 'fulfilled' ? goPlusResult.value : { unavailable: true };

  if (goPlusResult.status === 'rejected') {
    Logger.error('GoPlus verification failed', goPlusResult.reason);
  }

  const merged = mergeGoPlusIntoVerification(verification, goPlusData);

  if (params.to && ethers.isAddress(params.to)) {
    setAddressVerificationFlags(merged, params.to, {
      isBlacklisted: merged.to?.isBlacklisted,
      isMalicious: merged.to?.isMalicious,
      isWhitelisted: merged.to?.isWhitelisted,
    });
  }

  for (const recipient of params.recipients ?? []) {
    if (!ethers.isAddress(recipient)) {
      continue;
    }
    const goPlusSecurity =
      goPlusData.addressSecurityByAddress?.[recipient.toLowerCase()];
    applyGoPlusAddressSecurity(merged, recipient, goPlusSecurity);
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
  recipientInputNameList,
  amountInputNameList,
  parseArgs,
};

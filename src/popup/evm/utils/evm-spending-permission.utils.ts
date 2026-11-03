import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);
const MAX_UINT160 = (BigInt(1) << BigInt(160)) - BigInt(1);

const APPROVE_AMOUNT_NAMES = ['amount', 'value', '_value', 'wad'];
const APPROVE_SPENDER_NAMES = ['spender', '_spender', 'usr', 'guy'];
const NFT_TOKEN_ID_NAMES = ['tokenid', '_tokenid', 'id', '_id'];
const OPERATOR_NAMES = ['operator', '_operator', 'to', '_to', 'spender', '_spender'];
const BOOL_NAMES = ['approved', '_approved', 'allowed'];

export type SpendingPermissionKind =
  | 'erc20-allowance'
  | 'erc721-approve'
  | 'operator-approval'
  | 'operator-revoke';

export type SpendingAmountBits = 160 | 256;

export type SpendingPermissionEntry = {
  kind: SpendingPermissionKind;
  tokenAddress?: string;
  tokenSymbol?: string;
  spender?: string;
  amountRaw?: bigint;
  tokenId?: string;
  unlimited: boolean;
  requiresWarning: boolean;
  amountInputName?: string;
};

export type ClassifiedSpendingPermission = {
  operationNameKey: string;
  entries: SpendingPermissionEntry[];
};

export type DecodedCallInput = {
  name?: string;
  type?: string;
};

export type ClassifyDecodedCallParams = {
  method?: string;
  inputs?: ReadonlyArray<DecodedCallInput>;
  args?: ReadonlyArray<unknown>;
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenType?: EVMSmartContractType | string | null;
};

export type TypedDataMessage = {
  primaryType?: string;
  domain?: {
    name?: string;
    verifyingContract?: string;
  };
  message?: unknown;
};

const normalizeName = (value?: string) => (value ?? '').trim().toLowerCase();

const isNftTokenType = (tokenType?: string | null) => {
  const normalized = `${tokenType ?? ''}`.toUpperCase();
  return (
    normalized.includes('ERC721') ||
    normalized.includes('ERC1155')
  );
};

const isUnlimitedAmount = (raw: bigint, bits: SpendingAmountBits) => {
  return raw === (bits === 160 ? MAX_UINT160 : MAX_UINT256);
};

const toBigIntValue = (value: unknown): bigint | undefined => {
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return BigInt(Math.trunc(value));
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      return BigInt(value.trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const toAddress = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const address = value.trim();
  return address.startsWith('0x') && address.length === 42 ? address : undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
};

const readNamed = (
  record: Record<string, unknown> | undefined,
  names: string[],
) => {
  if (!record) {
    return undefined;
  }
  const keys = Object.keys(record);
  for (const name of names) {
    const match = keys.find((key) => key.toLowerCase() === name.toLowerCase());
    if (match) {
      return record[match];
    }
  }
  return undefined;
};

const findInputIndex = (
  inputs: ReadonlyArray<DecodedCallInput>,
  names: string[],
  typePrefix?: string,
) => {
  const byName = inputs.findIndex((input) =>
    names.includes(normalizeName(input.name)),
  );
  if (byName >= 0) {
    return byName;
  }
  if (!typePrefix) {
    return -1;
  }
  return inputs.findIndex((input) =>
    normalizeName(input.type).startsWith(typePrefix),
  );
};

const allowanceEntry = (params: {
  tokenAddress?: string;
  tokenSymbol?: string;
  spender?: string;
  amountRaw?: bigint;
  bits: SpendingAmountBits;
  amountInputName?: string;
  unlimited?: boolean;
}): SpendingPermissionEntry => {
  const unlimited =
    params.unlimited ??
    (params.amountRaw !== undefined &&
      isUnlimitedAmount(params.amountRaw, params.bits));
  return {
    kind: 'erc20-allowance',
    tokenAddress: params.tokenAddress,
    tokenSymbol: params.tokenSymbol,
    spender: params.spender,
    amountRaw: params.amountRaw,
    unlimited,
    requiresWarning: unlimited,
    amountInputName: params.amountInputName,
  };
};

const operationNameKeyFor = (entries: SpendingPermissionEntry[]) => {
  if (entries.some((entry) => entry.unlimited)) {
    return 'evm_operation_unlimited_approval';
  }
  if (
    entries.length > 0 &&
    entries.every((entry) => entry.kind === 'operator-revoke')
  ) {
    return 'evm_operation_revoke_operator';
  }
  if (
    entries.length > 0 &&
    entries.every((entry) => entry.kind === 'erc721-approve')
  ) {
    return 'evm_operation_approve_nft';
  }
  return 'evm_operation_approve';
};

const permissionFromEntries = (
  entries: SpendingPermissionEntry[],
): ClassifiedSpendingPermission | null => {
  if (!entries.length) {
    return null;
  }
  return {
    operationNameKey: operationNameKeyFor(entries),
    entries,
  };
};

const classifyApprove = (
  params: ClassifyDecodedCallParams,
  inputs: ReadonlyArray<DecodedCallInput>,
  args: ReadonlyArray<unknown>,
): ClassifiedSpendingPermission | null => {
  const tokenIdIndex = findInputIndex(inputs, NFT_TOKEN_ID_NAMES);
  const nftByType = isNftTokenType(params.tokenType);
  if (nftByType || tokenIdIndex >= 0) {
    const idIndex =
      tokenIdIndex >= 0
        ? tokenIdIndex
        : findInputIndex(inputs, APPROVE_AMOUNT_NAMES, 'uint');
    const spenderIndex = findInputIndex(
      inputs,
      ['approved', '_approved', 'to', '_to', ...APPROVE_SPENDER_NAMES],
      'address',
    );
    const tokenId = idIndex >= 0 ? toBigIntValue(args[idIndex]) : undefined;
    if (tokenId === undefined && spenderIndex < 0) {
      return null;
    }
    return permissionFromEntries([
      {
        kind: 'erc721-approve',
        tokenAddress: params.tokenAddress,
        tokenSymbol: params.tokenSymbol,
        spender: spenderIndex >= 0 ? toAddress(args[spenderIndex]) : undefined,
        tokenId: tokenId?.toString(),
        unlimited: false,
        requiresWarning: false,
      },
    ]);
  }

  const amountIndex = findInputIndex(inputs, APPROVE_AMOUNT_NAMES, 'uint');
  const spenderIndex = findInputIndex(inputs, APPROVE_SPENDER_NAMES, 'address');
  if (amountIndex < 0 || spenderIndex < 0) {
    return null;
  }
  const amountRaw = toBigIntValue(args[amountIndex]);
  if (amountRaw === undefined) {
    return null;
  }
  return permissionFromEntries([
    allowanceEntry({
      tokenAddress: params.tokenAddress,
      tokenSymbol: params.tokenSymbol,
      spender: toAddress(args[spenderIndex]),
      amountRaw,
      bits: 256,
      amountInputName: inputs[amountIndex]?.name,
    }),
  ]);
};

const classifySetApprovalForAll = (
  params: ClassifyDecodedCallParams,
  inputs: ReadonlyArray<DecodedCallInput>,
  args: ReadonlyArray<unknown>,
): ClassifiedSpendingPermission | null => {
  const operatorIndex = findInputIndex(inputs, OPERATOR_NAMES, 'address');
  const approvedIndex = findInputIndex(inputs, BOOL_NAMES, 'bool');
  if (approvedIndex < 0) {
    return null;
  }
  const approved = toBoolean(args[approvedIndex]);
  if (approved === undefined) {
    return null;
  }
  return permissionFromEntries([
    {
      kind: approved ? 'operator-approval' : 'operator-revoke',
      tokenAddress: params.tokenAddress,
      tokenSymbol: params.tokenSymbol,
      spender: operatorIndex >= 0 ? toAddress(args[operatorIndex]) : undefined,
      unlimited: false,
      requiresWarning: approved,
      amountInputName: inputs[approvedIndex]?.name,
    },
  ]);
};

const classifyPermitCall = (
  params: ClassifyDecodedCallParams,
  inputs: ReadonlyArray<DecodedCallInput>,
  args: ReadonlyArray<unknown>,
): ClassifiedSpendingPermission | null => {
  const allowedIndex = findInputIndex(inputs, ['allowed'], 'bool');
  const spenderIndex = findInputIndex(inputs, APPROVE_SPENDER_NAMES, 'address');
  if (allowedIndex >= 0) {
    const allowed = toBoolean(args[allowedIndex]);
    if (allowed === undefined) {
      return null;
    }
    return permissionFromEntries([
      allowanceEntry({
        tokenAddress: params.tokenAddress,
        tokenSymbol: params.tokenSymbol,
        spender: spenderIndex >= 0 ? toAddress(args[spenderIndex]) : undefined,
        bits: 256,
        unlimited: allowed,
        amountInputName: inputs[allowedIndex]?.name,
      }),
    ]);
  }

  const amountIndex = findInputIndex(inputs, APPROVE_AMOUNT_NAMES, 'uint');
  if (amountIndex < 0 || spenderIndex < 0) {
    return null;
  }
  const amountRaw = toBigIntValue(args[amountIndex]);
  if (amountRaw === undefined) {
    return null;
  }
  return permissionFromEntries([
    allowanceEntry({
      tokenAddress: params.tokenAddress,
      tokenSymbol: params.tokenSymbol,
      spender: toAddress(args[spenderIndex]),
      amountRaw,
      bits: 256,
      amountInputName: inputs[amountIndex]?.name,
    }),
  ]);
};

const classifyDecodedCall = (
  params: ClassifyDecodedCallParams,
): ClassifiedSpendingPermission | null => {
  const method = normalizeName(params.method);
  const inputs = params.inputs ?? [];
  const args = params.args ?? [];
  if (!method || !inputs.length) {
    return null;
  }
  if (method === 'approve') {
    return classifyApprove(params, inputs, args);
  }
  if (method === 'setapprovalforall') {
    return classifySetApprovalForAll(params, inputs, args);
  }
  if (method === 'permit') {
    return classifyPermitCall(params, inputs, args);
  }
  return null;
};

const tokenFromRecord = (record: Record<string, unknown> | undefined) =>
  toAddress(readNamed(record, ['token', 'tokenAddress']));

const allowanceFromDetails = (
  details: Record<string, unknown>,
  spender: string | undefined,
  bits: SpendingAmountBits,
  fallbackToken?: string,
  fallbackSymbol?: string,
): SpendingPermissionEntry | null => {
  const amountRaw = toBigIntValue(readNamed(details, ['amount', 'value']));
  if (amountRaw === undefined) {
    return null;
  }
  return allowanceEntry({
    tokenAddress: tokenFromRecord(details) ?? fallbackToken,
    tokenSymbol: fallbackSymbol,
    spender,
    amountRaw,
    bits,
  });
};

const classifyPermitMessage = (
  message: Record<string, unknown>,
  tokenAddress?: string,
  tokenSymbol?: string,
): ClassifiedSpendingPermission | null => {
  const spender = toAddress(readNamed(message, ['spender']));
  const allowed = toBoolean(readNamed(message, ['allowed']));
  if (allowed !== undefined) {
    return permissionFromEntries([
      allowanceEntry({
        tokenAddress,
        tokenSymbol,
        spender,
        bits: 256,
        unlimited: allowed,
      }),
    ]);
  }
  const amountRaw = toBigIntValue(readNamed(message, ['value', 'amount']));
  if (amountRaw === undefined) {
    return null;
  }
  return permissionFromEntries([
    allowanceEntry({
      tokenAddress,
      tokenSymbol,
      spender,
      amountRaw,
      bits: 256,
    }),
  ]);
};

const classifyPermit2Allowances = (
  message: Record<string, unknown>,
  tokenSymbol?: string,
): ClassifiedSpendingPermission | null => {
  const spender = toAddress(readNamed(message, ['spender']));
  const details = readNamed(message, ['details']);
  const detailRecords = Array.isArray(details)
    ? details.map(asRecord).filter((entry): entry is Record<string, unknown> => !!entry)
    : [asRecord(details)].filter(
        (entry): entry is Record<string, unknown> => !!entry,
      );
  const entries = detailRecords
    .map((detail) =>
      allowanceFromDetails(detail, spender, 160, undefined, tokenSymbol),
    )
    .filter((entry): entry is SpendingPermissionEntry => !!entry);
  return permissionFromEntries(entries);
};

const classifyPermit2Transfer = (
  message: Record<string, unknown>,
  tokenSymbol?: string,
): ClassifiedSpendingPermission | null => {
  const spender = toAddress(readNamed(message, ['spender']));
  const permitted = readNamed(message, ['permitted']);
  const permittedRecords = Array.isArray(permitted)
    ? permitted.map(asRecord).filter((entry): entry is Record<string, unknown> => !!entry)
    : [asRecord(permitted)].filter(
        (entry): entry is Record<string, unknown> => !!entry,
      );
  const entries = permittedRecords
    .map((detail) =>
      allowanceFromDetails(detail, spender, 256, undefined, tokenSymbol),
    )
    .filter((entry): entry is SpendingPermissionEntry => !!entry);
  return permissionFromEntries(entries);
};

const classifyTypedData = (
  typedData: TypedDataMessage | null | undefined,
): ClassifiedSpendingPermission | null => {
  const primaryType = normalizeName(typedData?.primaryType);
  const message = asRecord(typedData?.message);
  if (!primaryType || !message) {
    return null;
  }
  const tokenAddress = toAddress(typedData?.domain?.verifyingContract);
  const tokenSymbol = typedData?.domain?.name;
  if (primaryType === 'permit') {
    return classifyPermitMessage(message, tokenAddress, tokenSymbol);
  }
  if (primaryType === 'permitsingle' || primaryType === 'permitbatch') {
    return classifyPermit2Allowances(message);
  }
  if (
    primaryType === 'permittransferfrom' ||
    primaryType === 'permitwitnesstransferfrom'
  ) {
    return classifyPermit2Transfer(message);
  }
  return null;
};

const buildWarning = (
  entry: SpendingPermissionEntry,
): EvmTransactionWarning | undefined => {
  if (!entry.requiresWarning) {
    return undefined;
  }
  const spender = entry.spender ?? '';
  const asset = entry.tokenSymbol || entry.tokenAddress || '';
  if (entry.kind === 'operator-approval') {
    return {
      ignored: false,
      level: EvmTransactionWarningLevel.HIGH,
      type: EvmTransactionWarningType.BASE,
      message: 'evm_warning_approve_operator',
      messageParams: [spender, asset],
    };
  }
  return {
    ignored: false,
    level: EvmTransactionWarningLevel.HIGH,
    type: EvmTransactionWarningType.BASE,
    message: 'evm_warning_unlimited_approval',
    messageParams: [spender, asset],
  };
};

const findAmountField = (
  fields: TransactionConfirmationField[],
  entry: SpendingPermissionEntry,
) => {
  if (
    entry.kind === 'operator-approval' ||
    entry.kind === 'operator-revoke'
  ) {
    return fields.find(
      (field) =>
        field.name === 'evm_nft_approve_all' ||
        field.name === entry.amountInputName,
    );
  }
  return fields.find(
    (field) =>
      field.name === 'evm_operation_amount' ||
      (!!entry.amountInputName && field.name === entry.amountInputName),
  );
};

const applyDecodedFields = (
  fields: TransactionConfirmationField[],
  permission: ClassifiedSpendingPermission,
  formatUnlimited: (symbol: string) => string,
): TransactionConfirmationField[] => {
  const next = fields.map((field) => ({
    ...field,
    warnings: field.warnings ? [...field.warnings] : field.warnings,
  }));

  for (const entry of permission.entries) {
    const warning = buildWarning(entry);
    const amountField = findAmountField(next, entry);
    if (amountField && entry.unlimited && entry.kind === 'erc20-allowance') {
      amountField.value = formatUnlimited(
        entry.tokenSymbol || entry.tokenAddress || '',
      );
    }
    if (!warning) {
      continue;
    }
    if (amountField) {
      amountField.warnings = [...(amountField.warnings ?? []), warning];
      continue;
    }
    next.push({
      name: warning.message,
      type: 'warning-only',
      value: null,
      warnings: [warning],
    });
  }

  return next;
};

export const EvmSpendingPermissionUtils = {
  isUnlimitedAmount,
  classifyDecodedCall,
  classifyTypedData,
  buildWarning,
  applyDecodedFields,
};

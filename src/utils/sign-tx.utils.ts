import type { Operation, Transaction } from '@hiveio/dhive';
import Config from 'src/config';

const HIVE_BLOCK_INTERVAL_MS = 3 * 1000;
const MAX_FUTURE_EXPIRATION_MS =
  Config.transactions.expirationTimeInMinutes * 60 * 1000;
const MAX_REF_BLOCK_AGE =
  Math.ceil(MAX_FUTURE_EXPIRATION_MS / HIVE_BLOCK_INTERVAL_MS) + 20;
const LARGE_PAYLOAD_WARNING_THRESHOLD = 4000;

const HIGH_RISK_OPERATION_TYPES = new Set([
  'account_update',
  'account_update2',
  'account_witness_proxy',
  'change_recovery_account',
  'create_account',
  'create_account_with_delegation',
  'custom',
  'custom_binary',
  'escrow_transfer',
  'limit_order_cancel',
  'limit_order_create',
  'limit_order_create2',
  'recover_account',
  'request_account_recovery',
  'reset_account',
  'set_reset_account',
  'set_withdraw_vesting_route',
  'witness_set_properties',
  'witness_update',
]);

type JsonObject = Record<string, unknown>;

export type SignTxOperation = [string, JsonObject];

export type SignTxTransaction = Transaction & {
  extensions: unknown[];
  signatures?: string[];
  [key: string]: unknown;
};

export type SignTxReviewOperation = {
  index: number;
  type: string;
  summary: string;
  details: string[];
  isKnownType: boolean;
  isHighRisk: boolean;
};

export type SignTxReview = {
  expirationDate: Date;
  expiration: string;
  expirationDisplay: string;
  operationCount: number;
  operationTypes: string[];
  operations: SignTxReviewOperation[];
  hasMultipleOperations: boolean;
  hasHighRiskOperation: boolean;
  hasLargePayload: boolean;
  requiresExplicitApproval: boolean;
  warningHeader: string;
  warningItems: string[];
  payloadSize: number;
  signatureCount: number;
};

export type SignTxValidationError = {
  code:
    | 'invalid_payload'
    | 'invalid_operations'
    | 'invalid_extensions'
    | 'invalid_expiration'
    | 'expired'
    | 'expiration_too_far'
    | 'invalid_ref_block'
    | 'stale_ref_block';
  message: string;
};

type StructuredSignTx = {
  transaction: SignTxTransaction;
  expirationDate: Date;
  payloadSize: number;
  operationTypes: string[];
  operations: SignTxOperation[];
};

type StructuredResult =
  | { ok: true; value: StructuredSignTx }
  | { ok: false; error: SignTxValidationError };

export type SignTxValidationResult =
  | {
      ok: true;
      value: { transaction: SignTxTransaction; review: SignTxReview };
    }
  | { ok: false; error: SignTxValidationError };

const toValidationError = (
  code: SignTxValidationError['code'],
  message: string,
): SignTxValidationError => ({ code, message });

const isPlainObject = (value: unknown): value is JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const formatAccount = (value: unknown) =>
  typeof value === 'string' && value.trim().length
    ? `@${value.trim().replace(/^@+/, '')}`
    : 'unknown account';

const formatExpirationDisplay = (date: Date) =>
  `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC`;

const truncate = (value: string, maxLength = 160) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

const getString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : undefined;

const getInteger = (value: unknown) => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const getStringArray = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : [];

const parseUtcExpiration = (value: string) => {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/,
  );
  if (!match) {
    return null;
  }

  const [, year, month, day, hours, minutes, seconds] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
    ),
  );

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    date.getUTCHours() !== Number(hours) ||
    date.getUTCMinutes() !== Number(minutes) ||
    date.getUTCSeconds() !== Number(seconds)
  ) {
    return null;
  }

  return date;
};

const parseExpiration = (value: unknown) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string' || !value.trim().length) {
    return null;
  }

  const trimmed = value.trim();
  const parsedUtc = parseUtcExpiration(trimmed);
  if (parsedUtc) {
    return parsedUtc;
  }

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const normalizeExpiration = (date: Date) => date.toISOString().slice(0, 19);

const getMemoDetail = (memo: unknown) => {
  const formattedMemo = getString(memo);
  if (!formattedMemo) {
    return undefined;
  }
  return `Memo: ${truncate(formattedMemo, 120)}`;
};

const getAuthorityLabels = (value: JsonObject) => {
  const labels: string[] = [];
  if (isPlainObject(value.owner)) labels.push('owner');
  if (isPlainObject(value.active)) labels.push('active');
  if (isPlainObject(value.posting)) labels.push('posting');
  if (getString(value.memo_key)) labels.push('memo_key');
  return labels;
};

const getGenericOperationDetails = (type: string, value: JsonObject) => {
  const details: string[] = [];
  const from = getString(value.from);
  const to = getString(value.to);
  const account = getString(value.account) || getString(value.owner);
  const amount =
    getString(value.amount) || getString(value.hive_amount) || getString(value.hbd_amount);

  if (from && to) {
    details.push(`${formatAccount(from)} -> ${formatAccount(to)}`);
  } else if (account) {
    details.push(`Account: ${formatAccount(account)}`);
  }

  if (amount) {
    details.push(`Amount: ${amount}`);
  }

  const permlink = getString(value.permlink);
  if (permlink) {
    details.push(`Permlink: ${truncate(permlink, 80)}`);
  }

  if (!details.length) {
    details.push(`Advanced ${type} operation. Review raw details.`);
  }

  return details;
};

const summarizeOperation = (
  operation: SignTxOperation,
  index: number,
): SignTxReviewOperation => {
  const [type, value] = operation;
  const isHighRisk = HIGH_RISK_OPERATION_TYPES.has(type);

  switch (type) {
    case 'transfer':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Transfer ${getString(value.amount) || 'unknown amount'} from ${formatAccount(
          value.from,
        )} to ${formatAccount(value.to)}`,
        details: [getMemoDetail(value.memo)].filter(Boolean) as string[],
      };
    case 'recurrent_transfer':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Recurrent transfer ${
          getString(value.amount) || 'unknown amount'
        } from ${formatAccount(value.from)} to ${formatAccount(value.to)}`,
        details: [
          `Recurrence: every ${getInteger(value.recurrence) ?? '?'} hours`,
          `Executions: ${getInteger(value.executions) ?? '?'}`,
          getMemoDetail(value.memo),
        ].filter(Boolean) as string[],
      };
    case 'transfer_to_savings':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Transfer to savings ${
          getString(value.amount) || 'unknown amount'
        } from ${formatAccount(value.from)} to ${formatAccount(value.to)}`,
        details: [getMemoDetail(value.memo)].filter(Boolean) as string[],
      };
    case 'transfer_from_savings':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Withdraw from savings ${
          getString(value.amount) || 'unknown amount'
        } from ${formatAccount(value.from)} to ${formatAccount(value.to)}`,
        details: [getMemoDetail(value.memo)].filter(Boolean) as string[],
      };
    case 'transfer_to_vesting':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Power up ${
          getString(value.amount) || 'unknown amount'
        } from ${formatAccount(value.from)} to ${formatAccount(
          value.to || value.from,
        )}`,
        details: [],
      };
    case 'vote':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Vote by ${formatAccount(value.voter)} on ${formatAccount(
          value.author,
        )}/${getString(value.permlink) || 'unknown-permlink'}`,
        details: [
          `Weight: ${getInteger(value.weight) ?? getString(value.weight) ?? '?'}`,
        ],
      };
    case 'comment':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Post/comment by ${formatAccount(value.author)}`,
        details: [
          `Permlink: ${truncate(getString(value.permlink) || 'unknown-permlink', 80)}`,
          getString(value.parent_author)
            ? `Replying to ${formatAccount(value.parent_author)}`
            : undefined,
        ].filter(Boolean) as string[],
      };
    case 'delete_comment':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Delete comment by ${formatAccount(value.author)}`,
        details: [
          `Permlink: ${truncate(getString(value.permlink) || 'unknown-permlink', 80)}`,
        ],
      };
    case 'custom_json': {
      const requiredPostingAuths = getStringArray(value.required_posting_auths);
      const requiredAuths = getStringArray(value.required_auths);
      const json = getString(value.json);
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Custom JSON ${getString(value.id) || '(no id)'} using ${
          requiredAuths.length ? 'active' : 'posting'
        } auth`,
        details: [
          requiredPostingAuths.length
            ? `Posting auths: ${requiredPostingAuths
                .map((account) => formatAccount(account))
                .join(', ')}`
            : undefined,
          requiredAuths.length
            ? `Active auths: ${requiredAuths
                .map((account) => formatAccount(account))
                .join(', ')}`
            : undefined,
          json ? `JSON: ${truncate(json, 140)}` : undefined,
        ].filter(Boolean) as string[],
      };
    }
    case 'account_update':
    case 'account_update2': {
      const authorityLabels = getAuthorityLabels(value);
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk: true,
        summary: `Account update for ${formatAccount(value.account)}`,
        details: [
          authorityLabels.length
            ? `Updates: ${authorityLabels.join(', ')}`
            : 'Advanced account update. Review raw details.',
        ],
      };
    }
    case 'delegate_vesting_shares':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Delegate ${
          getString(value.vesting_shares) || 'unknown amount'
        } from ${formatAccount(value.delegator)} to ${formatAccount(
          value.delegatee,
        )}`,
        details: [],
      };
    case 'account_witness_vote':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk,
        summary: `Witness vote by ${formatAccount(value.account)}`,
        details: [
          `Witness: ${formatAccount(value.witness)}`,
          `Approve: ${value.approve ? 'yes' : 'no'}`,
        ],
      };
    case 'account_witness_proxy':
      return {
        index,
        type,
        isKnownType: true,
        isHighRisk: true,
        summary: `Set witness proxy for ${formatAccount(value.account)}`,
        details: [
          getString(value.proxy)
            ? `Proxy: ${formatAccount(value.proxy)}`
            : 'Clears the witness proxy',
        ],
      };
    default:
      return {
        index,
        type,
        isKnownType: false,
        isHighRisk,
        summary: `${type} (advanced operation)`,
        details: getGenericOperationDetails(type, value),
      };
  }
};

const buildReview = (value: StructuredSignTx): SignTxReview => {
  const operations = value.operations.map((operation, index) =>
    summarizeOperation(operation, index),
  );
  const signatureCount = value.transaction.signatures?.length || 0;
  const hasMultipleOperations = operations.length > 1;
  const hasHighRiskOperation = operations.some((operation) => operation.isHighRisk);
  const requiresExplicitApproval = operations.some(
    (operation) => !operation.isKnownType,
  );
  const hasLargePayload = value.payloadSize > LARGE_PAYLOAD_WARNING_THRESHOLD;

  const warningItems = [
    'This request signs a raw Hive transaction. Only approve it if you trust the site and understand the operations.',
    hasMultipleOperations
      ? `This transaction includes ${operations.length} operations.`
      : undefined,
    hasHighRiskOperation
      ? `High-risk operations detected: ${[
          ...new Set(
            operations
              .filter((operation) => operation.isHighRisk)
              .map((operation) => operation.type),
          ),
        ].join(', ')}.`
      : undefined,
    hasLargePayload ? 'This transaction payload is unusually large.' : undefined,
    signatureCount
      ? `This transaction already contains ${signatureCount} signature(s).`
      : undefined,
    requiresExplicitApproval
      ? 'Some operations could only be partially summarized. Advanced confirmation is required.'
      : undefined,
  ].filter(Boolean) as string[];

  let warningHeader =
    'Raw transaction signing request. Review the transaction carefully before approving.';
  if (requiresExplicitApproval) {
    warningHeader =
      'Partially summarized raw transaction. Advanced confirmation is required.';
  } else if (hasHighRiskOperation || hasLargePayload || hasMultipleOperations) {
    warningHeader =
      'High-risk raw transaction. Review every operation carefully before approving.';
  }

  return {
    expirationDate: value.expirationDate,
    expiration: value.transaction.expiration,
    expirationDisplay: formatExpirationDisplay(value.expirationDate),
    operationCount: operations.length,
    operationTypes: value.operationTypes,
    operations,
    hasMultipleOperations,
    hasHighRiskOperation,
    hasLargePayload,
    requiresExplicitApproval,
    warningHeader,
    warningItems,
    payloadSize: value.payloadSize,
    signatureCount,
  };
};

const getStructuredSignTx = (rawTx: unknown): StructuredResult => {
  if (!isPlainObject(rawTx)) {
    return {
      ok: false,
      error: toValidationError('invalid_payload', 'Invalid transaction payload.'),
    };
  }

  if (!Array.isArray(rawTx.operations) || !rawTx.operations.length) {
    return {
      ok: false,
      error: toValidationError(
        'invalid_operations',
        'This transaction must include at least one operation.',
      ),
    };
  }

  if (rawTx.extensions !== undefined && !Array.isArray(rawTx.extensions)) {
    return {
      ok: false,
      error: toValidationError(
        'invalid_extensions',
        'Invalid transaction extensions.',
      ),
    };
  }

  if (
    rawTx.signatures !== undefined &&
    (!Array.isArray(rawTx.signatures) ||
      rawTx.signatures.some((signature) => typeof signature !== 'string'))
  ) {
    return {
      ok: false,
      error: toValidationError('invalid_payload', 'Invalid transaction payload.'),
    };
  }

  const refBlockNum = getInteger(rawTx.ref_block_num);
  const refBlockPrefix = getInteger(rawTx.ref_block_prefix);

  if (
    refBlockNum === undefined ||
    refBlockNum <= 0 ||
    refBlockPrefix === undefined ||
    refBlockPrefix <= 0
  ) {
    return {
      ok: false,
      error: toValidationError(
        'invalid_ref_block',
        'Invalid transaction reference block fields.',
      ),
    };
  }

  const expirationDate = parseExpiration(rawTx.expiration);
  if (!expirationDate) {
    return {
      ok: false,
      error: toValidationError(
        'invalid_expiration',
        'Invalid transaction expiration.',
      ),
    };
  }

  const operations: SignTxOperation[] = [];
  for (const operation of rawTx.operations as unknown[]) {
    if (
      !Array.isArray(operation) ||
      operation.length < 2 ||
      typeof operation[0] !== 'string' ||
      !isPlainObject(operation[1])
    ) {
      return {
        ok: false,
        error: toValidationError(
          'invalid_operations',
          'This transaction contains an invalid operation payload.',
        ),
      };
    }
    operations.push([operation[0], operation[1]]);
  }

  const transaction = {
    ...rawTx,
    ref_block_num: refBlockNum,
    ref_block_prefix: refBlockPrefix,
    expiration: normalizeExpiration(expirationDate),
    operations: operations as Operation[],
    extensions: Array.isArray(rawTx.extensions) ? rawTx.extensions : [],
  } as SignTxTransaction;

  return {
    ok: true,
    value: {
      transaction,
      expirationDate,
      payloadSize: JSON.stringify(transaction).length,
      operationTypes: operations.map(([type]) => type),
      operations,
    },
  };
};

const validateExpirationWindow = (
  structured: StructuredSignTx,
  now: Date,
): SignTxValidationError | null => {
  const expirationTime = structured.expirationDate.getTime();
  if (expirationTime <= now.getTime()) {
    return toValidationError('expired', 'This transaction has already expired.');
  }

  if (expirationTime - now.getTime() > MAX_FUTURE_EXPIRATION_MS) {
    return toValidationError(
      'expiration_too_far',
      'Transaction expiration is too far in the future.',
    );
  }

  return null;
};

const validateHeadBlockFreshness = (
  structured: StructuredSignTx,
  currentHeadBlockNumber: number,
): SignTxValidationError | null => {
  if (!Number.isInteger(currentHeadBlockNumber) || currentHeadBlockNumber <= 0) {
    return null;
  }

  const currentRefBlockNum = currentHeadBlockNumber & 0xffff;

  // TODO: tighten this with full ref block lookup if this path starts carrying
  // block id context. The modulo-only comparison is only reliable away from wrap.
  if (currentRefBlockNum >= structured.transaction.ref_block_num) {
    const blockLag = currentRefBlockNum - structured.transaction.ref_block_num;
    if (blockLag > MAX_REF_BLOCK_AGE) {
      return toValidationError(
        'stale_ref_block',
        'Transaction reference block is too old.',
      );
    }
  }

  return null;
};

export const buildSignTxReview = (rawTx: unknown): SignTxReview | null => {
  const structured = getStructuredSignTx(rawTx);
  if (!structured.ok) {
    return null;
  }
  return buildReview(structured.value);
};

export const validateSignTxTransaction = (
  rawTx: unknown,
  options?: { now?: Date; currentHeadBlockNumber?: number | null },
): SignTxValidationResult => {
  const structured = getStructuredSignTx(rawTx);
  if (!structured.ok) {
    return structured;
  }

  const expirationError = validateExpirationWindow(
    structured.value,
    options?.now || new Date(),
  );
  if (expirationError) {
    return { ok: false, error: expirationError };
  }

  if (options?.currentHeadBlockNumber !== undefined && options.currentHeadBlockNumber !== null) {
    const headBlockError = validateHeadBlockFreshness(
      structured.value,
      options.currentHeadBlockNumber,
    );
    if (headBlockError) {
      return { ok: false, error: headBlockError };
    }
  }

  return {
    ok: true,
    value: {
      transaction: structured.value.transaction,
      review: buildReview(structured.value),
    },
  };
};

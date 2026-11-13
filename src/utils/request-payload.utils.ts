const MAX_REQUEST_BYTES = 256 * 1024;
const HIVE_TRANSACTION_BYTES = 128 * 1024;
const EVM_TRANSACTION_BYTES = 200 * 1024;
const EVM_MESSAGE_SIGN_BYTES = 1024 * 1024;

const EVM_TRANSACTION_METHODS = new Set([
  'eth_sendTransaction',
  'wallet_sendCalls',
]);

const EVM_MESSAGE_SIGN_METHODS = new Set([
  'personal_sign',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
]);

const getJsonByteSize = (value: unknown): number | null => {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return null;
    return new TextEncoder().encode(serialized).byteLength;
  } catch {
    return null;
  }
};

const isValidRequestId = (requestId: unknown): requestId is number =>
  typeof requestId === 'number' &&
  Number.isSafeInteger(requestId) &&
  requestId > 0;

const getMaxRequestBytes = (
  chain: 'hive' | 'evm',
  method: string,
): number | null => {
  if (chain === 'hive') {
    return method === 'signBuffer' ? null : HIVE_TRANSACTION_BYTES;
  }
  if (EVM_TRANSACTION_METHODS.has(method)) return EVM_TRANSACTION_BYTES;
  if (EVM_MESSAGE_SIGN_METHODS.has(method)) return EVM_MESSAGE_SIGN_BYTES;
  return MAX_REQUEST_BYTES;
};

const getRequestPayloadSize = (
  value: unknown,
  maxBytes: number | null = MAX_REQUEST_BYTES,
) => {
  const byteSize = getJsonByteSize(value);
  return {
    byteSize,
    isValid: byteSize !== null && (maxBytes === null || byteSize <= maxBytes),
  };
};

export const RequestPayloadUtils = {
  MAX_REQUEST_BYTES,
  HIVE_TRANSACTION_BYTES,
  EVM_TRANSACTION_BYTES,
  EVM_MESSAGE_SIGN_BYTES,
  getJsonByteSize,
  getMaxRequestBytes,
  getRequestPayloadSize,
  isValidRequestId,
};

const MAX_REQUEST_BYTES = 256 * 1024;

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

const getRequestPayloadSize = (value: unknown) => {
  const byteSize = getJsonByteSize(value);
  return {
    byteSize,
    isValid: byteSize !== null && byteSize <= MAX_REQUEST_BYTES,
  };
};

export const RequestPayloadUtils = {
  MAX_REQUEST_BYTES,
  getJsonByteSize,
  getRequestPayloadSize,
  isValidRequestId,
};


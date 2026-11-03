import { EvmSendCallsParams } from '@interfaces/evm-call-batch.interface';
import { EvmAddressUtils } from 'src/utils/evm/evm-address.utils';

const MAX_CALLS = 10;
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const error = (code: number, message: string) => ({ code, message });
const assertId = (id: unknown): void => {
  if (
    typeof id !== 'string' ||
    !id.length ||
    (/^0x(?:[0-9a-fA-F]{2})*$/.test(id)
      ? (id.length - 2) / 2 > 4096
      : new TextEncoder().encode(id).length > 4096)
  ) {
    throw error(-32602, 'Invalid batch identifier');
  }
};

const validateCapabilities = (capabilities: unknown): void => {
  if (capabilities === undefined) return;
  if (!isObject(capabilities)) throw error(-32602, 'Invalid capabilities');
  for (const capability of Object.values(capabilities)) {
    if (
      !isObject(capability) ||
      (capability.optional !== undefined &&
        typeof capability.optional !== 'boolean')
    ) {
      throw error(-32602, 'Invalid capability');
    }
    if (capability.optional !== true) {
      throw error(5700, 'Unsupported non-optional capability');
    }
  }
};

const validateSendCalls = (params: unknown[]): EvmSendCallsParams => {
  const value = params[0];
  if (
    params.length !== 1 ||
    !isObject(value) ||
    value.version !== '2.0.0' ||
    typeof value.atomicRequired !== 'boolean' ||
    typeof value.chainId !== 'string' ||
    !/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(value.chainId) ||
    !Array.isArray(value.calls) ||
    value.calls.length === 0
  ) {
    throw error(-32602, 'Invalid wallet_sendCalls parameters');
  }
  if (value.atomicRequired)
    throw error(5760, 'Atomic execution is not supported');
  if (value.calls.length > MAX_CALLS)
    throw error(5740, 'Batch exceeds 10 calls');
  if (
    value.from !== undefined &&
    !EvmAddressUtils.isValidEvmAddress(value.from)
  ) {
    throw error(-32602, 'Invalid sender');
  }
  if (value.id !== undefined) assertId(value.id);
  validateCapabilities(value.capabilities);
  for (const call of value.calls) {
    if (
      !isObject(call) ||
      (call.to !== undefined && !EvmAddressUtils.isValidEvmAddress(call.to)) ||
      (call.data !== undefined &&
        (typeof call.data !== 'string' ||
          !/^0x(?:[0-9a-fA-F]{2})*$/.test(call.data))) ||
      (call.value !== undefined &&
        (typeof call.value !== 'string' ||
          !/^0x(?:0|[1-9a-fA-F][0-9a-fA-F]*)$/.test(call.value) ||
          call.value.length > 66))
    ) {
      throw error(-32602, 'Invalid call');
    }
    if (call.to === undefined && (!call.data || call.data === '0x')) {
      throw error(-32602, 'Contract creation requires data');
    }
    validateCapabilities(call.capabilities);
  }
  return (value as unknown) as EvmSendCallsParams;
};

const validateGetCapabilities = (params: unknown[]): void => {
  if (
    params.length < 1 ||
    params.length > 2 ||
    !EvmAddressUtils.isValidEvmAddress(params[0]) ||
    (params[1] !== undefined &&
      (!Array.isArray(params[1]) ||
        params[1].some(
          (chain) =>
            typeof chain !== 'string' ||
            !/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(chain),
        )))
  )
    throw error(-32602, 'Invalid wallet_getCapabilities parameters');
};

export const EvmCallBatchValidationUtils = {
  MAX_CALLS,
  error,
  assertId,
  validateSendCalls,
  validateGetCapabilities,
};

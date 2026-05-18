import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { ProviderRpcError } from '@interfaces/evm-provider.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  validateEvmRequest,
  validateRequest,
} from 'src/content-scripts/evm/evm-request-validation';

const getThrownError = (callback: () => unknown): ProviderRpcError => {
  try {
    callback();
  } catch (error) {
    return error as ProviderRpcError;
  }

  throw new Error('Expected callback to throw');
};

const validTransaction = {
  from: '0x0000000000000000000000000000000000000001',
  to: '0x0000000000000000000000000000000000000002',
  data: '0x',
  type: EvmTransactionType.EIP_1559,
  value: '0x1',
  maxFeePerGas: '0x1',
  maxPriorityFeePerGas: '0x1',
} as ProviderTransactionData;

describe('evm-request-validation tests:\n', () => {
  it('normalizes missing params to an empty array', () => {
    expect(
      validateEvmRequest({
        request_id: 1,
        method: EvmRequestMethod.GET_CHAIN,
      }),
    ).toEqual({
      request_id: 1,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    });
  });

  it('keeps method-level validation permissive for methods without custom checks', () => {
    expect(validateRequest(EvmRequestMethod.WALLET_WATCH_ASSETS, {})).toBe(
      true,
    );
  });

  it('rejects a missing request', () => {
    expect(getThrownError(() => validateEvmRequest(undefined))).toMatchObject({
      code: -32600,
      message: 'Missing request.',
    });
  });

  it('rejects a missing request_id', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          method: EvmRequestMethod.GET_CHAIN,
          params: [],
        }),
      ),
    ).toMatchObject({
      code: -32600,
      message: 'Invalid request. Missing or invalid request_id.',
    });
  });

  it('rejects an unknown method', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: 'eth_fakeMethod',
          params: [],
        }),
      ),
    ).toMatchObject({
      code: -32601,
    });
  });

  it('rejects non-array params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.GET_CHAIN,
          params: {},
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Params must be an array.',
    });
  });

  it('rejects invalid eth_sendTransaction params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.SEND_TRANSACTION,
          params: [{ ...validTransaction, to: 'not-an-address' }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message:
        'Invalid parameter. Receiver address is not valid (receiver: not-an-address)',
    });
  });

  it('rejects invalid wallet_switchEthereumChain params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
          params: [{ chainId: '1' }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message:
        'Invalid parameter. 1 is not a valid chainId. It must be using hexadecimal format',
    });
  });
});

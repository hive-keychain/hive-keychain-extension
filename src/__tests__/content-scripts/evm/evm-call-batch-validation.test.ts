import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { validateEvmRequest } from 'src/content-scripts/evm/evm-request-validation';
import { EvmCallBatchValidationUtils as Validation } from 'src/utils/evm/evm-call-batch-validation.utils';
const address = '0x' + '11'.repeat(20);
const valid = {
  version: '2.0.0',
  chainId: '0x1',
  atomicRequired: false,
  calls: [{ to: address, value: '0x1' }],
};

it('admits a sequential batch through the provider validation boundary', () => {
  expect(
    validateEvmRequest({
      request_id: 1,
      method: EvmRequestMethod.WALLET_SEND_CALLS,
      params: [valid],
    }).params,
  ).toEqual([valid]);
});
it.each([
  [{ ...valid, atomicRequired: true }, 5760],
  [{ ...valid, version: '1.0' }, -32602],
  [{ ...valid, atomicRequired: undefined }, -32602],
  [{ ...valid, chainId: '0x01' }, -32602],
  [{ ...valid, from: 'invalid' }, -32602],
  [{ ...valid, calls: [] }, -32602],
  [{ ...valid, calls: Array(11).fill(valid.calls[0]) }, 5740],
  [{ ...valid, calls: [{ to: address, value: '-1' }] }, -32602],
  [{ ...valid, calls: [{ to: address, data: '0x1' }] }, -32602],
  [{ ...valid, capabilities: { paymasterService: {} } }, 5700],
  [
    {
      ...valid,
      calls: [
        {
          to: address,
          capabilities: { paymasterService: { optional: false } },
        },
      ],
    },
    5700,
  ],
])('rejects malformed or unsupported batch %#', (params, code) => {
  expect(() => Validation.validateSendCalls([params])).toThrow(
    expect.objectContaining({ code }),
  );
});
it('ignores explicitly optional capabilities at both levels', () => {
  expect(() =>
    Validation.validateSendCalls([
      {
        ...valid,
        capabilities: { custom: { optional: true } },
        calls: [{ to: address, capabilities: { custom: { optional: true } } }],
      },
    ]),
  ).not.toThrow();
});
it('accepts a 4096-byte hex identifier and rejects larger identifiers', () => {
  expect(() => Validation.assertId('0x' + 'aa'.repeat(4096))).not.toThrow();
  expect(() => Validation.assertId('0x' + 'aa'.repeat(4097))).toThrow();
});
it('validates account and chain filters for capability discovery', () => {
  expect(() =>
    Validation.validateGetCapabilities([address, ['0x1']]),
  ).not.toThrow();
  expect(() => Validation.validateGetCapabilities([address, ['1']])).toThrow();
  expect(() => Validation.validateGetCapabilities([])).toThrow();
});

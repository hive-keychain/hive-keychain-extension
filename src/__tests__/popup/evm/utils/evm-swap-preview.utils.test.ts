import { EvmSwapPreviewUtils } from '@popup/evm/utils/evm-swap-preview.utils';

const TOKEN_IN = '0x0000000000000000000000000000000000000001';
const TOKEN_OUT = '0x0000000000000000000000000000000000000002';
const WETH = '0x0000000000000000000000000000000000000003';
const RECIPIENT = '0x0000000000000000000000000000000000000004';

const exactInputSingleComponents = [
  { name: 'tokenIn', type: 'address' },
  { name: 'tokenOut', type: 'address' },
  { name: 'fee', type: 'uint24' },
  { name: 'recipient', type: 'address' },
  { name: 'deadline', type: 'uint256' },
  { name: 'amountIn', type: 'uint256' },
  { name: 'amountOutMinimum', type: 'uint256' },
  { name: 'sqrtPriceLimitX96', type: 'uint160' },
];

describe('EvmSwapPreviewUtils', () => {
  it('reads token in, token out, amount in, minimum out, and recipient from exactInputSingle', () => {
    expect(
      EvmSwapPreviewUtils.classifyDecodedSwap({
        method: 'exactInputSingle',
        inputs: [
          {
            name: 'params',
            type: 'tuple',
            components: exactInputSingleComponents,
          },
        ],
        args: [
          [
            TOKEN_IN,
            TOKEN_OUT,
            3000,
            RECIPIENT,
            1n,
            1000n,
            900n,
            0n,
          ],
        ],
      }),
    ).toEqual({
      kind: 'exact-in',
      pay: { raw: 1000n, native: false, tokenAddress: TOKEN_IN },
      receive: { raw: 900n, native: false, tokenAddress: TOKEN_OUT },
      recipient: RECIPIENT,
    });
  });

  it('treats msg.value as the pay amount for swapExactETHForTokens', () => {
    expect(
      EvmSwapPreviewUtils.classifyDecodedSwap({
        method: 'swapExactETHForTokens',
        inputs: [
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
        args: [500n, [WETH, TOKEN_OUT], RECIPIENT, 1n],
        nativeValue: 1000000000000000000n,
      }),
    ).toEqual({
      kind: 'exact-in',
      pay: { raw: 1000000000000000000n, native: true },
      receive: { raw: 500n, native: false, tokenAddress: TOKEN_OUT },
      recipient: RECIPIENT,
    });
  });

  it('returns a bundled preview without amounts for multicall', () => {
    expect(
      EvmSwapPreviewUtils.classifyDecodedSwap({
        method: 'multicall',
        inputs: [{ name: 'data', type: 'bytes[]' }],
        args: [['0x1234']],
      }),
    ).toEqual({ kind: 'bundled' });
  });
});

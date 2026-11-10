import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmFeeTrend } from '@popup/evm/interfaces/gas-fee.interface';
import { RpcGasFeeEstimator } from '@popup/evm/utils/rpc-gas-fee-estimator.utils';

const buildProvider = (overrides: {
  baseFeePerGas?: bigint;
  maxPriorityFeePerGas?: string;
  gasPrice?: bigint;
  failMaxPriority?: boolean;
  failGetBlock?: boolean;
}) => {
  return {
    getBlock: jest.fn(async () => {
      if (overrides.failGetBlock) {
        throw new Error('block unavailable');
      }
      return {
        baseFeePerGas: overrides.baseFeePerGas,
      };
    }),
    getFeeData: jest.fn(async () => ({
      gasPrice: overrides.gasPrice,
      maxFeePerGas: overrides.gasPrice,
      maxPriorityFeePerGas: overrides.maxPriorityFeePerGas
        ? BigInt(overrides.maxPriorityFeePerGas)
        : undefined,
    })),
    send: jest.fn(async (method: string) => {
      if (method === 'eth_maxPriorityFeePerGas') {
        if (overrides.failMaxPriority) {
          throw new Error('unsupported');
        }
        return overrides.maxPriorityFeePerGas ?? '0x0';
      }
      throw new Error(`unexpected method ${method}`);
    }),
  } as any;
};

describe('RpcGasFeeEstimator', () => {
  it('builds ordered EIP-1559 tiers from block base fee and priority fee', async () => {
    const provider = buildProvider({
      baseFeePerGas: 30_000_000_000n,
      maxPriorityFeePerGas: '0x3b9aca00',
    });

    const tiers = await RpcGasFeeEstimator.fetchTiers(
      provider,
      EvmTransactionType.EIP_1559,
    );

    expect(tiers).not.toBeNull();
    expect(Number(tiers!.low.suggestedMaxFeePerGas)).toBeLessThan(
      Number(tiers!.medium.suggestedMaxFeePerGas),
    );
    expect(Number(tiers!.medium.suggestedMaxFeePerGas)).toBeLessThan(
      Number(tiers!.high.suggestedMaxFeePerGas),
    );
    expect(Number(tiers!.low.suggestedMaxFeePerGas)).toBeGreaterThan(
      Number(tiers!.estimatedBaseFee),
    );
    expect(tiers!.baseFeeTrend).toBe(EvmFeeTrend.UP);
  });

  it('falls back to legacy gas price tiers when the latest block has no base fee', async () => {
    const provider = buildProvider({
      gasPrice: 25_000_000_000n,
    });

    const tiers = await RpcGasFeeEstimator.fetchTiers(
      provider,
      EvmTransactionType.EIP_1559,
    );

    expect(tiers).not.toBeNull();
    expect(Number(tiers!.low.suggestedMaxFeePerGas)).toBeCloseTo(22.5, 1);
    expect(Number(tiers!.medium.suggestedMaxFeePerGas)).toBeCloseTo(25, 1);
    expect(Number(tiers!.high.suggestedMaxFeePerGas)).toBeCloseTo(27.5, 1);
  });

  it('returns null when RPC calls fail', async () => {
    const provider = buildProvider({
      failGetBlock: true,
      gasPrice: undefined,
    });
    provider.getFeeData = jest.fn(async () => ({
      gasPrice: undefined,
    }));

    const tiers = await RpcGasFeeEstimator.fetchTiers(
      provider,
      EvmTransactionType.LEGACY,
    );

    expect(tiers).toBeNull();
  });
});

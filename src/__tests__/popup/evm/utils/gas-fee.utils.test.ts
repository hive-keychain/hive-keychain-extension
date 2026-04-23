import { EvmLightNodeApi } from '@api/evm-light-node';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';

jest.mock('@api/evm-light-node', () => ({
  EvmLightNodeApi: {
    get: jest.fn(),
  },
}));

describe('GasFeeUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds USD fee values to dApp gas suggestions', async () => {
    (EvmLightNodeApi.get as jest.Mock).mockResolvedValue({
      low: {
        suggestedMaxPriorityFeePerGas: '1',
        suggestedMaxFeePerGas: '20',
        maxWaitTimeEstimate: 30000,
      },
      medium: {
        suggestedMaxPriorityFeePerGas: '1.5',
        suggestedMaxFeePerGas: '25',
        maxWaitTimeEstimate: 15000,
      },
      high: {
        suggestedMaxPriorityFeePerGas: '2',
        suggestedMaxFeePerGas: '30',
        maxWaitTimeEstimate: 5000,
      },
      estimatedBaseFee: '10',
      latestPriorityFeeRange: ['1', '2'],
      historicalPriorityFeeRange: ['1', '3'],
      historicalBaseFeeRange: ['8', '12'],
      baseFeeTrend: 'up',
      priorityFeeTrend: 'down',
    });

    const chain = {
      chainId: '0x1',
      defaultTransactionType: EvmTransactionType.EIP_1559,
      logo: '',
      mainToken: 'ETH',
      name: 'Ethereum',
      rpcs: [],
      type: ChainType.EVM,
    } as EvmChain;

    const transactionData: ProviderTransactionData = {
      data: '0x',
      from: '0x0000000000000000000000000000000000000001',
      gasLimit: 21000,
      maxFeePerGas: '20000000000',
      maxPriorityFeePerGas: '1000000000',
      to: '0x0000000000000000000000000000000000000002',
      type: EvmTransactionType.EIP_1559,
      value: '0',
    };

    const result = await GasFeeUtils.estimate(
      chain,
      {} as any,
      EvmTransactionType.EIP_1559,
      2500,
      21000,
      transactionData,
    );

    expect(result.suggestedByDApp?.estimatedFeeUSD.toFixed(4)).toBe('0.5775');
    expect(result.suggestedByDApp?.maxFeeUSD.toFixed(2)).toBe('1.05');
  });
});

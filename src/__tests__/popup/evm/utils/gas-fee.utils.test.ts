import { EvmLightNodeApi } from '@api/evm-light-node';
import {
  EvmFeeTrend,
  GasFeeEstimationBase,
} from '@popup/evm/interfaces/gas-fee.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { RpcGasFeeEstimator } from '@popup/evm/utils/rpc-gas-fee-estimator.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import Decimal from 'decimal.js';
import { SVGIcons } from 'src/common-ui/icons.enum';

jest.mock('@api/evm-light-node', () => ({
  EvmLightNodeApi: {
    get: jest.fn(),
  },
}));

const validEip1559Fee = (): GasFeeEstimationBase => ({
  type: EvmTransactionType.EIP_1559,
  estimatedFeeInEth: new Decimal('0.001'),
  estimatedFeeUSD: new Decimal(1),
  maxFeeInEth: new Decimal('0.002'),
  maxFeeUSD: new Decimal(2),
  estimatedMaxDuration: new Decimal(30),
  gasLimit: new Decimal(21000),
  priorityFeeInGwei: new Decimal(1),
  maxFeePerGasInGwei: new Decimal(30),
  icon: SVGIcons.EVM_GAS_FEE_LOW,
  name: 'popup_html_evm_custom_gas_fee_low',
});

const fallbackShapedFee = (): GasFeeEstimationBase => ({
  type: EvmTransactionType.EIP_1559,
  estimatedFeeInEth: new Decimal(0),
  estimatedFeeUSD: new Decimal(0),
  maxFeeInEth: new Decimal(0),
  maxFeeUSD: new Decimal(0),
  estimatedMaxDuration: new Decimal(0),
  gasLimit: new Decimal(21000),
  priorityFeeInGwei: new Decimal(0),
  maxFeePerGasInGwei: new Decimal(0),
  gasPriceInGwei: new Decimal(0),
  icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
  name: 'popup_html_evm_custom_gas_fee_custom',
});

describe('GasFeeUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('gas fee validation helpers', () => {
    it('treats undefined fee as invalid', () => {
      expect(GasFeeUtils.isGasFeeEstimateInvalid(undefined)).toBe(true);
    });

    it('treats fallback-shaped zero fees as invalid', () => {
      expect(GasFeeUtils.isGasFeeEstimateInvalid(fallbackShapedFee())).toBe(
        true,
      );
      expect(
        GasFeeUtils.hasDisplayableEstimatedFee(fallbackShapedFee()),
      ).toBe(false);
      expect(GasFeeUtils.hasDisplayableMaxFee(fallbackShapedFee())).toBe(
        false,
      );
      expect(GasFeeUtils.hasDisplayableDuration(fallbackShapedFee())).toBe(
        false,
      );
    });

    it('treats valid EIP-1559 fees as displayable and not invalid', () => {
      const fee = validEip1559Fee();
      expect(GasFeeUtils.isGasFeeEstimateInvalid(fee)).toBe(false);
      expect(GasFeeUtils.hasDisplayableEstimatedFee(fee)).toBe(true);
      expect(GasFeeUtils.hasDisplayableMaxFee(fee)).toBe(true);
      expect(GasFeeUtils.hasDisplayableDuration(fee)).toBe(true);
    });

    it('treats legacy fees with zero gas price as invalid', () => {
      const fee: GasFeeEstimationBase = {
        ...validEip1559Fee(),
        type: EvmTransactionType.LEGACY,
        gasPriceInGwei: new Decimal(0),
        priorityFeeInGwei: undefined,
        maxFeePerGasInGwei: undefined,
      };
      expect(GasFeeUtils.isGasFeeEstimateInvalid(fee)).toBe(true);
    });

    it('still treats legacy -1 sentinel values as invalid', () => {
      const fee: GasFeeEstimationBase = {
        ...fallbackShapedFee(),
        type: EvmTransactionType.LEGACY,
        estimatedFeeInEth: new Decimal(-1),
        maxFeeInEth: new Decimal(-1),
        gasPriceInGwei: new Decimal(-1),
        priorityFeeInGwei: undefined,
        maxFeePerGasInGwei: undefined,
      };
      expect(GasFeeUtils.isGasFeeEstimateInvalid(fee)).toBe(true);
    });
  });

  describe('gas fee display formatting', () => {
    it('keeps regular gas fee values at the default precision', () => {
      expect(GasFeeUtils.formatGasFeeValue(new Decimal('0.00000002'))).toBe(
        '0.00000002',
      );
    });

    it('marks non-zero gas fee values below display precision', () => {
      expect(GasFeeUtils.formatGasFeeValue(new Decimal('0.000000000882'))).toBe(
        '< 0.00000001',
      );
    });

    it('uses a compact marker for tiny non-zero gas fee values when requested', () => {
      expect(
        GasFeeUtils.formatGasFeeValue(
          new Decimal('0.000000000882'),
          8,
          'compact',
        ),
      ).toBe('~0');
    });

    it('keeps zero gas fee values formatted as zero', () => {
      expect(GasFeeUtils.formatGasFeeValue(new Decimal(0))).toBe('0.00000000');
    });
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
      transactionData.from!,
      EvmTransactionType.EIP_1559,
      2500,
      21000,
      transactionData,
    );

    expect(result.suggestedByDApp?.estimatedFeeUSD.toFixed(4)).toBe('0.5775');
    expect(result.suggestedByDApp?.maxFeeUSD.toFixed(2)).toBe('1.05');
  });

  it('does not call the gas oracle for custom chains', async () => {
    jest.spyOn(EthersUtils, 'getGasLimit').mockResolvedValue(21000);
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({} as any);
    jest.spyOn(RpcGasFeeEstimator, 'fetchTiers').mockResolvedValue({
      low: {
        suggestedMaxPriorityFeePerGas: '1',
        suggestedMaxFeePerGas: '35',
        maxWaitTimeEstimate: 60000,
      },
      medium: {
        suggestedMaxPriorityFeePerGas: '1',
        suggestedMaxFeePerGas: '38',
        maxWaitTimeEstimate: 30000,
      },
      high: {
        suggestedMaxPriorityFeePerGas: '1',
        suggestedMaxFeePerGas: '40',
        maxWaitTimeEstimate: 15000,
      },
      estimatedBaseFee: '30',
      latestPriorityFeeRange: ['1', '2'],
      historicalPriorityFeeRange: ['1', '2'],
      historicalBaseFeeRange: ['27', '33'],
      baseFeeTrend: EvmFeeTrend.UP,
      priorityFeeTrend: EvmFeeTrend.DOWN,
    });

    const chain = {
      chainId: '0x539',
      defaultTransactionType: EvmTransactionType.EIP_1559,
      isCustom: true,
      logo: '',
      mainToken: 'ETH',
      name: 'Local Custom Chain',
      rpcs: [{ url: 'http://127.0.0.1:8545' }],
      type: ChainType.EVM,
    } as EvmChain;

    const result = await GasFeeUtils.estimate(
      chain,
      '0x0000000000000000000000000000000000000001',
      EvmTransactionType.EIP_1559,
      2500,
      21000,
    );

    expect(EvmLightNodeApi.get).not.toHaveBeenCalled();
    expect(result.suggested).toBeDefined();
    expect(result.low).toBeDefined();
    expect(result.medium).toBeDefined();
    expect(result.aggressive).toBeDefined();
    expect(result.suggested!.estimatedFeeInEth.lt(result.suggested!.maxFeeInEth)).toBe(
      true,
    );
  });

  it('caps custom legacy chain RPC tiers with the stored minimum gas price', async () => {
    jest.spyOn(EthersUtils, 'getGasLimit').mockResolvedValue(21000);
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({} as any);
    jest.spyOn(RpcGasFeeEstimator, 'fetchTiers').mockResolvedValue({
      low: {
        suggestedMaxPriorityFeePerGas: '0',
        suggestedMaxFeePerGas: '0.045',
        maxWaitTimeEstimate: 60000,
      },
      medium: {
        suggestedMaxPriorityFeePerGas: '0',
        suggestedMaxFeePerGas: '0.05',
        maxWaitTimeEstimate: 30000,
      },
      high: {
        suggestedMaxPriorityFeePerGas: '0',
        suggestedMaxFeePerGas: '0.06',
        maxWaitTimeEstimate: 15000,
      },
      estimatedBaseFee: null,
      latestPriorityFeeRange: ['0', '0'],
      historicalPriorityFeeRange: ['0.045', '0.06'],
      historicalBaseFeeRange: ['0.045', '0.06'],
      baseFeeTrend: EvmFeeTrend.UP,
      priorityFeeTrend: EvmFeeTrend.DOWN,
    });

    const chain = {
      chainId: '0x539',
      customMinGasPriceInGwei: '0.05',
      defaultTransactionType: EvmTransactionType.LEGACY,
      isCustom: true,
      logo: '',
      mainToken: 'ETH',
      name: 'Local Custom Chain',
      rpcs: [{ url: 'http://127.0.0.1:8545' }],
      type: ChainType.EVM,
    } as EvmChain;

    const result = await GasFeeUtils.estimate(
      chain,
      '0x0000000000000000000000000000000000000001',
      EvmTransactionType.LEGACY,
      2500,
      21000,
    );

    expect(EvmLightNodeApi.get).not.toHaveBeenCalled();
    expect(result.low!.gasPriceInGwei!.toString()).toBe('0.05');
    expect(result.medium!.gasPriceInGwei!.toString()).toBe('0.05');
    expect(result.aggressive!.gasPriceInGwei!.toString()).toBe('0.06');
    expect(result.minGasPriceInGwei!.toString()).toBe('0.05');
  });

  it('uses suggested gas price tiers when legacy oracle estimates have no base fee', async () => {
    (EvmLightNodeApi.get as jest.Mock).mockResolvedValue({
      low: {
        suggestedMaxPriorityFeePerGas: '0',
        suggestedMaxFeePerGas: '20',
        maxWaitTimeEstimate: 60000,
      },
      medium: {
        suggestedMaxPriorityFeePerGas: '0',
        suggestedMaxFeePerGas: '25',
        maxWaitTimeEstimate: 30000,
      },
      high: {
        suggestedMaxPriorityFeePerGas: '0',
        suggestedMaxFeePerGas: '30',
        maxWaitTimeEstimate: 15000,
      },
      estimatedBaseFee: null,
      latestPriorityFeeRange: ['0', '0'],
      historicalPriorityFeeRange: ['0', '0'],
      historicalBaseFeeRange: ['20', '30'],
      baseFeeTrend: EvmFeeTrend.UP,
      priorityFeeTrend: EvmFeeTrend.DOWN,
    });

    const chain = {
      chainId: '0x38',
      defaultTransactionType: EvmTransactionType.LEGACY,
      logo: '',
      mainToken: 'BNB',
      name: 'BNB Smart Chain',
      rpcs: [],
      type: ChainType.EVM,
    } as EvmChain;

    const result = await GasFeeUtils.estimate(
      chain,
      '0x0000000000000000000000000000000000000001',
      EvmTransactionType.LEGACY,
      300,
      21000,
    );

    expect(result.suggested).toBeDefined();
    expect(GasFeeUtils.isGasFeeEstimateInvalid(result.suggested)).toBe(false);
    expect(result.suggested!.gasPriceInGwei!.toString()).toBe('20');
    expect(result.suggested!.estimatedFeeInEth.toString()).toBe('0.00042');
    expect(result.suggested!.maxFeeInEth.toString()).toBe('0.00042');
    expect(result.medium!.estimatedFeeInEth.toString()).toBe('0.000525');
    expect(result.aggressive!.estimatedFeeInEth.toString()).toBe('0.00063');
  });

  it('caps legacy oracle and dApp gas prices with the light node minimum', async () => {
    (EvmLightNodeApi.get as jest.Mock).mockResolvedValue({
      low: {
        suggestedMaxPriorityFeePerGas: null,
        suggestedMaxFeePerGas: '0.045',
        maxWaitTimeEstimate: 60000,
      },
      medium: {
        suggestedMaxPriorityFeePerGas: null,
        suggestedMaxFeePerGas: '0.05',
        maxWaitTimeEstimate: 30000,
      },
      high: {
        suggestedMaxPriorityFeePerGas: null,
        suggestedMaxFeePerGas: '0.06',
        maxWaitTimeEstimate: 15000,
      },
      minGasPrice: '0.05',
      estimatedBaseFee: null,
      latestPriorityFeeRange: [null, null],
      historicalPriorityFeeRange: [null, null],
      historicalBaseFeeRange: ['0.045', '0.06'],
      baseFeeTrend: EvmFeeTrend.UP,
      priorityFeeTrend: EvmFeeTrend.DOWN,
    });

    const chain = {
      chainId: '0x61',
      defaultTransactionType: EvmTransactionType.LEGACY,
      logo: '',
      mainToken: 'BNB',
      name: 'BNB Smart Chain',
      rpcs: [],
      type: ChainType.EVM,
    } as EvmChain;
    const transactionData: ProviderTransactionData = {
      data: '0x',
      from: '0x0000000000000000000000000000000000000001',
      gasLimit: 21000,
      gasPrice: '5000000',
      to: '0x0000000000000000000000000000000000000002',
      type: EvmTransactionType.LEGACY,
      value: '0',
    };

    const result = await GasFeeUtils.estimate(
      chain,
      transactionData.from!,
      EvmTransactionType.LEGACY,
      300,
      21000,
      transactionData,
    );

    expect(result.low!.gasPriceInGwei!.toString()).toBe('0.05');
    expect(result.medium!.gasPriceInGwei!.toString()).toBe('0.05');
    expect(result.aggressive!.gasPriceInGwei!.toString()).toBe('0.06');
    expect(result.suggestedByDApp!.gasPriceInGwei!.toString()).toBe('0.05');
    expect(transactionData.gasPrice).toBe('50000000');
  });

  it('uses corrected estimated vs max fee math in the RPC fallback custom tier', async () => {
    jest.spyOn(EthersUtils, 'getGasLimit').mockResolvedValue(21000);
    jest.spyOn(RpcGasFeeEstimator, 'fetchTiers').mockResolvedValue(null);
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
      getFeeData: jest.fn().mockResolvedValue({
        toJSON: () => ({
          gasPrice: 20_000_000_000n,
          maxFeePerGas: 40_000_000_000n,
          maxPriorityFeePerGas: 1_000_000_000n,
        }),
      }),
      getBlock: jest.fn().mockResolvedValue({
        baseFeePerGas: 30_000_000_000n,
      }),
      send: jest.fn().mockResolvedValue('0x3b9aca00'),
    } as any);

    const chain = {
      chainId: '0x539',
      defaultTransactionType: EvmTransactionType.EIP_1559,
      isCustom: true,
      logo: '',
      mainToken: 'ETH',
      name: 'Local Custom Chain',
      rpcs: [{ url: 'http://127.0.0.1:8545' }],
      type: ChainType.EVM,
    } as EvmChain;

    const result = await GasFeeUtils.estimate(
      chain,
      '0x0000000000000000000000000000000000000001',
      EvmTransactionType.EIP_1559,
      2500,
      21000,
    );

    expect(result.custom).toBeDefined();
    expect(result.custom!.estimatedFeeInEth.lt(result.custom!.maxFeeInEth)).toBe(
      true,
    );
  });
});

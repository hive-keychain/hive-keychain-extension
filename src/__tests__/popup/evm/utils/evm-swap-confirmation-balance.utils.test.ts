import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmSwapConfirmationBalanceUtils } from '@popup/evm/utils/evm-swap-confirmation-balance.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Decimal from 'decimal.js';

const chain: EvmChain = {
  chainId: '0x1',
  defaultTransactionType: EvmTransactionType.EIP_1559,
  logo: '',
  mainToken: 'ETH',
  name: 'Ethereum',
  rpcs: [],
  type: ChainType.EVM,
};

const buildGasFeeEstimation = (feeInEth: string): GasFeeEstimationBase => ({
  type: EvmTransactionType.EIP_1559,
  estimatedFeeInEth: new Decimal(feeInEth),
  estimatedFeeUSD: new Decimal(0),
  maxFeeInEth: new Decimal(feeInEth),
  maxFeeUSD: new Decimal(0),
  estimatedMaxDuration: new Decimal(0),
  gasLimit: new Decimal(21000),
  priorityFeeInGwei: new Decimal(1),
  maxFeePerGasInGwei: new Decimal(1),
  icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
  name: 'popup_html_evm_custom_gas_fee_custom',
});

describe('EvmSwapConfirmationBalanceUtils', () => {
  it('sums approve and swap gas fees for balance checks', () => {
    const combined = EvmSwapConfirmationBalanceUtils.sumGasFees([
      buildGasFeeEstimation('0.01'),
      buildGasFeeEstimation('0.02'),
    ]);

    expect(combined?.estimatedFeeInEth.equals(new Decimal('0.03'))).toBe(true);
    expect(GasFeeUtils.isGasFeeEstimateInvalid(combined)).toBe(false);
  });

  it('resolves native portfolio assets to native token info', () => {
    const tokenInfo =
      EvmSwapConfirmationBalanceUtils.resolvePortfolioSwapFromTokenInfo(chain, {
        assetId: 'evm:native:ethereum',
        ecosystem: 'evm',
        symbol: 'ETH',
        name: 'Ethereum',
        chainId: 'ethereum',
        address: null,
        decimals: 18,
        isNative: true,
        familyId: 'eth',
        logoUrl: null,
        priceUsd: 0,
        rankScore: 0,
      });

    expect(tokenInfo.type).toBe(EVMSmartContractType.NATIVE);
    expect(tokenInfo.symbol).toBe('ETH');
  });

  it('checks swap amount plus combined gas against balances', async () => {
    const nativeToken = EvmTokensUtils.buildFallbackNativeTokenInfo(chain);
    const getBalanceInfoSpy = jest
      .spyOn(EvmTokensUtils, 'getBalanceInfo')
      .mockResolvedValue({
        mainBalance: {
          symbol: 'ETH',
          before: '1 ETH',
          estimatedAfter: '-0.1 ETH',
          insufficientBalance: true,
        },
      });

    const balanceInfo =
      await EvmSwapConfirmationBalanceUtils.getEvmSwapConfirmationBalanceInfo({
        walletAddress: '0x0000000000000000000000000000000000000001',
        chain,
        fromTokenInfo: nativeToken,
        swapAmount: 0.5,
        swapGasFee: buildGasFeeEstimation('0.02'),
        approveGasFee: buildGasFeeEstimation('0.01'),
      });

    expect(getBalanceInfoSpy).toHaveBeenCalledWith(
      '0x0000000000000000000000000000000000000001',
      chain,
      nativeToken,
      0.5,
      expect.objectContaining({
        estimatedFeeInEth: expect.any(Decimal),
      }),
      undefined,
    );
    expect(balanceInfo.mainBalance.insufficientBalance).toBe(true);
  });
});

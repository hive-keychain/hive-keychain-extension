import {
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ethers } from 'ethers';

describe('evm-tokens main-token balance guards', () => {
  it('returns 0 when chain main token is missing', () => {
    const total = EvmTokensUtils.getTotalBalanceInMainToken(
      [
        {
          tokenInfo: {
            type: EVMSmartContractType.NATIVE,
            symbol: 'ETH',
            priceUsd: 2000,
          },
          balance: ethers.parseEther('1'),
        } as any,
      ],
      { chainId: '0x1' } as any,
    );

    expect(total).toBe(0);
  });

  it('falls back to native token when configured symbol is absent', () => {
    const total = EvmTokensUtils.getTotalBalanceInMainToken(
      [
        {
          tokenInfo: {
            type: EVMSmartContractType.NATIVE,
            symbol: 'ETH',
            priceUsd: 2000,
          },
          balance: ethers.parseEther('2'),
        } as any,
        {
          tokenInfo: {
            type: EVMSmartContractType.ERC20,
            symbol: 'USDC',
            decimals: 6,
            priceUsd: 1,
          },
          balance: 1000000n,
        } as any,
      ],
      { chainId: '0x1', mainToken: 'MATIC' } as any,
    );

    expect(total).toBeGreaterThan(0);
  });
});

import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import {
  CatchupStatus,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';

const ethereumChain: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: 'ethereum.svg',
  chainId: '0x1',
  rpcs: [{ url: 'https://ethereum.rpc' }],
  mainToken: 'ETH',
  defaultTransactionType: 2 as never,
};

const nativeToken = {
  tokenInfo: {
    type: EVMSmartContractType.NATIVE,
    symbol: 'ETH',
    chainId: '0x1',
    priceUsd: 100,
    logo: 'eth.svg',
  },
  formattedBalance: '1',
  balance: 1n,
  balanceInteger: 1,
  shortFormattedBalance: '1',
} as NativeAndErc20Token;

describe('EvmAccountTokensLoadUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(EvmLightNodeUtils, 'registerAddress').mockResolvedValue(undefined);
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredTokens').mockResolvedValue({
      address: '0xabc',
      chainId: '1',
      tokens: [
        {
          type: EVMSmartContractType.NATIVE,
          symbol: 'ETH',
        },
      ],
      catchupStatus: CatchupStatus.DONE,
      pricingStatus: PricingStatus.READY,
    });
    jest.spyOn(EvmTokensUtils, 'getTokenBalances').mockResolvedValue([nativeToken]);
    jest
      .spyOn(EvmTokensUtils, 'filterTokensBasedOnSettings')
      .mockImplementation(async (tokens) => tokens);
    jest.spyOn(EvmTokensUtils, 'sortTokens').mockImplementation((tokens) => tokens);
  });

  it('registers the address and refreshes balances from rpc on first load', async () => {
    const result = await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
    );

    expect(EvmLightNodeUtils.registerAddress).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
      false,
    );
    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
    );
    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalled();
    expect(result.balances).toEqual([nativeToken]);
    expect(result.shouldLoadMore).toBe(false);
  });

  it('skips address registration on refresh loads', async () => {
    await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
      { registerAddress: false },
    );

    expect(EvmLightNodeUtils.registerAddress).not.toHaveBeenCalled();
  });

  it('loads visible tokens for each setup chain', async () => {
    const tokens =
      await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        [ethereumChain],
        '0xabc',
      );

    expect(EvmLightNodeUtils.registerAddress).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
      false,
    );
    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
    );
    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalled();
    expect(EvmTokensUtils.filterTokensBasedOnSettings).toHaveBeenCalled();
    expect(EvmTokensUtils.sortTokens).toHaveBeenCalled();
    expect(tokens).toEqual([nativeToken]);
  });

  it('continues loading other chains when one chain fails', async () => {
    const polygonChain: EvmChain = {
      ...ethereumChain,
      name: 'Polygon',
      chainId: '0x89',
      mainToken: 'MATIC',
    };
    const failedChains: string[] = [];
    const finishedChains: string[] = [];

    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockImplementation(
      async (chainId: string) => {
        if (chainId === '0x89') {
          throw new Error('polygon unavailable');
        }

        return {
          address: '0xabc',
          chainId: '1',
          tokens: [
            {
              type: EVMSmartContractType.NATIVE,
              symbol: 'ETH',
            },
          ],
          catchupStatus: CatchupStatus.DONE,
          pricingStatus: PricingStatus.READY,
        };
      },
    );

    const tokens =
      await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        [ethereumChain, polygonChain],
        '0xabc',
        {
          onChainError: (chain) => {
            failedChains.push(chain.name);
          },
          onChainFinished: (chain) => {
            finishedChains.push(chain.name);
          },
        },
      );

    expect(tokens).toEqual([nativeToken]);
    expect(failedChains).toEqual(['Polygon']);
    expect(finishedChains).toHaveLength(2);
    expect(finishedChains).toEqual(
      expect.arrayContaining(['Ethereum', 'Polygon']),
    );
  });

  it('stops retrying after the configured max retries', async () => {
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredTokens').mockResolvedValue({
      address: '0xabc',
      chainId: '1',
      tokens: [
        {
          type: EVMSmartContractType.NATIVE,
          symbol: 'ETH',
        },
      ],
      catchupStatus: CatchupStatus.RUNNING,
      pricingStatus: PricingStatus.PENDING,
    });

    const tokens = await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
      0,
      [],
      2,
    );

    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledTimes(3);
    expect(tokens).toEqual([nativeToken]);
  });
});

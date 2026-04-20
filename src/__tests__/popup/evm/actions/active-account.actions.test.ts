import {
  loadEvmActiveAccount,
  loadEvmActiveAccountNfts,
  loadEvmHistory,
  loadMoreTokensInActiveAccount,
} from '@popup/evm/actions/active-account.actions';
import {
  CatchupStatus,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';

const baseEvmChain: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: '',
  chainId: '0x1',
  rpcs: [{ url: 'https://rpc.example', isDefault: true }],
  mainToken: 'ETH',
  defaultTransactionType: 2 as any,
};

const customEvmChain: EvmChain = {
  ...baseEvmChain,
  name: 'Local',
  chainId: '0x539',
  isCustom: true,
};

const wallet = { address: '0x1111111111111111111111111111111111111111' } as HDNodeWallet;

describe('EVM active-account.actions (custom chain)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(EvmLightNodeUtils, 'registerAddress').mockResolvedValue(undefined);
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredTokens').mockResolvedValue({
      address: wallet.address,
      chainId: '1',
      tokens: [],
      catchupStatus: CatchupStatus.DONE,
      pricingStatus: PricingStatus.READY,
    });
    jest.spyOn(EvmTokensUtils, 'getCustomErc20TokenInfos').mockResolvedValue([]);
    jest
      .spyOn(EvmTokensUtils, 'getCustomNftCollectionsForWallet')
      .mockResolvedValue([]);
    jest.spyOn(EvmTokensUtils, 'getTokenBalances').mockResolvedValue([]);
  });

  it('loadEvmActiveAccount skips Light Node register and discovery for custom chains', async () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: customEvmChain,
    });

    await store.dispatch<any>(
      loadEvmActiveAccount(customEvmChain, wallet),
    );

    expect(EvmLightNodeUtils.registerAddress).not.toHaveBeenCalled();
    expect(EvmLightNodeUtils.getDiscoveredTokens).not.toHaveBeenCalled();
    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalled();
    const tokenBalancesCall = (EvmTokensUtils.getTokenBalances as jest.Mock).mock
      .calls[0];
    expect(tokenBalancesCall[2]).toHaveLength(1);
    expect(tokenBalancesCall[2][0].type).toBe('NATIVE');
    expect(tokenBalancesCall[2][0].symbol).toBe(customEvmChain.mainToken);

    const { activeAccount } = store.getState().evm;
    expect(activeAccount.nfts.initialized).toBe(true);
    expect(activeAccount.nfts.loading).toBe(false);
    expect(activeAccount.history.initialized).toBe(false);
    expect(activeAccount.history.value.fullyFetch).toBe(false);
    expect(activeAccount.isReady).toBe(true);
  });

  it('loadEvmActiveAccount includes saved custom NFTs for custom chains', async () => {
    (EvmTokensUtils.getCustomNftCollectionsForWallet as jest.Mock).mockResolvedValue([
      {
        tokenInfo: {
          type: 'ERC721',
          name: 'Custom Collection',
          symbol: 'NFT',
          logo: '',
          chainId: customEvmChain.chainId,
          backgroundColor: '',
          priceUsd: 0,
          contractAddress: '0x00000000000000000000000000000000000000cc',
          possibleSpam: false,
          verifiedContract: true,
          isProxy: false,
          proxyTarget: null,
        },
        collection: [
          {
            id: '1',
            metadata: {
              name: 'NFT #1',
              description: '',
              image: 'https://cdn.example/nft.png',
              attributes: [],
            },
          },
        ],
      },
    ]);

    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: customEvmChain,
    });

    await store.dispatch<any>(loadEvmActiveAccount(customEvmChain, wallet));

    expect(store.getState().evm.activeAccount.nfts.value).toHaveLength(1);
    expect(
      store.getState().evm.activeAccount.nfts.value[0].tokenInfo.contractAddress,
    ).toBe('0x00000000000000000000000000000000000000cc');
  });

  it('loadEvmActiveAccount uses Light Node for default chains', async () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: baseEvmChain,
    });

    await store.dispatch<any>(loadEvmActiveAccount(baseEvmChain, wallet));

    expect(EvmLightNodeUtils.registerAddress).toHaveBeenCalled();
    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalled();
    expect(EvmTokensUtils.getCustomErc20TokenInfos).not.toHaveBeenCalled();
  });

  it('loadEvmActiveAccount includes saved custom ERC20 tokens for custom chains', async () => {
    (EvmTokensUtils.getCustomErc20TokenInfos as jest.Mock).mockResolvedValue([
      {
        type: 'ERC20',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: '',
        chainId: customEvmChain.chainId,
        contractAddress: '0x00000000000000000000000000000000000000aa',
        backgroundColor: '',
        priceUsd: 0,
        possibleSpam: false,
        verifiedContract: true,
        isProxy: false,
        proxyTarget: null,
        validated: 0,
      },
    ]);

    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: customEvmChain,
    });

    await store.dispatch<any>(loadEvmActiveAccount(customEvmChain, wallet));

    const tokenBalancesCall = (EvmTokensUtils.getTokenBalances as jest.Mock).mock
      .calls[0];
    expect(tokenBalancesCall[2]).toHaveLength(2);
    expect(tokenBalancesCall[2][0].type).toBe('NATIVE');
    expect(tokenBalancesCall[2][1]).toMatchObject({
      type: 'ERC20',
      contractAddress: '0x00000000000000000000000000000000000000aa',
    });
  });

  it('loadEvmHistory does not call fetchHistory2 for custom chains', async () => {
    jest.spyOn(EvmTokensHistoryUtils, 'fetchHistory2').mockResolvedValue({
      events: [],
      nextCursor: null,
      fullyFetch: true,
    });

    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: customEvmChain,
    });

    await store.dispatch<any>(loadEvmHistory());

    expect(EvmTokensHistoryUtils.fetchHistory2).not.toHaveBeenCalled();
  });

  it('loadEvmActiveAccountNfts short-circuits for custom chains', async () => {
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredNfts').mockResolvedValue({
      chainId: 1,
      address: wallet.address,
      catchupStatus: CatchupStatus.DONE,
      collections: [],
    });

    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: customEvmChain,
    });

    await store.dispatch<any>(
      loadEvmActiveAccountNfts(customEvmChain, wallet),
    );

    expect(EvmLightNodeUtils.getDiscoveredNfts).not.toHaveBeenCalled();
    expect(EvmTokensUtils.getCustomNftCollectionsForWallet).toHaveBeenCalledWith(
      customEvmChain,
      wallet.address,
    );
    expect(store.getState().evm.activeAccount.nfts.initialized).toBe(true);
    expect(store.getState().evm.activeAccount.nfts.loading).toBe(false);
  });

  it('loadMoreTokensInActiveAccount does not call Light Node for custom chains', async () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: customEvmChain,
    });

    await store.dispatch<any>(
      loadMoreTokensInActiveAccount(customEvmChain, wallet),
    );

    expect(EvmLightNodeUtils.getDiscoveredTokens).not.toHaveBeenCalled();
  });
});

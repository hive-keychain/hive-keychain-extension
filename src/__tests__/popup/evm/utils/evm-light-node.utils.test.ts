import { EvmLightNodeApi } from '@api/evm-light-node';
import {
  CatchupStatus,
  EvmLightNodeUtils,
  evmChainIdToDecimalPathSegment,
  isCatchupStatusPending,
  normalizeDomainForLightNode,
} from '@popup/evm/utils/evm-light-node.utils';
import { BaseApi } from 'src/api/base';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('src/api/base', () => ({
  BaseApi: {
    getWithResponse: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('evm-light-node.utils tests:\n', () => {
  it('uses decimal chain id in light-node URLs when chainId is hex', async () => {
    const getSpy = jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({});
    await EvmLightNodeUtils.getGasFee('0x89');
    expect(getSpy).toHaveBeenCalledWith('gas-oracle/137');
  });

  it('evmChainIdToDecimalPathSegment maps hex and decimal strings', () => {
    expect(evmChainIdToDecimalPathSegment('0x1')).toBe('1');
    expect(evmChainIdToDecimalPathSegment('137')).toBe('137');
    expect(evmChainIdToDecimalPathSegment(56)).toBe('56');
  });

  it('treats only DONE and ERROR catchup statuses as terminal', () => {
    expect(isCatchupStatusPending(CatchupStatus.DONE)).toBe(false);
    expect(isCatchupStatusPending(CatchupStatus.ERROR)).toBe(false);
    expect(isCatchupStatusPending(CatchupStatus.RUNNING)).toBe(true);
    expect(isCatchupStatusPending(CatchupStatus.PARTIAL)).toBe(true);
    expect(isCatchupStatusPending(CatchupStatus.SKIPPED)).toBe(true);
    expect(isCatchupStatusPending(null)).toBe(true);
  });

  it('normalizes custom chain Coingecko responses from either payload shape', async () => {
    const getSpy = jest
      .spyOn(EvmLightNodeApi, 'get')
      .mockResolvedValueOnce({ native_coin_id: 'ethereum' })
      .mockResolvedValueOnce('matic-network');

    await expect(
      EvmLightNodeUtils.getCoingeckoNativeCoinId('0x1'),
    ).resolves.toBe('ethereum');
    await expect(
      EvmLightNodeUtils.getCoingeckoNativeCoinId('0x89'),
    ).resolves.toBe('matic-network');

    expect(getSpy).toHaveBeenNthCalledWith(1, 'coingecko/1');
    expect(getSpy).toHaveBeenNthCalledWith(2, 'coingecko/137');
  });

  it('normalizes custom token Coingecko responses from either payload shape', async () => {
    const tokenAddress = '0x00000000000000000000000000000000000000aa';
    const getSpy = jest
      .spyOn(EvmLightNodeApi, 'get')
      .mockResolvedValueOnce({ coingecko_id: 'usd-coin' })
      .mockResolvedValueOnce({ coingeckoId: 'dai' });

    await expect(
      EvmLightNodeUtils.getCoingeckoTokenId('0x1', tokenAddress),
    ).resolves.toBe('usd-coin');
    await expect(
      EvmLightNodeUtils.getCoingeckoTokenId('1', tokenAddress),
    ).resolves.toBe('dai');

    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      `coingecko/1/${encodeURIComponent(tokenAddress)}`,
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      `coingecko/1/${encodeURIComponent(tokenAddress)}`,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('returns the proxy target abi when backend marks the contract as a proxy', async () => {
    const proxyAddress = '0x00000000000000000000000000000000000000aa';
    const targetAddress = '0x00000000000000000000000000000000000000bb';
    const targetAbi = [{ type: 'function', name: 'approve', inputs: [] }];
    const getSpy = jest
      .spyOn(EvmLightNodeApi, 'get')
      .mockResolvedValueOnce({
        abi: [{ type: 'function', name: 'fallback', inputs: [] }],
        address: proxyAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 1,
        isProxy: true,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: targetAddress,
        verified: true,
      })
      .mockResolvedValueOnce({
        abi: targetAbi,
        address: targetAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 2,
        isProxy: false,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: null,
        verified: true,
      });

    const abi = await EvmLightNodeUtils.getAbi('1', proxyAddress);

    expect(abi).toEqual(targetAbi);
    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      `contract/1/${encodeURIComponent(proxyAddress)}`,
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      `contract/1/${encodeURIComponent(targetAddress)}`,
    );
  });

  it('returns null when the proxy target has no abi', async () => {
    jest
      .spyOn(EvmLightNodeApi, 'get')
      .mockResolvedValueOnce({
        abi: [{ type: 'function', name: 'fallback', inputs: [] }],
        address: '0x00000000000000000000000000000000000000aa',
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 1,
        isProxy: true,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: '0x00000000000000000000000000000000000000bb',
        verified: true,
      })
      .mockResolvedValueOnce({
        abi: null,
        address: '0x00000000000000000000000000000000000000bb',
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 2,
        isProxy: false,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: null,
        verified: true,
      });

    await expect(
      EvmLightNodeUtils.getAbi('1', '0x00000000000000000000000000000000000000aa'),
    ).resolves.toBeNull();
  });

  it('normalizes structured proxy target payloads before resolving abi', async () => {
    const proxyAddress = '0x00000000000000000000000000000000000000aa';
    const targetAddress = '0x00000000000000000000000000000000000000bb';
    const targetAbi = [{ type: 'function', name: 'approve', inputs: [] }];
    const getSpy = jest
      .spyOn(EvmLightNodeApi, 'get')
      .mockResolvedValueOnce({
        abi: [{ type: 'function', name: 'fallback', inputs: [] }],
        address: proxyAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 1,
        isProxy: true,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: { target: targetAddress },
        verified: true,
      })
      .mockResolvedValueOnce({
        abi: targetAbi,
        address: targetAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 2,
        isProxy: false,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: null,
        verified: true,
      });

    await expect(EvmLightNodeUtils.getAbi('1', proxyAddress)).resolves.toEqual(
      targetAbi,
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      `contract/1/${encodeURIComponent(targetAddress)}`,
    );
  });

  it('returns the contract abi directly when the contract is not a proxy', async () => {
    const abi = [{ type: 'function', name: 'transfer', inputs: [] }];
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
      abi,
      address: '0x00000000000000000000000000000000000000cc',
      chainId: 1,
      contractType: 'ERC20',
      firstSeenBlock: 1,
      id: 3,
      isProxy: false,
      lastSeenBlock: null,
      metadata: null,
      possibleSpam: false,
      price: null,
      proxyTarget: null,
      verified: true,
    });

    await expect(
      EvmLightNodeUtils.getAbi('1', '0x00000000000000000000000000000000000000cc'),
    ).resolves.toEqual(abi);
  });

  it('forwards cursor, limit, and display flags when fetching history from the light node', async () => {
    const getSpy = jest
      .spyOn(EvmLightNodeApi, 'get')
      .mockResolvedValue({ items: [], nextCursor: null });

    await EvmLightNodeUtils.getHistory(
      '0x89',
      '0x00000000000000000000000000000000000000aa',
      'cursor=abc&limit=50&showPossibleSpam=true&showUnverified=true',
    );

    expect(getSpy).toHaveBeenCalledWith(
      'history/137/0x00000000000000000000000000000000000000aa?cursor=abc&limit=50&showPossibleSpam=true&showUnverified=true',
    );
  });

  it('registers addresses with POST on the direct light-node API', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined as any);
    const postSpy = jest.spyOn(EvmLightNodeApi, 'post').mockResolvedValue({});

    await EvmLightNodeUtils.registerAddress(
      '0x1',
      '0x00000000000000000000000000000000000000aa',
      false,
    );

    expect(postSpy).toHaveBeenCalledWith(
      'register/1/0x00000000000000000000000000000000000000aa/false',
      {},
    );
  });

  it('getReceiverSecurity calls GET /address with encoded receiver', async () => {
    const receiver = '0x00000000000000000000000000000000000000aa';
    (BaseApi.getWithResponse as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        isMalicious: true,
        reasons: ['mixer'],
        stale: false,
      },
    });

    const result = await EvmLightNodeUtils.getReceiverSecurity(receiver);

    expect(result).toEqual({
      isMalicious: true,
      reasons: ['mixer'],
      stale: false,
    });
    expect(BaseApi.getWithResponse).toHaveBeenCalledWith(
      expect.stringContaining(`address/${encodeURIComponent(receiver)}`),
    );
  });

  it('getContract preserves security from the light-node payload', async () => {
    const contractAddress = '0x00000000000000000000000000000000000000cc';
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
      id: 1,
      chainId: 1,
      address: contractAddress,
      firstSeenBlock: 1,
      lastSeenBlock: null,
      abi: null,
      contractType: 'ERC20',
      verified: false,
      isProxy: false,
      proxyTargetAddress: null,
      proxyTarget: null,
      possibleSpam: true,
      metadata: null,
      price: null,
      security: {
        isMalicious: true,
        reasons: ['phishing_activities'],
        stale: true,
      },
    });

    const result = await EvmLightNodeUtils.getContract('1', contractAddress);

    expect(result.security).toEqual({
      isMalicious: true,
      reasons: ['phishing_activities'],
      stale: true,
    });
  });

  it('normalizeDomainForLightNode matches light-node hostname rules', () => {
    expect(normalizeDomainForLightNode('https://dapp.example/')).toBe(
      'dapp.example',
    );
    expect(normalizeDomainForLightNode('dapp.example')).toBe('dapp.example');
  });
});

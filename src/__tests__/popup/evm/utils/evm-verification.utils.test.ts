import {
  EvmLightNodeUtils,
  normalizeDomainForLightNode,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmVerificationUtils } from '@popup/evm/utils/evm-verification.utils';
import { BaseApi } from 'src/api/base';

jest.mock('src/api/base', () => ({
  BaseApi: {
    getWithResponse: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('normalizeDomainForLightNode', () => {
  it('normalizes full URLs to hostnames', () => {
    expect(normalizeDomainForLightNode('https://App.Example.com/path')).toBe(
      'app.example.com',
    );
  });

  it('normalizes bare hostnames', () => {
    expect(normalizeDomainForLightNode('app.example.com')).toBe('app.example.com');
  });
});

describe('fetchLightNodeVerificationData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty object when there is nothing to check', async () => {
    const result = await EvmVerificationUtils.fetchLightNodeVerificationData({});

    expect(result).toEqual({});
  });

  it('fetches domain and receiver security from light-node', async () => {
    (BaseApi.getWithResponse as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          isMalicious: true,
          reasons: ['phishing_site'],
          stale: false,
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          isMalicious: true,
          reasons: ['mixer'],
          stale: false,
        },
      });

    const result = await EvmVerificationUtils.fetchLightNodeVerificationData({
      origin: 'https://app.example',
      to: '0x00000000000000000000000000000000000000aa',
    });

    expect(result.domainSecurity?.isMalicious).toBe(true);
    expect(
      result.addressSecurityByAddress?.[
        '0x00000000000000000000000000000000000000aa'
      ]?.reasons,
    ).toEqual(['mixer']);
    expect(BaseApi.getWithResponse).toHaveBeenCalledTimes(2);
  });

  it('uses prefetched contract security without a duplicate contract GET', async () => {
    const getContractSpy = jest.spyOn(EvmLightNodeUtils, 'getContract');

    const result = await EvmVerificationUtils.fetchLightNodeVerificationData({
      chainId: '1',
      tokenContract: '0x00000000000000000000000000000000000000cc',
      prefetchedContract: {
        id: 1,
        chainId: 1,
        address: '0x00000000000000000000000000000000000000cc',
        firstSeenBlock: 1,
        lastSeenBlock: null,
        abi: null,
        contractType: 'ERC20',
        verified: false,
        isProxy: false,
        proxyTarget: null,
        possibleSpam: true,
        metadata: null,
        price: null,
        security: {
          isMalicious: true,
          reasons: ['phishing_activities'],
          stale: false,
        },
      },
    });

    expect(result.contractSecurity?.isMalicious).toBe(true);
    expect(getContractSpy).not.toHaveBeenCalled();
    getContractSpy.mockRestore();
  });

  it('marks unavailable when all security calls fail', async () => {
    (BaseApi.getWithResponse as jest.Mock).mockResolvedValue({ status: 502 });

    const result = await EvmVerificationUtils.fetchLightNodeVerificationData({
      origin: 'https://app.example',
      to: '0x00000000000000000000000000000000000000aa',
    });

    expect(result.unavailable).toBe(true);
    expect(BaseApi.getWithResponse).toHaveBeenCalledTimes(2);
  });
});

import {
  IpfsGatewayRequestError,
  IpfsResolutionError,
  IpfsUtils,
} from 'src/utils/ipfs.utils';

const getGatewayFromUrl = (url: string): string => {
  return IpfsUtils.IPFS_GATEWAYS.find((gateway) => url.startsWith(gateway))!;
};

describe('IpfsUtils', () => {
  beforeEach(() => {
    IpfsUtils.clearGatewayHealthState();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    IpfsUtils.clearGatewayHealthState();
  });

  it.each([
    ['ipfs://bafy123/images/1.png', 'bafy123/images/1.png'],
    ['ipfs://ipfs/bafy123/images/1.png', 'bafy123/images/1.png'],
    ['/ipfs/bafy123/images/1.png', 'bafy123/images/1.png'],
    ['CID/images/1.png', 'CID/images/1.png'],
    [
      'https://an-old-gateway.example/ipfs/bafy123/images/1.png',
      'bafy123/images/1.png',
    ],
  ])('normalizes %s', (uri, expectedPath) => {
    expect(IpfsUtils.getIpfsPath(uri)).toBe(expectedPath);
  });

  it('preserves nested CID paths when building gateway URLs', () => {
    expect(
      IpfsUtils.buildIpfsGatewayUrl(
        IpfsUtils.getIpfsPath('ipfs://bafy123/images/nested/1.png')!,
        'https://4everland.io/ipfs/',
      ),
    ).toBe('https://4everland.io/ipfs/bafy123/images/nested/1.png');
  });

  it('returns the gateway and normalized URL from the public resolver', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const resolution = await IpfsUtils.resolveIpfsUrl(
      'ipfs://bafy-resolver/images/1.png',
    );

    expect(resolution.url).toBe(
      `${resolution.gateway}bafy-resolver/images/1.png`,
    );
    expect(fetchSpy).toHaveBeenCalledWith(resolution.url, {
      method: 'HEAD',
      signal: expect.any(AbortSignal),
    });
  });

  it('selects preferred gateways deterministically while distributing CIDs', () => {
    const uri = 'ipfs://bafy-deterministic/images/1.png';
    const firstSelection = IpfsUtils.getIpfsGatewayUrls(uri);
    const secondSelection = IpfsUtils.getIpfsGatewayUrls(uri);
    const preferredGateways = new Set(IpfsUtils.IPFS_GATEWAYS.slice(0, 3));

    expect(secondSelection).toEqual(firstSelection);
    expect(preferredGateways.has(getGatewayFromUrl(firstSelection[0]))).toBe(
      true,
    );
    expect(getGatewayFromUrl(firstSelection[3])).toBe(
      'https://apac.orbitor.dev/ipfs/',
    );

    const selectedPrimaries = new Set(
      Array.from({ length: 30 }, (_, index) =>
        getGatewayFromUrl(
          IpfsUtils.getIpfsGatewayUrls(`ipfs://bafy-distribution-${index}`)[0],
        ),
      ),
    );
    expect(selectedPrimaries.size).toBeGreaterThan(1);
  });

  it('keeps a slow primary active and accepts a faster secondary', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const uri = 'ipfs://bafy-slow-primary/image.png';
    const gatewayUrls = IpfsUtils.getIpfsGatewayUrls(uri);
    let primarySignal: AbortSignal | undefined;

    const request = jest.fn(
      (url: string, signal: AbortSignal): Promise<string> => {
        if (url === gatewayUrls[0]) {
          primarySignal = signal;
          return new Promise(() => undefined);
        }
        expect(primarySignal?.aborted).toBe(false);
        return Promise.resolve(url);
      },
    );

    const result = IpfsUtils.requestIpfsResource(uri, request);
    expect(request).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(IpfsUtils.HEDGE_DELAYS_MS[0]);

    await expect(result).resolves.toBe(gatewayUrls[1]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(primarySignal?.aborted).toBe(true);
  });

  it('immediately launches the next gateway after a network failure', async () => {
    const uri = 'ipfs://bafy-immediate-failure';
    const request = jest
      .fn<Promise<string>, [string, AbortSignal, string]>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockImplementationOnce(async (url) => url);

    await expect(IpfsUtils.requestIpfsResource(uri, request)).resolves.toBe(
      IpfsUtils.getIpfsGatewayUrls(uri)[1],
    );
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('cools down a gateway after HTTP 429 and skips it for new primaries', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const uri = 'ipfs://bafy-rate-limited';
    const primaryGateway = getGatewayFromUrl(
      IpfsUtils.getIpfsGatewayUrls(uri)[0],
    );
    const request = jest
      .fn<Promise<string>, [string, AbortSignal, string]>()
      .mockRejectedValueOnce(
        new IpfsGatewayRequestError('Too many requests', 429),
      )
      .mockImplementationOnce(async (url) => url);

    await IpfsUtils.requestIpfsResource(uri, request);

    expect(IpfsUtils.getGatewayState(primaryGateway).cooldownUntil).toBe(
      Date.now() + IpfsUtils.RATE_LIMIT_COOLDOWN_MS,
    );
    expect(getGatewayFromUrl(IpfsUtils.getIpfsGatewayUrls(uri)[0])).not.toBe(
      primaryGateway,
    );
  });

  it('briefly negative-caches resources that fail on every gateway', async () => {
    const request = jest
      .fn<Promise<string>, [string, AbortSignal, string]>()
      .mockRejectedValue(new Error('unavailable'));

    await expect(
      IpfsUtils.requestIpfsResource('ipfs://bafy-all-fail', request),
    ).rejects.toBeInstanceOf(IpfsResolutionError);
    expect(request).toHaveBeenCalledTimes(IpfsUtils.IPFS_GATEWAYS.length);

    await expect(
      IpfsUtils.requestIpfsResource('ipfs://bafy-all-fail', request),
    ).rejects.toThrow('recently failed');
    expect(request).toHaveBeenCalledTimes(IpfsUtils.IPFS_GATEWAYS.length);
  });

  it('makes a cooled-down gateway eligible again after cooldown', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const uri = 'ipfs://bafy-recovery';
    const primaryGateway = getGatewayFromUrl(
      IpfsUtils.getIpfsGatewayUrls(uri)[0],
    );

    IpfsUtils.reportGatewayFailure(primaryGateway, 429);
    const duringCooldown = IpfsUtils.getIpfsGatewayUrls(uri).map(
      getGatewayFromUrl,
    );
    expect(duringCooldown.indexOf(primaryGateway)).toBeGreaterThanOrEqual(8);

    jest.advanceTimersByTime(IpfsUtils.RATE_LIMIT_COOLDOWN_MS + 1);

    const afterCooldown = IpfsUtils.getIpfsGatewayUrls(uri).map(
      getGatewayFromUrl,
    );
    expect(afterCooldown.indexOf(primaryGateway)).toBeLessThan(3);
  });

  it('deduplicates concurrent requests for the same CID path', async () => {
    let completeRequest: ((value: string) => void) | undefined;
    const request = jest.fn(
      (url: string): Promise<string> =>
        new Promise((resolve) => {
          completeRequest = resolve;
        }),
    );

    const first = IpfsUtils.requestIpfsResource(
      'ipfs://bafy-shared/images/1.png',
      request,
    );
    const second = IpfsUtils.requestIpfsResource(
      '/ipfs/bafy-shared/images/1.png',
      request,
    );

    expect(request).toHaveBeenCalledTimes(1);
    const winningUrl = request.mock.calls[0][0];
    completeRequest!(winningUrl);

    await expect(Promise.all([first, second])).resolves.toEqual([
      winningUrl,
      winningUrl,
    ]);
    expect(request).toHaveBeenCalledTimes(1);
  });
});

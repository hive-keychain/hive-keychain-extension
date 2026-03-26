import { BaseApi } from '@api/base';
import { KeychainSwapApi } from 'src/api/keychain-swap';
import Config from 'src/config';

describe('KeychainSwapApi', () => {
  const baseURL = Config.swaps.baseURL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('get prepends swap base URL and returns BaseApi result', async () => {
    jest.spyOn(BaseApi, 'get').mockResolvedValue({ ok: true });

    await expect(KeychainSwapApi.get('quotes/1')).resolves.toEqual({ ok: true });

    expect(BaseApi.get).toHaveBeenCalledWith(`${baseURL}/quotes/1`);
  });

  it('post prepends swap base URL and returns BaseApi result', async () => {
    jest.spyOn(BaseApi, 'post').mockResolvedValue({ id: 'x' });

    await expect(KeychainSwapApi.post('swap', { a: 1 })).resolves.toEqual({ id: 'x' });

    expect(BaseApi.post).toHaveBeenCalledWith(`${baseURL}/swap`, { a: 1 });
  });

  it('maps Failed to fetch to swap_server_unavailable for get', async () => {
    jest
      .spyOn(BaseApi, 'get')
      .mockRejectedValue(new Error('Failed to fetch'));

    await expect(KeychainSwapApi.get('x')).rejects.toEqual({
      code: 500,
      message: 'Failed to fetch',
      reason: { template: 'swap_server_unavailable' },
    });
  });

  it('maps Failed to fetch to swap_server_unavailable for post', async () => {
    jest
      .spyOn(BaseApi, 'post')
      .mockRejectedValue(new Error('Failed to fetch'));

    await expect(KeychainSwapApi.post('x', {})).rejects.toEqual({
      code: 500,
      message: 'Failed to fetch',
      reason: { template: 'swap_server_unavailable' },
    });
  });
});

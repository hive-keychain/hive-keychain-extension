import { BaseApi } from '@api/base';

describe('BaseApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('get', () => {
    it('resolves with JSON body when status is 200', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ ok: true, n: 1 }),
      });

      await expect(BaseApi.get('https://example.com/api')).resolves.toEqual({
        ok: true,
        n: 1,
      });
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('resolves with undefined when status is not 200', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 404,
        json: () => Promise.resolve({}),
      });

      await expect(BaseApi.get('https://example.com/missing')).resolves.toBeUndefined();
    });

    it('rejects when fetch rejects', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network'));

      await expect(BaseApi.get('https://example.com/x')).rejects.toThrow('network');
    });
  });

  describe('post', () => {
    it('resolves with JSON body when status is 200', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ created: 1 }),
      });

      await expect(
        BaseApi.post('https://example.com/api', { a: 1 }),
      ).resolves.toEqual({ created: 1 });
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 1 }),
      });
    });

    it('resolves with undefined when status is not 200', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(BaseApi.post('https://example.com/api', {})).resolves.toBeUndefined();
    });
  });
});

import { validateHiveRequest } from 'src/content-scripts/hive/web-interface/hive-request-validation';

const request = {
  request_id: 1,
  type: 'transfer',
  username: 'alice',
  to: 'bob',
  amount: '1.000',
  currency: 'HIVE',
  memo: '',
};

describe('validateHiveRequest', () => {
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity])(
    'rejects invalid request id %s',
    (requestId) => {
      expect(
        validateHiveRequest({ ...request, request_id: requestId }).error,
      ).toBeTruthy();
    },
  );

  it('returns an error for an unknown type instead of throwing', () => {
    expect(() =>
      validateHiveRequest({ ...request, type: 'not-a-keychain-request' }),
    ).not.toThrow();
    expect(
      validateHiveRequest({ ...request, type: 'not-a-keychain-request' }),
    ).toEqual(
      expect.objectContaining({ error: 'Unsupported request type.' }),
    );
  });
});

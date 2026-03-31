/**
 * getData tests use a dedicated file so `hive-tx` `call` can be mocked without
 * conflicting with hive-tx.utils.test.ts, which replaces HiveTxUtils.getData in beforeEach.
 */
const mockHiveTxCall = jest.fn();

jest.mock('hive-tx', () => {
  const actual = jest.requireActual('hive-tx');
  return {
    ...actual,
    call: (method: string, params: unknown, timeout?: number) =>
      mockHiveTxCall(method, params, timeout),
  };
});

import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

describe('HiveTxUtils.getData', () => {
  beforeEach(() => {
    mockHiveTxCall.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns full RPC result when key is omitted', async () => {
    mockHiveTxCall.mockResolvedValue({
      result: { accounts: ['a'] },
    });

    const out = await HiveTxUtils.getData('condenser_api.get_accounts', ['alice']);

    expect(mockHiveTxCall).toHaveBeenCalledWith(
      'condenser_api.get_accounts',
      ['alice'],
      3000,
    );
    expect(out).toEqual({ accounts: ['a'] });
  });

  it('returns response.result[key] when key is provided', async () => {
    mockHiveTxCall.mockResolvedValue({
      result: { rows: [{ id: 1 }] },
    });

    const out = await HiveTxUtils.getData('condenser_api.foo', ['x'], 'rows');

    expect(out).toEqual([{ id: 1 }]);
  });
});

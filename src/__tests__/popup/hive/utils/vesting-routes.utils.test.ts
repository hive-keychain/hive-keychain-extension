import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { VestingRoutesUtils } from 'src/popup/hive/utils/vesting-routes.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

describe('VestingRoutesUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVestingRouteOperation', () => {
    it('builds set_withdraw_vesting_route operation', () => {
      expect(
        VestingRoutesUtils.getVestingRouteOperation('from', 'to', 55, false),
      ).toEqual([
        'set_withdraw_vesting_route',
        {
          from_account: 'from',
          to_account: 'to',
          percent: 55,
          auto_vest: false,
        },
      ]);
    });
  });

  describe('getVestingRoutes', () => {
    it('maps condenser_api response to VestingRoute shape', async () => {
      jest.spyOn(HiveTxUtils, 'getData').mockResolvedValueOnce([
        {
          from_account: 'a1',
          to_account: 'b1',
          percent: 10000,
          auto_vest: true,
        },
      ]);

      const routes = await VestingRoutesUtils.getVestingRoutes(
        'alice',
        'outgoing',
      );

      expect(HiveTxUtils.getData).toHaveBeenCalledWith(
        'condenser_api.get_withdraw_routes',
        ['alice', 'outgoing'],
      );
      expect(routes).toEqual([
        {
          fromAccount: 'a1',
          toAccount: 'b1',
          percent: 10000,
          autoVest: true,
        },
      ]);
    });
  });

  describe('getAllAccountsVestingRoutes', () => {
    it('aggregates routes per account', async () => {
      jest
        .spyOn(HiveTxUtils, 'getData')
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const out = await VestingRoutesUtils.getAllAccountsVestingRoutes(
        ['a', 'b'],
        'all',
      );

      expect(out).toEqual([
        { account: 'a', routes: [] },
        { account: 'b', routes: [] },
      ]);
    });
  });

  describe('getLastVestingRoutes', () => {
    it('returns null from storage when missing', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(null);

      await expect(VestingRoutesUtils.getLastVestingRoutes()).resolves.toBeNull();
    });

    it('returns stored routes when present', async () => {
      const stored = [{ account: 'alice', routes: [] as any[] }];
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(stored);

      await expect(VestingRoutesUtils.getLastVestingRoutes()).resolves.toEqual(stored);
    });
  });

  describe('saveLastVestingRoutes', () => {
    it('persists vesting routes', async () => {
      const spy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');
      const data = [{ account: 'x', routes: [] }];
      await VestingRoutesUtils.saveLastVestingRoutes(data);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getWrongVestingRoutes', () => {
    it('when no cached routes, saves current snapshot and returns undefined', async () => {
      jest.spyOn(HiveTxUtils, 'getData').mockResolvedValue([]);
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(null);
      const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

      const accounts = [{ name: 'alice', keys: {} } as any];
      const result = await VestingRoutesUtils.getWrongVestingRoutes(accounts);

      expect(result).toBeUndefined();
      expect(saveSpy).toHaveBeenCalled();
    });

    it('returns per-account differences when cached routes diverge from chain', async () => {
      const chainRoute = {
        from_account: 'alice',
        to_account: 'bob',
        percent: 5000,
        auto_vest: false,
      };
      jest.spyOn(HiveTxUtils, 'getData').mockResolvedValue([chainRoute]);

      const lastRoutes = [
        {
          account: 'alice',
          routes: [
            {
              fromAccount: 'alice',
              toAccount: 'bob',
              percent: 10000,
              autoVest: false,
            },
          ],
        },
      ];
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(lastRoutes);
      jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage').mockResolvedValue(undefined);

      const accounts = [{ name: 'alice', keys: {} } as any];
      const result = await VestingRoutesUtils.getWrongVestingRoutes(accounts);

      expect(result).toBeDefined();
      expect(result![0].account).toBe('alice');
      expect(result![0].differences.length).toBeGreaterThan(0);
    });

    it('treats a new account with routes as missing from cache and merges into last snapshot', async () => {
      const bobChain = {
        from_account: 'bob',
        to_account: 'carol',
        percent: 10000,
        auto_vest: false,
      };
      jest
        .spyOn(HiveTxUtils, 'getData')
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([bobChain]);

      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue([
        { account: 'alice', routes: [] },
      ]);
      const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage').mockResolvedValue(undefined);

      const accounts = [
        { name: 'alice', keys: {} } as any,
        { name: 'bob', keys: {} } as any,
      ];
      const result = await VestingRoutesUtils.getWrongVestingRoutes(accounts);

      expect(result).toBeUndefined();
      expect(saveSpy).toHaveBeenCalled();
      const saved = saveSpy.mock.calls[0][1] as { account: string }[];
      expect(saved.some((u) => u.account === 'bob')).toBe(true);
    });
  });

  describe('sendVestingRoute', () => {
    it('delegates to HiveTxUtils.sendOperation', async () => {
      const sendSpy = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue({ id: 'x' } as any);
      const key = { type: 'active', key: 'k' } as any;

      await VestingRoutesUtils.sendVestingRoute('a', 'b', 50, true, key);

      expect(sendSpy).toHaveBeenCalled();
    });
  });

  describe('skipAccountRoutes', () => {
    it('updates last routes when skipping differences', async () => {
      const route = {
        fromAccount: 'alice',
        toAccount: 'bob',
        percent: 10000,
        autoVest: false,
      };
      const last = [{ account: 'alice', routes: [route] }];
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(last);
      const saveSpy = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await VestingRoutesUtils.skipAccountRoutes(
        [{ oldRoute: route, newRoute: { ...route, percent: 5000 } }],
        'alice',
      );

      expect(saveSpy).toHaveBeenCalled();
    });

    it('appends a brand-new route when difference has only newRoute', async () => {
      const existing = {
        fromAccount: 'alice',
        toAccount: 'bob',
        percent: 10000,
        autoVest: false,
      };
      const added = {
        fromAccount: 'alice',
        toAccount: 'carol',
        percent: 5000,
        autoVest: true,
      };
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue([
        { account: 'alice', routes: [existing] },
      ]);
      const saveSpy = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await VestingRoutesUtils.skipAccountRoutes(
        [{ oldRoute: undefined, newRoute: added }],
        'alice',
      );

      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('revertAccountRoutes', () => {
    it('sends revert operations when active key exists', async () => {
      const sendSpy = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue({} as any);
      const oldRoute = {
        fromAccount: 'alice',
        toAccount: 'bob',
        percent: 5000,
        autoVest: true,
      };

      await VestingRoutesUtils.revertAccountRoutes(
        [{ name: 'alice', keys: { active: 'k' } } as any],
        [{ oldRoute, newRoute: undefined }],
        'alice',
      );

      expect(sendSpy).toHaveBeenCalled();
    });

    it('logs on send failure', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockRejectedValue(new Error('fail'));
      const logSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});

      await VestingRoutesUtils.revertAccountRoutes(
        [{ name: 'alice', keys: { active: 'k' } } as any],
        [
          {
            oldRoute: {
              fromAccount: 'a',
              toAccount: 'b',
              percent: 1,
              autoVest: false,
            },
            newRoute: undefined,
          },
        ],
        'alice',
      );

      expect(logSpy).toHaveBeenCalledWith(
        'Error while reverting vesting route(s)',
        true,
      );
    });

    it('uses percent 0 when reverting a newly added route (oldRoute missing)', async () => {
      const sendSpy = jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValue({} as any);
      const newRoute = {
        fromAccount: 'alice',
        toAccount: 'bob',
        percent: 8000,
        autoVest: false,
      };

      await VestingRoutesUtils.revertAccountRoutes(
        [{ name: 'alice', keys: { active: 'k' } } as any],
        [{ oldRoute: undefined, newRoute }],
        'alice',
      );

      expect(sendSpy).toHaveBeenCalled();
      const ops = sendSpy.mock.calls[0][0] as any[];
      expect(ops[0][1].percent).toBe(0);
    });
  });
});

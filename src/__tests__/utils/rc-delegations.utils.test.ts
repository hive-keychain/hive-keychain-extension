import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import { RcDelegationsUtils } from 'src/utils/rc-delegations.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mk from 'src/__tests__/utils-for-testing/data/mk';

describe('rc-delegations.utils.ts tests:\n', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const hiveTxGlobals = {
    globals: dynamic.globalProperties,
    medianHistoryPrice: dynamic.medianHistoryPrice,
    rewardFund: dynamic.rewardFund,
  };
  describe('getAllOutgoingDelegations cases:\n', () => {
    it('Must return outgoing delegations list with renamed props', async () => {
      HiveTxUtils.getData = jest.fn().mockResolvedValue({
        rc_direct_delegations: [
          {
            delegated_rc: '100',
            to: mk.user.one,
            from: mk.user.two,
          },
        ],
      });
      expect(
        await RcDelegationsUtils.getAllOutgoingDelegations(mk.user.one),
      ).toEqual([
        {
          value: '100',
          delegatee: mk.user.one,
          delegator: mk.user.two,
        },
      ]);
    });

    it('Must return []', async () => {
      HiveTxUtils.getData = jest.fn().mockResolvedValue(undefined);
      expect(
        await RcDelegationsUtils.getAllOutgoingDelegations(mk.user.one),
      ).toEqual([]);
    });
  });

  describe('getHivePerVests cases:\n', () => {
    it('Must return hive per vests', () => {
      expect(RcDelegationsUtils.getHivePerVests(hiveTxGlobals)).toBe(
        0.0005458633941648806,
      );
    });
  });

  describe('gigaRcToHp cases:\n', () => {
    it('Must return converted number', () => {
      expect(RcDelegationsUtils.gigaRcToHp('10000000', hiveTxGlobals)).toBe(
        '5458633.942',
      );
    });
  });

  describe('hpToGigaRc cases:\n', () => {
    it('Must return converted hp number', () => {
      expect(RcDelegationsUtils.hpToGigaRc('10000000', hiveTxGlobals)).toBe(
        '18319601.766',
      );
    });
  });

  describe('rcToGigaRc cases:\n', () => {
    it('Must return rc converted', () => {
      expect(RcDelegationsUtils.rcToGigaRc(100000000)).toBe('0.100');
    });
  });

  describe('formatRcWithUnit with unit', () => {
    it('Must return each case', () => {
      const rcToUnits = [
        {
          input: {
            value: '1000000000',
            fromGiga: true,
          },
          output: '1000.000 P RC',
        },
        {
          input: {
            value: '1',
            fromGiga: true,
          },
          output: '1.000 G RC',
        },
        {
          input: {
            value: '1000',
            fromGiga: true,
          },
          output: '1.000 T RC',
        },
      ];
      for (let i = 0; i < rcToUnits.length; i++) {
        const { input, output } = rcToUnits[i];
        const { value, fromGiga } = input;
        expect(RcDelegationsUtils.formatRcWithUnit(value, fromGiga)).toBe(
          output,
        );
      }
    });
  });

  describe('gigaRcToRc cases:\n', () => {
    it('Must return rc', () => {
      expect(RcDelegationsUtils.gigaRcToRc(0.1)).toBe(100000000);
    });
  });

  describe('rcToHp cases:\n', () => {
    it('Must return hp', () => {
      expect(RcDelegationsUtils.rcToHp('100000000', hiveTxGlobals)).toBe(
        '0.055',
      );
    });
  });
});

import { RewardsUtils } from 'src/popup/hive/utils/rewards.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import FormatUtils from 'src/utils/format.utils';

describe('RewardsUtils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('claimRewards', () => {
    it('forwards claim_reward_balance operation to HiveTxUtils.sendOperation', async () => {
      const sendSpy = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue({ id: 'x' } as any);

      await RewardsUtils.claimRewards(
        'user',
        '1.000 HIVE',
        '0.000 HBD',
        '0.000000 VESTS',
        'postingKey',
      );

      expect(sendSpy).toHaveBeenCalledWith(
        [
          [
            'claim_reward_balance',
            {
              account: 'user',
              reward_hive: '1.000 HIVE',
              reward_hbd: '0.000 HBD',
              reward_vests: '0.000000 VESTS',
            },
          ],
        ],
        'postingKey',
        false,
        undefined,
      );
    });
  });

  describe('hasReward', () => {
    it('returns false when all reward strings parse to zero', () => {
      jest.spyOn(FormatUtils, 'getValFromString').mockReturnValue(0);
      expect(RewardsUtils.hasReward('0 HBD', '0 HP', '0 HIVE')).toBe(false);
    });

    it('returns true when any reward is non-zero', () => {
      jest
        .spyOn(FormatUtils, 'getValFromString')
        .mockImplementation((s: string) => (String(s).includes('5') ? 5 : 0));
      expect(RewardsUtils.hasReward('0 HBD', '0 HP', '5 HIVE')).toBe(true);
    });
  });

  describe('getAvailableRewards', () => {
    it('builds reward text from active account balances', () => {
      jest.spyOn(chrome.i18n, 'getMessage').mockReturnValue('Redeem');
      jest.spyOn(FormatUtils, 'toHP').mockReturnValue('0');
      jest.spyOn(FormatUtils, 'getValFromString').mockImplementation((s: string) => {
        if (String(s).includes('HBD') && String(s).includes('1')) return 1;
        return 0;
      });

      const activeAccount = {
        account: {
          reward_hbd_balance: '1.000 HBD',
          reward_vesting_balance: '0 VESTS',
          reward_hive_balance: '0.000 HIVE',
        },
      } as any;

      const [, , , rewardText] = RewardsUtils.getAvailableRewards(activeAccount);

      expect(rewardText).toContain('1.000 HBD');
    });
  });
});

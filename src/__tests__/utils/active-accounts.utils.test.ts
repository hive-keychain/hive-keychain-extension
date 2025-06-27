import ActiveAccountUtils from '@hiveapp/utils/active-account.utils';
import { RewardsUtils } from '@hiveapp/utils/rewards.utils';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { FormatUtils } from 'hive-keychain-commons';

describe(' active-account.utils tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });
  describe('isEmpty tests', () => {
    test('Passing an object without the account key must return true', () => {
      const notEmptyObject = {
        account: { id: 1234 },
        keys: {},
      } as ActiveAccount;
      const result = ActiveAccountUtils.isEmpty(notEmptyObject);
      expect(result).toBe(false);
    });
    test('Passing an Object with account key in it, will return false', () => {
      const emptyObject = { account: {} } as ActiveAccount;
      const result = ActiveAccountUtils.isEmpty(emptyObject);
      expect(result).toBe(true);
    });
  });

  describe('getValFromString tests', () => {
    const stringCase1 = '12.000 HIVE';
    const stringCase2 = '10.000 JustAnother.string';
    const stringToFail = 'Hello HBD';
    test(`passing an expected string formatted as ${stringCase1} must return a number = 12`, () => {
      const numbeResult = FormatUtils.getValFromString(stringCase1);
      expect(numbeResult).toBe(12);
    });
    test(`passing an expected string formatted as ${stringCase2} must return a number = 12`, () => {
      const numbeResult = FormatUtils.getValFromString(stringCase2);
      expect(numbeResult).toBe(10);
    });
    test(`passing an non expected string formatted as ${stringToFail} must return NaN`, () => {
      const numbeResult = FormatUtils.getValFromString(stringToFail);
      expect(numbeResult).toBe(NaN);
    });
  });

  describe('hasRewards tests without mocking functions', () => {
    test('passing reward_hbd, must return true', () => {
      const rewardsObj = {
        reward_hbd: '2.000 HBD',
        reward_hp: '0.000 HP',
        reward_hive: '0.000 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hp, must return true', () => {
      const rewardsObj = {
        reward_hbd: '0.000 HBD',
        reward_hp: '1.000 HP',
        reward_hive: '0.000 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hive, must return true', () => {
      const rewardsObj = {
        reward_hbd: '0.000 HBD',
        reward_hp: '0.000 HP',
        reward_hive: '10.000 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('Passing 0 value as rewards, must return false', () => {
      const rewardsObj = {
        reward_hbd: '0.000 HBD',
        reward_hp: '0.000 HP',
        reward_hive: '0.000 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(false);
    });
  });

  describe('hasRewards tests without mocking functions', () => {
    test('passing reward_hbd, must return true', () => {
      const rewardsObj = {
        reward_hbd: '2.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hp, must return true', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '1.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hive, must return true', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '10 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('Passing 0 value as rewards, must return false', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0.0000 HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(false);
    });

    test('Passing string value as any of the rewards, is returning true as NaN != 0', () => {
      const rewardsObj = {
        reward_hbd: 'aaasadas',
        reward_hp: 'asdas HP',
        reward_hive: 'ABCD HIVE',
      };
      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });
  });

  describe('hasRewards tests with mocking functions:\n', () => {
    afterEach(() => {
      jest.fn().mockClear();
    });
    test('passing no rewards on rewardsObj, must return false', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HDB',
        reward_hp: '0.00 HP',
        reward_hive: '0.00 HIVE',
      };
      jest.resetModules();
      jest
        .spyOn(FormatUtils, 'getValFromString')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      expect(
        RewardsUtils.hasReward(
          rewardsObj.reward_hbd,
          rewardsObj.reward_hp,
          rewardsObj.reward_hive,
        ),
      ).toBe(false);
    });

    test('passing reward_hp, must return true', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '1.00 HP',
        reward_hive: '0 HIVE',
      };
      jest.resetModules();
      FormatUtils.getValFromString = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(0);

      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hive, must return true', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '10 HIVE',
      };
      jest.resetModules();
      FormatUtils.getValFromString = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10);

      expect(
        RewardsUtils.hasReward(
          rewardsObj.reward_hbd,
          rewardsObj.reward_hp,
          rewardsObj.reward_hive,
        ),
      ).toBe(true);
    });

    test('Passing 0 value as rewards, must return false', () => {
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0.0000 HIVE',
      };
      jest.resetModules();
      FormatUtils.getValFromString = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const result = RewardsUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(false);
    });
  });

  describe('getAvailableRewards tests', () => {
    test('passing an active account object with all rewards must return especific format as seen on expectedRewardText bellow', () => {
      const justRewardsObj = {
        account: {
          reward_hbd_balance: '1.00 HBD',
          reward_vesting_balance: '1.000000 VESTS',
          reward_hive_balance: '1.00 HIVE',
        },
      } as ActiveAccount;
      const messageI18n = 'Message';
      const expectedRewardText = `["1.00 HBD","1 HP","1.00 HIVE","${messageI18n}:<br>1 HP / 1.00 HBD / 1.00 HIVE"]`;
      FormatUtils.toHP = jest.fn().mockReturnValue(1);
      FormatUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances = RewardsUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
    test('passing an active account object with 1 reward(reward_hbd_balance) must return especific format as seen on expectedRewardText bellow', () => {
      const justRewardsObj = {
        account: {
          reward_hbd_balance: '1.00 HBD',
          reward_vesting_balance: '0.000000 VESTS',
          reward_hive_balance: '0.00 HIVE',
        },
      } as ActiveAccount;
      const messageI18n = 'Message 2';
      const expectedRewardText = `["1.00 HBD","0 HP","0.00 HIVE","${messageI18n}:<br>0 HP / 1.00 HBD / 0.00 HIVE"]`;
      FormatUtils.toHP = jest.fn().mockReturnValue(0);
      FormatUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances = RewardsUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
    test('passing an active account object with 1 reward(reward_vesting_balance) must return especific format as seen on expectedRewardText bellow', () => {
      const justRewardsObj = {
        account: {
          reward_hbd_balance: '0.00 HBD',
          reward_vesting_balance: '10.000000 VESTS',
          reward_hive_balance: '0.00 HIVE',
        },
      } as ActiveAccount;
      const messageI18n = 'Message 3';
      const expectedRewardText = `["0.00 HBD","10 HP","0.00 HIVE","${messageI18n}:<br>10 HP / 0.00 HBD / 0.00 HIVE\"]`;
      FormatUtils.toHP = jest.fn().mockReturnValue(10);
      FormatUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances = RewardsUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
    test('passing an active account object with 1 reward(reward_hive_balance) must return especific format as seen on expectedRewardText bellow', () => {
      const justRewardsObj = {
        account: {
          reward_hbd_balance: '0.00 HBD',
          reward_vesting_balance: '0.000000 VESTS',
          reward_hive_balance: '100.00 HIVE',
        },
      } as ActiveAccount;
      const messageI18n = 'Message 4';
      const expectedRewardText = `["0.00 HBD","0 HP","100.00 HIVE","${messageI18n}:<br>0 HP / 0.00 HBD / 100.00 HIVE\"]`;
      FormatUtils.toHP = jest.fn().mockReturnValue(0);
      FormatUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances = RewardsUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
    test('passing an active account object with NaN reward values will return those values without validation in the same format as above', () => {
      const justRewardsObj = {
        account: {
          reward_hbd_balance: 'A HBD',
          reward_vesting_balance: 'B VESTS',
          reward_hive_balance: 'WT HIVE',
        },
      } as ActiveAccount;
      const messageI18n = 'Message 5';
      const expectedRewardText = `["A HBD","0 HP","WT HIVE","${messageI18n}:<br>0 HP / A HBD / WT HIVE"]`;
      FormatUtils.toHP = jest.fn().mockReturnValue(0);
      FormatUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances = RewardsUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
  });
});

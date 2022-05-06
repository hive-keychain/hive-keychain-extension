import { ActiveAccount } from '@interfaces/active-account.interface';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import Formatutils from 'src/utils/format.utils';
//chrome
//const chrome = require('sinon-chrome/apps');
//(global as any).chrome = chrome;
//testing another package
const chrome = require('chrome-mock');
global.chrome = chrome;

describe(' active-account.utils tests', () => {
  describe('isEmpty tests', () => {
    //Note waiting for Cedric clarification about how the function should work.
    //for now I changed to return true is the whole object is empty.
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

  describe('hasRewards tests without mocking functions', () => {
    //Note as mocking the functions is required
    //if needed in the future, all this decribe block can be .skip
    //so the file will only run the next one that has the mocks.
    test('passing reward_hbd, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '2.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hp, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '1.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hive, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '10 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('Passing 0 value as rewards, must return false', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0.0000 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(false);
    });
  });

  describe('hasRewards tests without mocking functions', () => {
    //Note as mocking the functions is required
    //if needed in the future, all this decribe block can be .skip
    //so the file will only run the next one that has the mocks.
    test('passing reward_hbd, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '2.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hp, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '1.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('passing reward_hive, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '10 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test('Passing 0 value as rewards, must return false', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0.0000 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(false);
    });

    //possible case to review the getValueFromString function
    test('Passing string value as any of the rewards, is returning true as NaN != 0', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: 'aaasadas',
        reward_hp: 'asdas HP',
        reward_hive: 'ABCD HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });
  });

  describe('hasRewards tests with mocking functions', () => {
    //mock getValueFromString
    //mock activeAccount so test will always be stable
    //NOTE: i am still trying to figure this out:
    // - how to call the inner function getValFromString in order to mock it.
    // - it seams the way jest work do not allows me to use it as it is been called by another function
    // - some online examples talks about separate each function into its own module. "Obviosly that's not an option because it would mess with the project"
    // - some code i have found on many sites talking about approaches is this:
    // ---> https://qa.ostack.cn/qa/?qa=471773/
    // - other people say that the problem is that when we mock a function, jest will execute the code within that function
    // __> some info I have found so far is:
    // ---> https://stackoverflow.com/questions/50854440/spying-on-an-imported-function-that-calls-another-function-in-jest/50855968#50855968
    // more info about this:
    // - https://stackoverflow.com/questions/50854440/spying-on-an-imported-function-that-calls-another-function-in-jest/50856001#50856001
    test.skip('passing reward_hbd, must return true', () => {
      ActiveAccountUtils.getValFromString = jest.fn();

      const rewardsObj = {
        reward_hbd: '10 HDB',
        reward_hp: '0.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
      expect(ActiveAccountUtils.getValFromString).toBeCalled();
    });

    test.skip('passing reward_hp, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '1.00 HP',
        reward_hive: '0 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test.skip('passing reward_hive, must return true', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '10 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(true);
    });

    test.skip('Passing 0 value as rewards, must return false', () => {
      //reward_hbd: string, reward_hp: string, reward_hive: string,
      const rewardsObj = {
        reward_hbd: '0.00 HBD',
        reward_hp: '0.00 HP',
        reward_hive: '0.0000 HIVE',
      };
      const result = ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );
      expect(result).toBe(false);
    });
  });

  describe('getValFromString tests', () => {
    const stringCase1 = '12.000 HIVE';
    const stringCase2 = '10.000 JustAnother.string';
    const stringToFail = 'Hello HBD';
    test(`passing an expected string formatted as ${stringCase1} must return a number = 12`, () => {
      const numbeResult = ActiveAccountUtils.getValFromString(stringCase1);
      expect(numbeResult).toBe(12);
    });
    test(`passing an expected string formatted as ${stringCase2} must return a number = 12`, () => {
      const numbeResult = ActiveAccountUtils.getValFromString(stringCase2);
      expect(numbeResult).toBe(10);
    });
    test(`passing an non expected string formatted as ${stringToFail} must return NaN`, () => {
      //Note: if the expected input will always be formatted as required this is an extra case
      //otherwise a validation may be required.
      const numbeResult = ActiveAccountUtils.getValFromString(stringToFail);
      expect(numbeResult).toBe(NaN);
    });
  });

  describe('getAvailableRewards tests', () => {
    //NOTE: So far i cannot mock chrome.i18n.getMessage and I get an error:
    // -> TypeError: Cannot set property getMessage of #<Object> which has only a getter
    //
    //mock getValFromString, chrome.getMessage, FormatUtils.toHP, activeAccount to make sure test is stable
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
      Formatutils.toHP = jest.fn().mockReturnValue(1); // so it will print 1 HP.
      ActiveAccountUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances =
        ActiveAccountUtils.getAvailableRewards(justRewardsObj);
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
      const expectedRewardText = `["1.00 HBD","0 HP","0.00 HIVE","${messageI18n}:<br>1.00 HBD"]`;
      Formatutils.toHP = jest.fn().mockReturnValue(0); // so it won't print any HP.
      ActiveAccountUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances =
        ActiveAccountUtils.getAvailableRewards(justRewardsObj);
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
      const expectedRewardText = `["0.00 HBD","10 HP","0.00 HIVE","${messageI18n}:<br>10 HP"]`;
      Formatutils.toHP = jest.fn().mockReturnValue(10); // so it will print 10 HP.
      ActiveAccountUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances =
        ActiveAccountUtils.getAvailableRewards(justRewardsObj);
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
      const expectedRewardText = `["0.00 HBD","0 HP","100.00 HIVE","${messageI18n}:<br>100.00 HIVE"]`;
      Formatutils.toHP = jest.fn().mockReturnValue(0); // so it will print 0 HP.
      ActiveAccountUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances =
        ActiveAccountUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
    //optional test
    test('passing an active account object with NaN reward values will return those values without validation in the same format as above', () => {
      const justRewardsObj = {
        account: {
          reward_hbd_balance: 'A HBD',
          reward_vesting_balance: 'B VESTS',
          reward_hive_balance: 'WT HIVE',
        },
      } as ActiveAccount;
      const messageI18n = 'Message 5';
      const expectedRewardText = `["A HBD","0 HP","WT HIVE","${messageI18n}:<br>A HBD / WT HIVE"]`;
      Formatutils.toHP = jest.fn().mockReturnValue(0); // so it will print 0 HP.
      ActiveAccountUtils.getValFromString = jest.fn().mockReturnValue(1);
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(() => `${messageI18n}`);
      const resultBalances =
        ActiveAccountUtils.getAvailableRewards(justRewardsObj);
      expect(JSON.stringify(resultBalances)).toBe(expectedRewardText);
    });
  });
});

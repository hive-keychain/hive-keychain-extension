import { ActiveAccount } from '@interfaces/active-account.interface';
import ActiveAccountUtils, * as ActiveAccountModule from 'src/utils/active-account.utils';

describe(' active-account.utils tests', () => {
  describe('isEmpty tests', () => {
    //Note waiting for Cedric clarification about how the function should work.
    //for now I changed to return true is the whole object is empty.
    test('Passing an object without keys must return true', () => {
      const notEmptyObject = {
        account: { id: 1234 },
        keys: {},
      } as ActiveAccount;
      const result = ActiveAccountUtils.isEmpty(notEmptyObject);
      expect(result).toBe(false);
    });
    test('Passing an Object with keys in it, will return false', () => {
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
    test('passing reward_hbd, must return true', () => {
      jest.mock('../../utils/active-account.utils.ts', () => {
        getValFromString: jest.fn().mockImplementation((...args: any) => {
          console.log('being called using: ', args);
        });
        hasReward: jest.fn().mockImplementation((...args: any) => {
          console.log('being called using: ', args);
        });
      });

      // ActiveAccountUtils.hasReward = jest
      //   .fn()
      //   .mockImplementation((...args: any) => {
      //     console.log('being called with: ', args);
      //     return false;
      //   });

      const rewardsObj = {
        reward_hbd: '10 HDB',
        reward_hp: '0.00 HP',
        reward_hive: '0 HIVE',
      };
      //const result =
      ActiveAccountModule.default.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );

      ActiveAccountUtils.hasReward(
        rewardsObj.reward_hbd,
        rewardsObj.reward_hp,
        rewardsObj.reward_hive,
      );

      //expect(result).toBe(false);
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
});

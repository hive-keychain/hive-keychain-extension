import KeychainApi from '@api/keychain';
import { Asset, Client, ExtendedAccount, Price } from '@hiveio/dhive';
import { Rpc } from '@interfaces/rpc.interface';
import {
  GlobalProperties,
  RewardFund,
} from 'src/interfaces/global-properties.interface';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
const chrome = require('chrome-mock');
global.chrome = chrome;

async function resetClient() {
  await HiveUtils.setRpc({ uri: 'https://api.hive.blog' } as Rpc);
}
afterEach(async () => {
  jest.clearAllMocks();
  await resetClient(); //reset client if needed as default later on
});
describe('hive.utils tests:\n', () => {
  describe('getClient tests:\n', () => {
    test('calling getclient must return an instance of Client', () => {
      const getClientObj = HiveUtils.getClient();
      expect(getClientObj instanceof Client).toBe(true);
      expect(getClientObj.address).toBeDefined();
    });
  });
  describe('setRpc tests:\n', () => {
    test('Passing uri as "DEFAULT" will set the uri of the Client class as the return value from KeychainApi.get', async () => {
      const returnedUriValue = 'https://ValueFromHive/rpc/api';
      KeychainApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { rpc: returnedUriValue } });
      const fakeRpc: Rpc = {
        uri: 'DEFAULT',
        testnet: true,
      };
      expect(HiveUtils.getClient().address).toBe('https://api.hive.blog');
      const result = await HiveUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
      expect(HiveUtils.getClient().address).toBe(returnedUriValue);
    });

    test('Passing uri different from "DEFAULT" will override the uri value on the Client Class', async () => {
      const overridingValue = 'https://overridingValue/rpc/api';
      const fakeRpc: Rpc = {
        uri: overridingValue,
        testnet: true,
      };
      expect(HiveUtils.getClient().address).toBe('https://api.hive.blog');
      const result = await HiveUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
      expect(HiveUtils.getClient().address).toBe(overridingValue);
    });
  });

  describe('getVP tests:\n', () => {
    test('Passing an ExtendedAccount Obj with no account property must return null', () => {
      const fakeExtended = {} as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtended);
      expect(result).toBeNull();
    });
    test('Passing a valid ExtendedAccount Obj with 0 values, will return NaN', () => {
      const fakeExtendedData = {
        name: utilsT.dataUserExtended.name,
        vesting_withdraw_rate: '0.000 VESTS',
        voting_manabar: {
          current_mana: 0,
          last_update_time: 0, //1615046820
        },
        vesting_shares: '0.000 VESTS',
        delegated_vesting_shares: '0.000 VESTS',
        received_vesting_shares: '0.000 VESTS',
      } as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtendedData);
      expect(result).toBe(NaN);
    });
    test('Passing a valid ExtendedAccount Obj(cedricDataSample) with specific values, must return and estimated_pct=100', () => {
      const fakeExtendedData = {
        name: utilsT.cedricDataSample.name,
        vesting_withdraw_rate: utilsT.cedricDataSample.vesting_withdraw_rate,
        voting_manabar: utilsT.cedricDataSample.voting_manabar,
        vesting_shares: utilsT.cedricDataSample.vesting_shares,
        delegated_vesting_shares:
          utilsT.cedricDataSample.delegated_vesting_shares,
        received_vesting_shares:
          utilsT.cedricDataSample.received_vesting_shares,
      } as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtendedData);
      expect(result).toBe(100);
    });
  });

  describe('getVotingDollarsPerAccount tests:\n', () => {
    const price = new Price(new Asset(0.49, 'HBD'), new Asset(1, 'HIVE'));
    const rewardFund: RewardFund = {
      id: 0,
      name: 'post',
      reward_balance: '794370.819 HIVE',
      recent_claims: '618003654293909260',
      last_update: '2022-05-13T13:59:27',
      content_constant: '2000000000000',
      percent_curation_rewards: 5000,
      percent_content_rewards: 10000,
      author_reward_curve: 'linear',
      curation_reward_curve: 'linear',
    };
    const properties: GlobalProperties = {
      globals: utilsT.dynamicPropertiesObj,
      price: price,
      rewardFund: rewardFund,
    };
    const fakeExtendedData = {
      name: utilsT.cedricDataSample.name,
      vesting_withdraw_rate: utilsT.cedricDataSample.vesting_withdraw_rate,
      voting_manabar: utilsT.cedricDataSample.voting_manabar,
      vesting_shares: utilsT.cedricDataSample.vesting_shares,
      delegated_vesting_shares:
        utilsT.cedricDataSample.delegated_vesting_shares,
      received_vesting_shares: utilsT.cedricDataSample.received_vesting_shares,
    } as ExtendedAccount;
    test('Passing the testing data above, must return a voteValue="0.12"', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).not.toBeNull();
      expect(result).toBe('0.12');
    });
    test('Passing the testing data above, but with voteWeight=50, must return a voteValue="0.06"', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        50,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).not.toBeNull();
      expect(result).toBe('0.06');
    });
    test('Passing the testing data above, but with voteWeight=0, must return a voteValue="0.00"', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        0,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).not.toBeNull();
      expect(result).toBe('0.00');
    });
    test('Passing a GlobalProperties without globals property, must return null', () => {
      const _properties = {} as GlobalProperties;
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        _properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeNull();
    });
    test('Passing an Extended Account without name property must return null', () => {
      const _fakeExtendedData = {} as ExtendedAccount;
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        _fakeExtendedData,
        false,
      );
      expect(result).toBeNull();
    });
    test('If getRewardBalance returns 0, must return undefined', () => {
      const spyGetRewardBalance = jest
        .spyOn(HiveUtils, 'getRewardBalance')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetRewardBalance).toBeCalledTimes(1);
      expect(spyGetRewardBalance).toBeCalledWith(properties);
    });
    test('If getRecentClaims returns 0, must return undefined', () => {
      const spyGetRecentClaims = jest
        .spyOn(HiveUtils, 'getRecentClaims')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetRecentClaims).toBeCalledTimes(1);
      expect(spyGetRecentClaims).toBeCalledWith(properties);
    });
    test('If getHivePrice returns 0, must return undefined', () => {
      const spyGetHivePrice = jest
        .spyOn(HiveUtils, 'getHivePrice')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetHivePrice).toBeCalledTimes(1);
      expect(spyGetHivePrice).toBeCalledWith(properties);
    });
    test('If getVotePowerReserveRate returns 0, must return undefined', () => {
      const spyGetVotePowerReserveRate = jest
        .spyOn(HiveUtils, 'getVotePowerReserveRate')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetVotePowerReserveRate).toBeCalledTimes(1);
      expect(spyGetVotePowerReserveRate).toBeCalledWith(properties);
    });
    test('If getRewardBalance returns Infinity, will return "Infinity"', () => {
      const spyGetRewardBalance = jest
        .spyOn(HiveUtils, 'getRewardBalance')
        .mockReturnValueOnce(Infinity);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBe('Infinity');
      expect(spyGetRewardBalance).toBeCalledTimes(1);
      expect(spyGetRewardBalance).toBeCalledWith(properties);
    });
  });

  describe('getTimeBeforeFull tests:\n', () => {
    test('Passing a votingPower=100.0 must return the message "popup_utils_full" from i18n', () => {
      const expectedMessage = 'popup_utils_full';
      chrome.i18n.getMessage = jest.fn().mockImplementationOnce((...args) => {
        return args;
      });
      const result = HiveUtils.getTimeBeforeFull(100.0);
      expect(result).not.toBeNull();
      expect(result).toEqual([expectedMessage]);
    });
    test('Passing different values of votingPower(votingPowerArrayTest) must return the expectedMessageArray', () => {
      const showIteration = false;
      const votingPowerArrayTest = [...utilsT.votingPowerArrayTest];
      chrome.i18n.getMessage = jest.fn().mockImplementation((...args) => {
        return args;
      });
      votingPowerArrayTest.forEach((testCase) => {
        if (showIteration) {
          console.log(
            `About to test, votingPower: ${testCase.votingPower}\nMust return: ${testCase.expectedMessageArray}`,
          );
        }
        expect(HiveUtils.getTimeBeforeFull(testCase.votingPower)).toEqual(
          testCase.expectedMessageArray,
        );
      });
    });
    test('Passing a negative votingPower value will return undefined', () => {
      chrome.i18n.getMessage = jest.fn().mockImplementationOnce((...args) => {
        return args;
      });
      const result = HiveUtils.getTimeBeforeFull(-50.0);
      expect(result).toBeUndefined();
    });
  });

  describe('getConversionRequests tests:\n', () => {
    test('Fecthing 2 arrays(hbdConversions, hiveConversions) must order them by convertion_date and reestructure hiveConversions Array, and return one new array', async () => {
      const expectedNewArray = [
        {
          amount: '22.500 HIVE',
          collaterized: true,
          conversion_date: '2022-05-10T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
        {
          amount: '2.500 HBD',
          conversion_date: '2022-05-15T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
      ];
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return utilsT.fakeHbdConversionsResponse;
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return utilsT.fakeHiveConversionsResponse;
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual(expectedNewArray);
    });
    test('Fetching 1 arrays(hiveConversions) will reestructure hiveConversions Array, and return one new array', async () => {
      const expectedNewArray = [
        {
          amount: '22.500 HIVE',
          collaterized: true,
          conversion_date: '2022-05-10T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
      ];
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return [];
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return utilsT.fakeHiveConversionsResponse;
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual(expectedNewArray);
    });
    test('Fetching 2 empty arrays will return an empty array', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return [];
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return [];
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual([]);
    });
    test('If hiveConversions lack one of the used properties, will return an array with undefined values', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return [];
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return [{ anyOther: 'anyOther' }];
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual([
        {
          amount: undefined,
          collaterized: true,
          conversion_date: undefined,
          id: undefined,
          owner: undefined,
          requestid: undefined,
        },
      ]);
    });
  });
});

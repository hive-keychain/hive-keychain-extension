import KeychainApi from '@api/keychain';
import {
  Asset,
  Client,
  ExtendedAccount,
  Price,
  PrivateKey,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Delegator } from '@interfaces/delegations.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { store } from '@popup/store';
import {
  GlobalProperties,
  RewardFund,
} from 'src/interfaces/global-properties.interface';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils, { getDelegatees, getDelegators } from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
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

  describe('getDelegators tests:\n', () => {
    test('Passing an account with delegators must return an array of results', async () => {
      const spyKeychainApiGet = jest.spyOn(KeychainApi, 'get');
      spyKeychainApiGet.mockResolvedValueOnce({
        data: utilsT.fakeGetDelegatorsResponse,
      });
      const username = 'blocktrades';
      const result = await getDelegators(username);
      expect(result.length).toBeDefined();
      expect(spyKeychainApiGet).toBeCalledTimes(1);
      expect(spyKeychainApiGet).toBeCalledWith(`/hive/delegators/${username}`);
    });
    test('Passing an account with No delegators must return an Empty array', async () => {
      const spyKeychainApiGet = jest.spyOn(KeychainApi, 'get');
      spyKeychainApiGet.mockResolvedValueOnce({ data: [] });
      const username = 'blocktrades';
      const result = await getDelegators(username);
      expect(result.length).toBeDefined();
      expect(result.length).toBe(0);
      expect(spyKeychainApiGet).toBeCalledTimes(1);
      expect(spyKeychainApiGet).toBeCalledWith(`/hive/delegators/${username}`);
    });
    test('Passing an account with delegators must return an array filtered and sorted, see conditions bellow', async () => {
      //To filter (vesting_shares !== 0)
      //To order (b.vesting_shares - a.vesting_shares)
      const spyKeychainApiGet = jest.spyOn(KeychainApi, 'get');
      spyKeychainApiGet.mockResolvedValueOnce({
        data: [
          {
            delegation_date: '2017-08-09T15:30:36.000Z',
            delegator: 'kriborin',
            vesting_shares: 0,
          },
          {
            delegation_date: '2017-08-09T15:29:42.000Z',
            delegator: 'kevtorin',
            vesting_shares: 1000.0,
          },
          {
            delegation_date: '2017-08-09T15:31:48.000Z',
            delegator: 'lessys',
            vesting_shares: 1000000.0,
          },
        ],
      });
      const expectedArrayOrdered = [
        {
          delegation_date: '2017-08-09T15:31:48.000Z',
          delegator: 'lessys',
          vesting_shares: 1000000,
        },
        {
          delegation_date: '2017-08-09T15:29:42.000Z',
          delegator: 'kevtorin',
          vesting_shares: 1000,
        },
      ] as Delegator[];
      const username = 'blocktrades';
      const result = await getDelegators(username);
      expect(result.length).toBe(2);
      expect(result).toEqual(expectedArrayOrdered);
      expect(spyKeychainApiGet).toBeCalledTimes(1);
      expect(spyKeychainApiGet).toBeCalledWith(`/hive/delegators/${username}`);
    });
  });

  describe('getDelegatees tests:\n', () => {
    test('Passing an account with delegators must return an array filtered and sorted, see conditions bellow', async () => {
      //To filter parseFloat(e.vesting_shares + '') !== 0
      //To order parseFloat(b.vesting_shares + '') - parseFloat(a.vesting_shares + '')
      let mockedGetVestingDelegations =
        (HiveUtils.getClient().database.getVestingDelegations = jest.fn());
      const username = 'blocktrades';
      mockedGetVestingDelegations.mockResolvedValueOnce(
        utilsT.fakeGetDelegateesResponse,
      );
      const argumentsCallingApi = [username, '', 1000];
      const expectedArrayOrdered = [
        {
          id: 1350016,
          delegator: 'blocktrades',
          delegatee: 'usainvote',
          vesting_shares: '300.000000 VESTS',
          min_delegation_time: '2020-08-16T05:34:33',
        },
        {
          id: 933999,
          delegator: 'blocktrades',
          delegatee: 'ocdb',
          vesting_shares: '200.902605 VESTS',
          min_delegation_time: '2018-05-25T22:14:30',
        },
        {
          id: 270663,
          delegator: 'blocktrades',
          delegatee: 'buildawhale',
          vesting_shares: '100.000000 VESTS',
          min_delegation_time: '2017-09-29T02:19:03',
        },
      ];
      const result = await getDelegatees(username);
      expect(result.length).toBe(3);
      expect(result).toEqual(expectedArrayOrdered);
      expect(mockedGetVestingDelegations).toBeCalledTimes(1);
      expect(mockedGetVestingDelegations).toBeCalledWith(
        ...argumentsCallingApi,
      );
    });
    test('Passing an account with No delegators must return an Empty array', async () => {
      let mockedGetVestingDelegations =
        (HiveUtils.getClient().database.getVestingDelegations = jest.fn());
      mockedGetVestingDelegations.mockResolvedValueOnce([]);
      const username = 'theghost1980';
      const argumentsCallingApi = [username, '', 1000];
      const result = await getDelegatees(username);
      expect(result.length).toBe(0);
      expect(mockedGetVestingDelegations).toBeCalledTimes(1);
      expect(mockedGetVestingDelegations).toBeCalledWith(
        ...argumentsCallingApi,
      );
    });
  });

  describe('claimRewards tests:\n', () => {
    let spyLogger = jest.spyOn(Logger, 'error');
    let loggerCallParams: any[] = [];
    let dispatchCallParams: {};
    beforeEach(() => {
      store.dispatch = jest.fn();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Passing an empty ActiveAccount with rewards to claim must call Logger, dispatch a TypeError and return false', async () => {
      loggerCallParams = [
        'Error while claiming rewards',
        "TypeError: Cannot read properties of undefined (reading 'posting')",
      ];
      dispatchCallParams = {
        payload: {
          key: 'popup_html_claim_error',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      };
      const activeAccountEmpty = {} as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountEmpty,
        '1.000 HIVE',
        '1.000 HBD',
        '1.000 VESTS',
      );
      expect(result).toBe(false);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(...loggerCallParams);
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(dispatchCallParams);
    });
    test('Passing an ActiveAccount without name property, must dispatch a SerializationError and return false', async () => {
      loggerCallParams = [
        'Error while claiming rewards',
        'SerializationError: Unable to serialize transaction: operations: claim_reward_balance: account: Illegal str: Not a string',
      ];
      dispatchCallParams = {
        payload: {
          key: 'popup_html_claim_error',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      };
      const activeAccountNoName = {
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountNoName,
        '1.000 HIVE',
        '1.000 HBD',
        '1.000 VESTS',
      );
      expect(result).toBe(false);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(...loggerCallParams);
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(dispatchCallParams);
    });
    test('Passing an ActiveAccount with active key, must dispatch a TypeError and return false', async () => {
      loggerCallParams = [
        'Error while claiming rewards',
        'TypeError: Expected String',
      ];
      dispatchCallParams = {
        payload: {
          key: 'popup_html_claim_error',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      };
      const activeAccountusingActivekey = {
        keys: {
          active: utilsT.userData.nonEncryptKeys.active,
          activePubkey: utilsT.userData.encryptKeys.active,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '1.000 HIVE',
        '1.000 HBD',
        '1.000 VESTS',
      );
      expect(result).toBe(false);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(...loggerCallParams);
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(dispatchCallParams);
    });
    test('Passing a valid ActiveAccount with empty rewardHive, must dispatch a SerializationError and return false', async () => {
      loggerCallParams = [
        'Error while claiming rewards',
        'SerializationError: Unable to serialize transaction: operations: claim_reward_balance: reward_hive: Invalid asset symbol: undefined',
      ];
      dispatchCallParams = {
        payload: {
          key: 'popup_html_claim_error',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      };
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '',
        '1.00 HBD',
        '1.00 VESTS',
      );
      expect(result).toBe(false);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(...loggerCallParams);
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(dispatchCallParams);
    });
    test('Passing a valid ActiveAccount with empty rewardHBD, must dispatch a SerializationError and return false', async () => {
      loggerCallParams = [
        'Error while claiming rewards',
        'SerializationError: Unable to serialize transaction: operations: claim_reward_balance: reward_hbd: Invalid asset symbol: undefined',
      ];
      dispatchCallParams = {
        payload: {
          key: 'popup_html_claim_error',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      };
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '1.00 HIVE',
        '',
        '1.00 VESTS',
      );
      expect(result).toBe(false);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(...loggerCallParams);
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(dispatchCallParams);
    });
    test('Passing a valid ActiveAccount with empty rewardVests, must dispatch a SerializationError and return false', async () => {
      loggerCallParams = [
        'Error while claiming rewards',
        'SerializationError: Unable to serialize transaction: operations: claim_reward_balance: reward_vests: Invalid asset symbol: undefined',
      ];
      dispatchCallParams = {
        payload: {
          key: 'popup_html_claim_error',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      };
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '1.00 HIVE',
        '1.00 HBD',
        '',
      );
      expect(result).toBe(false);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(...loggerCallParams);
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(dispatchCallParams);
    });
    test('Passing valid Data with reward_hive, must pass the steps bellow and return true', async () => {
      //Steps:
      // 1. Broadcast the claim and get a valid transaction Object with an id property with status as 'within_mempool'.
      // 2. Wait for a valid TransactionStatus from getClient().transaction.findTransaction, as 'within_reversible_block', using the id from step 1.
      // 3. Call Logger.info with the message 'Transaction confirmed'
      // 4. Dispatch a successMessage as 'popup_html_claim_success' containing the claimedResources.
      // 5. Return true
      const transactionObjWaiting = {
        id: '001199xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '001199xxdass990',
        status: 'within_reversible_block',
      };
      const sendOperationCallParams: any[] = [
        [
          [
            'claim_reward_balance',
            {
              account: 'keychain.tests',
              reward_hbd: '0.00 HBD',
              reward_hive: '1.00 HIVE',
              reward_vests: '0.00 VESTS',
            },
          ],
        ],
        PrivateKey.fromString(utilsT.userData.nonEncryptKeys.posting as string),
      ];
      const loggerInfoConfirmedMessage = 'Transaction confirmed';
      const expectedDispatchSuccessParams = {
        payload: {
          key: 'popup_html_claim_success',
          params: ['1.00 HIVE'],
          type: 'SUCCESS',
        },
        type: 'SET_MESSAGE',
      };
      const mockedGetClientSendOperations =
        (HiveUtils.getClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValueOnce(transactionObjWaiting));
      const mockedGetClientFindTransaction =
        (HiveUtils.getClient().transaction.findTransaction = jest
          .fn()
          .mockResolvedValueOnce(transactionObjConfirmed));
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '1.00 HIVE',
        '0.00 HBD',
        '0.00 VESTS',
      );
      expect(result).toBe(true);
      expect(mockedGetClientSendOperations).toBeCalledTimes(1);
      expect(mockedGetClientSendOperations).toBeCalledWith(
        ...sendOperationCallParams,
      );
      expect(mockedGetClientFindTransaction).toBeCalledTimes(1);
      expect(mockedGetClientFindTransaction).toBeCalledWith(
        transactionObjWaiting.id,
      );
      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith(loggerInfoConfirmedMessage);

      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(expectedDispatchSuccessParams);
    });
    test('Passing valid Data with all rewards, must pass the steps bellow and return true', async () => {
      //Steps:
      // 1. Broadcast the claim and get a valid transaction Object with an id property with status as 'within_mempool'.
      // 2. Wait for a valid TransactionStatus from getClient().transaction.findTransaction, as 'within_reversible_block', using the id from step 1.
      // 3. Call Logger.info with the message 'Transaction confirmed'
      // 4. Dispatch a successMessage as 'popup_html_claim_success' containing the claimedResources.
      // 5. Return true
      const transactionObjWaiting = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '002299xxdass990',
        status: 'within_reversible_block',
      };
      const sendOperationCallParams: any[] = [
        [
          [
            'claim_reward_balance',
            {
              account: 'keychain.tests',
              reward_hive: '10.00 HIVE',
              reward_hbd: '11.00 HBD',
              reward_vests: '12.00 VESTS',
            },
          ],
        ],
        PrivateKey.fromString(utilsT.userData.nonEncryptKeys.posting as string),
      ];
      const loggerInfoConfirmedMessage = 'Transaction confirmed';
      const expectedDispatchSuccessParams = {
        payload: {
          key: 'popup_html_claim_success',
          params: ['11.00 HBD, 10.00 HIVE, 12.000 HP'],
          type: 'SUCCESS',
        },
        type: 'SET_MESSAGE',
      };
      const mockedGetClientSendOperations =
        (HiveUtils.getClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValueOnce(transactionObjWaiting));
      const mockedGetClientFindTransaction =
        (HiveUtils.getClient().transaction.findTransaction = jest
          .fn()
          .mockResolvedValueOnce(transactionObjConfirmed));
      const mockFormatUtilsToHP = (FormatUtils.toHP = jest
        .fn()
        .mockReturnValueOnce(12));
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '10.00 HIVE',
        '11.00 HBD',
        '12.00 VESTS',
      );
      expect(result).toBe(true);
      expect(mockedGetClientSendOperations).toBeCalledTimes(1);
      expect(mockedGetClientSendOperations).toBeCalledWith(
        ...sendOperationCallParams,
      );
      expect(mockedGetClientFindTransaction).toBeCalledTimes(1);
      expect(mockedGetClientFindTransaction).toBeCalledWith(
        transactionObjWaiting.id,
      );
      expect(mockFormatUtilsToHP).toBeCalledTimes(1);

      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith(loggerInfoConfirmedMessage);

      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(expectedDispatchSuccessParams);
    });

    test('Passing all valid Data, but making fail sendOperationWithConfirmation must return false and pass steps bellow', async () => {
      //Steps:
      //1. Call Logger.info(`Transaction failed with status: ${transaction.status}`);
      //2. Return as false.
      const transactionObjWaiting = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '002299xxdass990',
        status: 'error_message',
      };
      const sendOperationCallParams: any[] = [
        [
          [
            'claim_reward_balance',
            {
              account: 'keychain.tests',
              reward_hive: '10.00 HIVE',
              reward_hbd: '11.00 HBD',
              reward_vests: '12.00 VESTS',
            },
          ],
        ],
        PrivateKey.fromString(utilsT.userData.nonEncryptKeys.posting as string),
      ];
      const loggerInfoErrorMessage = `Transaction failed with status: ${transactionObjConfirmed.status}`;
      const mockedGetClientSendOperations =
        (HiveUtils.getClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValueOnce(transactionObjWaiting));
      const mockedGetClientFindTransaction =
        (HiveUtils.getClient().transaction.findTransaction = jest
          .fn()
          .mockResolvedValueOnce(transactionObjConfirmed));
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '10.00 HIVE',
        '11.00 HBD',
        '12.00 VESTS',
      );
      expect(result).toBe(false);
      expect(mockedGetClientSendOperations).toBeCalledTimes(1);
      expect(mockedGetClientSendOperations).toBeCalledWith(
        ...sendOperationCallParams,
      );
      expect(mockedGetClientFindTransaction).toBeCalledTimes(1);
      expect(mockedGetClientFindTransaction).toBeCalledWith(
        transactionObjWaiting.id,
      );

      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith(loggerInfoErrorMessage);
    });
  });

  describe.only('powerUp tests"\n', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Power up the activeAccount user, must call Logger with "Transaction confirmed" and return true', async () => {
      const transactionObjWaiting = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '002299xxdass990',
        status: 'within_reversible_block',
      };
      PrivateKey.fromString = jest.fn(); //no implementation.
      HiveUtils.getClient().broadcast.sendOperations = jest
        .fn()
        .mockResolvedValueOnce(transactionObjWaiting);
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce(transactionObjConfirmed);
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const result = await HiveUtils.powerUp(
        utilsT.userData.username,
        utilsT.userData.username,
        '0.001 HIVE',
      );
      expect(result).toBe(true);
      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith('Transaction confirmed');
    });
    test.only('Power up the activeAccount user, but getting a transaction.status error, must return false and log error message', async () => {
      const transactionObjWaiting = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      const transactionObjError = {
        id: '002299xxdass990',
        status: 'error_XXXX',
      };
      store.getState().activeAccount.keys.active =
        utilsT.userData.nonEncryptKeys.active;
      const mockedGetClientSendOperations =
        (HiveUtils.getClient().broadcast.sendOperations = jest
          .fn()
          .mockImplementation(() => Promise.resolve(transactionObjWaiting)));
      const mockedGetClientFindTransaction =
        (HiveUtils.getClient().transaction.findTransaction = jest
          .fn()
          .mockImplementation(() => Promise.resolve(transactionObjError)));
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const spyLoggerInfo = jest.spyOn(Logger, 'info');

      const result = await HiveUtils.powerUp(
        utilsT.userData.username,
        utilsT.userData.username,
        '0.001 HIVE',
      );
      expect(result).toBe(false);
    });
  });
});

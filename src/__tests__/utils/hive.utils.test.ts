import { KeychainApi } from '@api/keychain';
import { ExtendedAccount } from '@hiveio/dhive';
import { Rpc } from '@interfaces/rpc.interface';
import { AssertionError } from 'assert';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import conversions from 'src/__tests__/utils-for-testing/data/conversions';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';
import { ConversionUtils } from 'src/utils/conversion.utils';
import { DelegationUtils } from 'src/utils/delegation.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import HiveUtils from 'src/utils/hive.utils';

describe('hive.utils tests:\n', () => {
  async function resetClient() {
    await HiveTxUtils.setRpc({ uri: 'https://api.hive.blog' } as Rpc);
  }
  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    await resetClient();
  });
  beforeEach(async () => {
    await HiveTxUtils.setRpc(rpc.fake);
  });

  describe('setRpc tests:\n', () => {
    it('Nust set default uri', async () => {
      const returnedUriValue = 'https://ValueFromHive/rpc/api';
      KeychainApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { rpc: returnedUriValue } });
      const fakeRpc: Rpc = {
        uri: 'DEFAULT',
        testnet: true,
      };
      const result = await HiveTxUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
    });
  });

  describe('getVP tests:\n', () => {
    it('Must return null', () => {
      const fakeExtended = {} as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtended);
      expect(result).toBeNull();
    });

    it('Must return NaN', () => {
      const fakeExtendedData = {
        ...accounts.extended,
        vesting_withdraw_rate: '0',
        voting_manabar: {
          current_mana: '0',
          last_update_time: Date.now(),
        },
        vesting_shares: '0 VESTS',
        received_vesting_shares: '0 VESTS',
        delegated_vesting_shares: '0 VESTS',
      } as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtendedData);
      expect(result).toBe(NaN);
    });
  });

  describe('getVotingDollarsPerAccount tests:\n', () => {
    const fakeExtendedData = {
      ...accounts.extendedStringValues,
      vesting_shares: '100000000 VESTS',
      received_vesting_shares: '100000000 VESTS',
      delegated_vesting_shares: '0 VESTS',
      vesting_withdraw_rate: '0 VESTS',
    };
    const fakeGlobals = {
      globals: dynamic.globalProperties,
      price: {
        base: '0.294 HBD',
        quote: '1.000 HIVE',
      },
      rewardFund: dynamic.rewardFund,
    } as unknown as GlobalProperties;

    it('Nust return 1.54', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        fakeGlobals,
        fakeExtendedData,
        false,
      );
      expect(result).toBe('1.54');
    });

    it('Must return 0.78', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        50,
        fakeGlobals,
        fakeExtendedData,
        false,
      );
      expect(result).toBe('0.78');
    });

    it('Must return null', () => {
      const cloneGlobals = objects.clone(fakeGlobals) as GlobalProperties;
      delete cloneGlobals.globals;
      const result = HiveUtils.getVotingDollarsPerAccount(
        0,
        cloneGlobals,
        fakeExtendedData,
        false,
      );
      expect(result).toBeNull();
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

    test('Passing a negative votingPower value will return undefined', () => {
      chrome.i18n.getMessage = jest.fn().mockImplementationOnce((...args) => {
        return args;
      });
      const result = HiveUtils.getTimeBeforeFull(-50.0);
      expect(result).toBeUndefined();
    });
  });

  describe('getConversionRequests tests:\n', () => {
    it('Must return ordered array', async () => {
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
          collaterized: false,
          conversion_date: '2022-05-15T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
      ];
      mocksImplementation.hiveTxUtils.getData({
        conversionRequests: conversions.fakeHbdConversionsResponse,
        collateralized: conversions.fakeHiveConversionsResponse,
      });
      const result = await ConversionUtils.getConversionRequests('wesp05');
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
      mocksImplementation.hiveTxUtils.getData({
        conversionRequests: [],
        collateralized: conversions.fakeHiveConversionsResponse,
      });
      const result = await ConversionUtils.getConversionRequests('wesp05');
      expect(result).toEqual(expectedNewArray);
    });
    test('Fetching 2 empty arrays will return an empty array', async () => {
      mocksImplementation.hiveTxUtils.getData({
        conversionRequests: [],
        collateralized: [],
      });
      const result = await ConversionUtils.getConversionRequests('wesp05');
      expect(result).toEqual([]);
    });
    test('If hiveConversions lack one of the used properties, will return an array with undefined values', async () => {
      mocksImplementation.hiveTxUtils.getData({
        conversionRequests: [],
        collateralized: [{ anyOther: 'any' }],
      });
      const result = await ConversionUtils.getConversionRequests('wesp05');
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
      DelegationUtils.getDelegators = jest
        .fn()
        .mockResolvedValue(delegations.delegators);
      const username = 'blocktrades';
      const result = await DelegationUtils.getDelegators(username);
      expect(result).toEqual(delegations.delegators);
    });
    test('Passing an account with No delegators must return an Empty array', async () => {
      DelegationUtils.getDelegators = jest.fn().mockResolvedValue([]);
      const username = 'blocktrades';
      const result = await DelegationUtils.getDelegators(username);
      expect(result).toEqual([]);
    });
  });

  describe('getDelegatees tests:\n', () => {
    test('Passing an account with delegatees must return an array', async () => {
      DelegationUtils.getDelegatees = jest
        .fn()
        .mockResolvedValue(delegations.delegatees);
      const results = await DelegationUtils.getDelegatees('string');
      expect(results).toEqual(delegations.delegatees);
    });
    test('Passing an account with No delegatees must return an Empty array', async () => {
      DelegationUtils.getDelegatees = jest.fn().mockResolvedValue([]);
      const username = 'theghost1980';
      const result = await DelegationUtils.getDelegatees(username);
      expect(result.length).toBe(0);
    });
  });

  describe('signMessage tests:\n', () => {
    test('Must return the expected signature', () => {
      const expectedSignature =
        '1f4aa1439a8a3c1f559eec87b4ada274698138efc6ba4e5b7cabffa32828943e6251aca3b097b5c422f8689cb13b933b49c32b81064bfb8662e423a281142f1286';
      const result = HiveUtils.signMessage(
        'test message',
        userData.one.nonEncryptKeys.posting,
      );
      expect(result).toBe(expectedSignature);
    });
    test('Must throw an AssertionError', () => {
      try {
        const result = HiveUtils.signMessage(
          'test message',
          userData.one.encryptKeys.posting,
        );
        expect(result).toBe(1);
      } catch (error) {
        expect(error).toEqual(
          new AssertionError({
            message: 'Expected version 128, instead got 38',
            actual: 128,
            expected: 38,
            operator: '==',
          }),
        );
      }
    });
  });
});

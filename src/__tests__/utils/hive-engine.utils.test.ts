import { hsc } from '@api/hiveEngine';
import { PrivateKey } from '@hiveio/dhive';
import { AssertionError } from 'assert';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('hive-engine.utils tests:\n', () => {
  describe('Mocking HIVE APIs:\n', () => {
    afterAll(() => {
      jest.clearAllMocks();
    });

    describe('getUserBalance tests:\n', () => {
      test('Passing an existing account with tokens, must return balances object with the properties defined bellow', async () => {
        hsc.find = jest
          .fn()
          .mockReturnValueOnce(utilsT.fakeResponseHavingTokenBalances);
        const propertiesArray = [
          '_id',
          'account',
          'balance',
          'delegationsIn',
          'delegationsOut',
          'pendingUndelegations',
          'pendingUnstake',
          'stake',
          'symbol',
        ];
        const result = await HiveEngineUtils.getUserBalance(
          utilsT.userData.username,
        );
        expect(result).not.toBeNull();
        expect(result.length).toBeDefined();
        expect(result.length).not.toBe(0);
        propertiesArray.map((property) => {
          expect(result[0][property]).toBeDefined();
        });
      });
      test('Passing an existing account with no tokens, must return an empty array', async () => {
        hsc.find = jest.fn().mockReturnValueOnce([]);
        const result = await HiveEngineUtils.getUserBalance(
          utilsT.userData2.username,
        );
        expect(result.length).toBeDefined();
        expect(result.length).toBe(0);
      });

      test('Passing an non existing account must return an empty array', async () => {
        hsc.find = jest.fn().mockReturnValueOnce([]);
        const result = await HiveEngineUtils.getUserBalance(
          'NonExistingAccountName',
        );
        expect(result.length).toBeDefined();
        expect(result.length).toBe(0);
      });
    });

    describe('stakeToken tests:\n', () => {
      test('Trying to stake using a public active password must generate an error on DHive, before submitting the json', async () => {
        //NOTE: This test even when is not mocking do not rely on network connection as the failing condition will be catched by Dhive
        //before submitting the json, so can be considered as local test.
        const symbolToken = 'HIVE';
        const amount = '1';
        const activeAccountName = utilsT.userData.username;
        const showError = false;
        const expectedErrorMessage = 'private key network id mismatch';
        try {
          await HiveEngineUtils.stakeToken(
            utilsT.userData.encryptKeys.active,
            utilsT.userData.username,
            symbolToken,
            amount,
            activeAccountName,
          )
            .then((response) => {})
            .catch((e) => {
              if (showError) {
                console.log('Error:');
                console.log(e);
              }
              expect(e).toEqual(
                new AssertionError({
                  message: expectedErrorMessage,
                }),
              );
            });
        } catch (error) {
          if (showError) {
            console.log(error);
          }
        }
      });

      test('Trying to stake using the active password must return a valid TransactionConfirmation Object', async () => {
        HiveUtils.getClient().broadcast.json = jest
          .fn()
          .mockImplementationOnce((...args) => {
            return {
              id: '803e8c82a48d5c9a452df2eb96bf49996f300f06',
            };
          });
        const symbolToken = 'CTPM';
        const amount = '10';
        const activeAccountName = utilsT.userData.username;
        const response = await HiveEngineUtils.stakeToken(
          utilsT.userData.nonEncryptKeys.active,
          utilsT.userData.username,
          symbolToken,
          amount,
          activeAccountName,
        );
        expect(response.id).toBeDefined();
      });
    });

    describe('unstakeToken tests:\n', () => {
      test('Trying to unstake a token but using a public key, will fire a Dhive error before transmitting the json', async () => {
        //NOTE: This test even when is not mocking do not rely on network connection as the failing condition will be catched by Dhive
        //before submitting the json, so can be considered as local test.
        const symbolToken = 'HIVE';
        const amount = '1';
        const activeAccountName = utilsT.userData.username;
        const showError = false;
        const expectedErrorMessage = 'private key network id mismatch';
        try {
          await HiveEngineUtils.unstakeToken(
            utilsT.userData.encryptKeys.active,
            symbolToken,
            amount,
            activeAccountName,
          )
            .then((response) => {})
            .catch((e) => {
              if (showError) {
                console.log('Error:');
                console.log(e);
              }
              expect(e).toEqual(
                new AssertionError({
                  message: expectedErrorMessage,
                }),
              );
            });
        } catch (error) {
          if (showError) {
            console.log(error);
          }
        }
      });

      test('Trying to unstake using the active password must return a valid TransactionConfirmation Object', async () => {
        HiveUtils.getClient().broadcast.json = jest
          .fn()
          .mockImplementationOnce((...args) => {
            return {
              id: '803e8c82a48d5c9a452df2eb96bf49996f300f06',
            };
          });
        const symbolToken = 'CTPM';
        const amount = '10';
        const activeAccountName = utilsT.userData.username;
        const response = await HiveEngineUtils.unstakeToken(
          utilsT.userData.nonEncryptKeys.active,
          symbolToken,
          amount,
          activeAccountName,
        );
        expect(response.id).toBeDefined();
      });
    });

    describe('delegateToken tests:\n', () => {
      test('Trying to delegate a token but using a public key, will fire a Dhive error before transmitting the json', async () => {
        //NOTE: This test even when is not mocking do not rely on network connection as the failing condition will be catched by Dhive
        //before submitting the json, so can be considered as local test.
        const symbolToken = 'HIVE';
        const amount = '1000';
        const activeAccountName = utilsT.userData.username;
        const showError = false;
        const expectedErrorMessage = 'private key network id mismatch';
        try {
          await HiveEngineUtils.delegateToken(
            utilsT.userData.encryptKeys.active,
            utilsT.userData2.username,
            symbolToken,
            amount,
            activeAccountName,
          )
            .then((response) => {})
            .catch((e) => {
              if (showError) {
                console.log('Error:');
                console.log(e);
              }
              expect(e).toEqual(
                new AssertionError({
                  message: expectedErrorMessage,
                }),
              );
            });
        } catch (error) {
          if (showError) {
            console.log(error);
          }
        }
      });

      test('Trying to delegate using the active password must return a valid TransactionConfirmation Object', async () => {
        HiveUtils.getClient().broadcast.json = jest
          .fn()
          .mockImplementationOnce((...args) => {
            return {
              id: '803e8c82a48d5c9a452df2eb96bf49996f300f06',
            };
          });
        const symbolToken = 'CTPM';
        const amount = '10';
        const activeAccountName = utilsT.userData.username;
        const response = await HiveEngineUtils.delegateToken(
          utilsT.userData.nonEncryptKeys.active,
          utilsT.userData2.username,
          symbolToken,
          amount,
          activeAccountName,
        );
        expect(response.id).toBeDefined();
      });
    });

    describe('cancelDelegationToken tests:\n', () => {
      test('Trying to cancel a delegation of a token but using a public key, will fire a Dhive error before transmitting the json', async () => {
        //NOTE: This test even when is not mocking do not rely on network connection as the failing condition will be catched by Dhive
        //before submitting the json, so can be considered as local test.
        const symbolToken = 'HIVE';
        const amount = '1000';
        const activeAccountName = utilsT.userData.username;
        const showError = false;
        const expectedErrorMessage = 'private key network id mismatch';
        try {
          await HiveEngineUtils.cancelDelegationToken(
            utilsT.userData.encryptKeys.active,
            utilsT.userData2.username,
            symbolToken,
            amount,
            activeAccountName,
          )
            .then((response) => {})
            .catch((e) => {
              if (showError) {
                console.log('Error:');
                console.log(e);
              }
              expect(e).toEqual(
                new AssertionError({
                  message: expectedErrorMessage,
                }),
              );
            });
        } catch (error) {
          if (showError) {
            console.log(error);
          }
        }
      });

      test('Trying to cancel a delegation using the active password must return a valid TransactionConfirmation Object', async () => {
        HiveUtils.getClient().broadcast.json = jest
          .fn()
          .mockImplementationOnce((...args) => {
            return {
              id: '803e8c82a48d5c9a452df2eb96bf49996f300f06',
            };
          });
        const symbolToken = 'CTPM';
        const amount = '10';
        const activeAccountName = utilsT.userData.username;
        const response = await HiveEngineUtils.cancelDelegationToken(
          utilsT.userData.nonEncryptKeys.active,
          utilsT.userData2.username,
          symbolToken,
          amount,
          activeAccountName,
        );
        expect(response.id).toBeDefined();
      });
    });

    describe('getIncomingDelegations tests:\n', () => {
      test('Passing a valid token symbol and account that has delegations must return an array of results', async () => {
        hsc.find = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeIncommingDelegations);
        const response = await HiveEngineUtils.getIncomingDelegations(
          'BEE',
          'upfundme',
        );
        expect(response.length).not.toBe(0);
      });
      test('Passing a valid token symbol and account that No has delegations must return an empty array', async () => {
        hsc.find = jest.fn().mockResolvedValueOnce([]);
        const response = await HiveEngineUtils.getIncomingDelegations(
          'BEE',
          'upfundme',
        );
        expect(response.length).toBe(0);
      });
    });

    describe('getOutgoingDelegations tests:\n', () => {
      test('Passing a valid token symbol and account that has made delegations, must return an array of results', async () => {
        hsc.find = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeOutgoingDelegations);
        const response = await HiveEngineUtils.getOutgoingDelegations(
          'BEE',
          'coininstant',
        );
        expect(response.length).not.toBe(0);
        expect(response[0].quantity).toBeDefined();
      });
      test('Passing a valid token symbol and account that has no made delegations, must return an empty array', async () => {
        hsc.find = jest.fn().mockResolvedValueOnce([]);
        const response = await HiveEngineUtils.getOutgoingDelegations(
          'BEE',
          'upfundme',
        );
        expect(response.length).toBe(0);
      });
    });

    describe('sendToken tests:\n', () => {
      type SendTokenProps = {
        username: string;
        currency: string;
        to: string;
        amount: string;
        memo: string;
      };
      test('Passing requested data, must broadcast the json and return a valid TransactionConfirmation Object', async () => {
        HiveUtils.getClient().broadcast.json = jest
          .fn()
          .mockImplementationOnce((...args) => {
            return {
              id: '803e8c82a48d5c9a452df2eb96bf49996f300f06',
            };
          });
        const data: SendTokenProps = {
          username: utilsT.userData.username,
          currency: 'BEE',
          to: utilsT.userData2.username,
          amount: '10.000',
          memo: 'This is a Test.',
        };
        const privateKey = PrivateKey.fromString(
          utilsT.userData.nonEncryptKeys.active,
        );
        const result = await HiveEngineUtils.sendToken(data, privateKey);
        expect(result.id).toBeDefined();
      });
    });
  });
});

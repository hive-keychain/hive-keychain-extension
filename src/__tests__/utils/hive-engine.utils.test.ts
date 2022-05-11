import { hsc } from '@api/hiveEngine';
import { AssertionError } from 'assert';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('hive-engine.utils tests:\n', () => {
  describe('Without Mocking HIVE APIs:\n', () => {
    describe('getUserBalance tests:\n', () => {
      test('Passing as existing account with tokens, must return balances object with the properties defined bellow', async () => {
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
        const username = utilsT.userData.username;
        const showResult = false;
        const result = await HiveEngineUtils.getUserBalance(username);
        if (showResult) {
          console.log(result);
        }
        expect(result).not.toBeNull();
        expect(result.length).toBeDefined();
        if (result.length && result.length > 0) {
          propertiesArray.map((property) => {
            expect(result[0][property]).toBeDefined();
          });
        } else {
          console.log(
            `Results: User ${username} has no tokens in his account.`,
          );
        }
      });

      test('Passing as existing account with no tokens, must console.log the message', async () => {
        const username = utilsT.userData2.username;
        const showResult = false;
        const result = await HiveEngineUtils.getUserBalance(username);
        if (showResult) {
          console.log(result);
        }
        expect(result).not.toBeNull();
        expect(result.length).toBeDefined();
        expect(result.length).toBe(0);
        console.log(`Results: User ${username} has no tokens in his account.`);
      });

      test('Passing an non existing account must return an empty array', async () => {
        const username = 'theLocoCouCou!';
        const expectedAnswerNoFoundUser: any = [];
        expect(await HiveEngineUtils.getUserBalance(username)).toEqual(
          expectedAnswerNoFoundUser,
        );
      });
    });

    describe.only('stakeToken tests:\n', () => {
      test('Trying to stake using a public active password must generate an error on @hiveio', async () => {
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
            console.log('Error on @hiveio');
            console.log(error);
          }
        }
      });
      test('Trying to stake using the active password, but having no balance of that token must fail', async () => {
        // const symbolToken = 'HIVE';
        // const amount = '0.1';
        // const activeAccountName = utilsT.userData.username;
        // const showResponse = true;
        // const response = await HiveEngineUtils.stakeToken(
        //   utilsT.userData.nonEncryptKeys.active,
        //   utilsT.userData.username,
        //   symbolToken,
        //   amount,
        //   activeAccountName,
        // );
        // if (showResponse) {
        //   console.log(response);
        // }
        // expect(response).not.toBeNull();
        // expect(response.id).toBeDefined();

        //get a tx id results must be in a loop until the response is written on Blockchain
        const txInfo = await hsc.getTransactionInfo(
          '4dbf9462be2cbeb9d970fc777cea795521284fc1',
        ); //{ id: '4dbf9462be2cbeb9d970fc777cea795521284fc1' }
        console.log(txInfo);
        //END get a tx id results
      });
      test.skip('try to stake using a non existent username must fail', () => {});
      test.skip('try to stake a non existing token must fail', () => {});
      test.skip('try to stake an existing token but having no balance must fail', () => {});
      test.skip('try to stake an existing token, active password, having balance should pass', () => {});
    });

    // describe('unstakeToken tests:\n', () => {
    //     test('', () => {

    //     });
    // });

    // describe('delegateToken tests:\n', () => {
    //     test('', () => {

    //     });
    // });

    // describe('cancelDelegationToken tests:\n', () => {
    //     test('', () => {

    //     });
    // });

    // describe('getIncomingDelegations tests:\n', () => {
    //     test('', () => {

    //     });
    // });

    // describe('getOutgoingDelegations tests:\n', () => {
    //     test('', () => {

    //     });
    // });

    // describe('sendToken tests:\n', () => {
    //     test('', () => {

    //     });
    // });
  });

  describe('Mocking HIVE APIs', () => {});
});

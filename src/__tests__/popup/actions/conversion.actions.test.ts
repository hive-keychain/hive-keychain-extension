import { ActionType } from '@popup/actions/action-type.enum';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as convertionActions from 'src/popup/actions/conversion.actions';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring

describe('conversion.actions tests:\n', () => {
  describe('fetchConversionRequests tests:\n', () => {
    test('Calling this action will return convertions from this user and a FETCH_CONVERSION_REQUESTS action', async () => {
      const fakeArrayResponse = [
        utilsT.fakeHbdConversionsResponse,
        utilsT.fakeHiveConversionsResponse,
      ];
      const mockGetConvertionRequests = (HiveUtils.getConversionRequests = jest
        .fn()
        .mockResolvedValueOnce(fakeArrayResponse));
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(
          convertionActions.fetchConversionRequests(utilsT.userData.username),
        )
        .then(() => {
          expect(mockedStore.getActions()).toEqual([
            {
              type: ActionType.FETCH_CONVERSION_REQUESTS,
              payload: fakeArrayResponse,
            },
          ]);
          expect(mockGetConvertionRequests).toBeCalledTimes(1);
          expect(mockGetConvertionRequests).toBeCalledWith(
            utilsT.userData.username,
          );
          mockGetConvertionRequests.mockReset();
          mockGetConvertionRequests.mockRestore();
        });
    });
    test('If an error occurs on the request, will thrown a unhandled error', async () => {
      const errorRequest = new Error('Custom Error');
      const mockGetConvertionRequests = (HiveUtils.getConversionRequests = jest
        .fn()
        .mockRejectedValueOnce(errorRequest));
      const mockedStore = mockStore({});
      try {
        return await mockedStore
          .dispatch<any>(
            convertionActions.fetchConversionRequests(utilsT.userData.username),
          )
          .then(() => {
            expect(mockedStore.getActions()).toEqual([
              {
                type: ActionType.FETCH_CONVERSION_REQUESTS,
                payload: '',
              },
            ]);
            mockGetConvertionRequests.mockReset();
            mockGetConvertionRequests.mockRestore();
          });
      } catch (error) {
        expect(error).toEqual(errorRequest);
      }
    });
  });
});

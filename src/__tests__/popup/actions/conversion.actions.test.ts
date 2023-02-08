import * as convertionActions from 'src/popup/actions/conversion.actions';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

afterEach(() => {
  jest.clearAllMocks();
});
describe('conversion.actions tests:\n', () => {
  describe('fetchConversionRequests tests:\n', () => {
    test('Must set conversions', async () => {
      const fakeArrayResponse = [
        utilsT.fakeHbdConversionsResponse,
        utilsT.fakeHiveConversionsResponse,
      ];
      HiveUtils.getConversionRequests = jest
        .fn()
        .mockResolvedValueOnce(fakeArrayResponse);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        convertionActions.fetchConversionRequests('wesp05'),
      );
      expect(fakeStore.getState().conversions).toEqual(fakeArrayResponse);
    });
    test('If an error occurs on the request, will thrown a unhandled error', async () => {
      const errorRequest = new Error('Custom Error');
      HiveUtils.getConversionRequests = jest
        .fn()
        .mockRejectedValueOnce(errorRequest);
      try {
        const fakeStore = getFakeStore(initialEmptyStateStore);
        await fakeStore.dispatch<any>(
          convertionActions.fetchConversionRequests('wesp05'),
        );
        expect(fakeStore.getState().conversions).toEqual(null);
      } catch (error) {
        expect(error).toEqual(errorRequest);
      }
    });
  });
});

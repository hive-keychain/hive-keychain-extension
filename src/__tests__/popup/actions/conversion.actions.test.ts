import conversions from 'src/__tests__/utils-for-testing/data/conversions';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as convertionActions from 'src/popup/actions/conversion.actions';
import { ConversionUtils } from 'src/utils/conversion.utils';

describe('conversion.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchConversionRequests tests:\n', () => {
    test('Must set conversions', async () => {
      const fakeArrayResponse = [
        conversions.fakeHbdConversionsResponse,
        conversions.fakeHiveConversionsResponse,
      ];
      ConversionUtils.getConversionRequests = jest
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
      ConversionUtils.getConversionRequests = jest
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

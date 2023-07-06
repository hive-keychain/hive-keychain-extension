import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as mkActions from 'src/popup/hive/actions/mk.actions';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('mk.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('setMk tests:\n', () => {
    test('Must set mk', () => {
      const mockSaveValue = (LocalStorageUtils.saveValueInLocalStorage =
        jest.fn());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      fakeStore.dispatch<any>(mkActions.setMk(mk.user.two, false));
      expect(fakeStore.getState().mk).toBe(mk.user.two);
      expect(mockSaveValue).toBeCalledWith(
        LocalStorageKeyEnum.__MK,
        mk.user.two,
      );
      mockSaveValue.mockClear();
      mockSaveValue.mockReset();
    });
    test('As empty will still set mk', () => {
      const mockSaveValue = (LocalStorageUtils.saveValueInLocalStorage =
        jest.fn());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      const mk = '';
      fakeStore.dispatch<any>(mkActions.setMk(mk, false));
      expect(fakeStore.getState().mk).toBe(mk);
      expect(mockSaveValue).toBeCalledWith(LocalStorageKeyEnum.__MK, mk);
      mockSaveValue.mockClear();
      mockSaveValue.mockReset();
    });
  });

  describe('forgetMk tests:\n', () => {
    test('Must remove mk', () => {
      const mockRemoveValue = (LocalStorageUtils.removeFromLocalStorage =
        jest.fn());
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        mk: mk.user.two,
      });
      fakeStore.dispatch<any>(mkActions.forgetMk());
      expect(fakeStore.getState().mk).toBe('');
      expect(mockRemoveValue).toBeCalledWith(LocalStorageKeyEnum.__MK);
      mockRemoveValue.mockClear();
      mockRemoveValue.mockReset();
    });
  });
});

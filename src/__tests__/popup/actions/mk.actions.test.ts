import * as mkActions from '@popup/actions/mk.actions';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
afterEach(() => {
  jest.clearAllMocks();
});
describe('mk.actions tests:\n', () => {
  describe('setMk tests:\n', () => {
    test('Must set mk', () => {
      const mockSaveValue = (LocalStorageUtils.saveValueInLocalStorage =
        jest.fn());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      const mk = utilsT.secondAccountOnState.name;
      fakeStore.dispatch<any>(mkActions.setMk(mk, false));
      expect(fakeStore.getState().mk).toBe(mk);
      expect(mockSaveValue).toBeCalledWith(LocalStorageKeyEnum.__MK, mk);
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
      const mk = utilsT.secondAccountOnState.name;
      const mockRemoveValue = (LocalStorageUtils.removeFromLocalStorage =
        jest.fn());
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        mk: mk,
      });
      fakeStore.dispatch<any>(mkActions.forgetMk());
      expect(fakeStore.getState().mk).toBe('');
      expect(mockRemoveValue).toBeCalledWith(LocalStorageKeyEnum.__MK);
      mockRemoveValue.mockClear();
      mockRemoveValue.mockReset();
    });
  });
});

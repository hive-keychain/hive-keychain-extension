import { VaultKey } from '@reference-data/vault-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as mkActions from 'src/popup/multichain/actions/mk.actions';
import VaultUtils from 'src/utils/vault.utils';

describe('mk.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('setMk tests:\n', () => {
    test('Must set mk', () => {
      const mockSave = jest
        .spyOn(VaultUtils, 'saveValueInVault')
        .mockImplementation(() => Promise.resolve());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      fakeStore.dispatch<any>(mkActions.setMk(mk.user.two, false));
      expect(fakeStore.getState().mk).toBe(mk.user.two);
      expect(mockSave).toHaveBeenCalledWith(VaultKey.__MK, mk.user.two);
      mockSave.mockRestore();
    });
    test('As empty will still set mk', () => {
      const mockSave = jest
        .spyOn(VaultUtils, 'saveValueInVault')
        .mockImplementation(() => Promise.resolve());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      const emptyMk = '';
      fakeStore.dispatch<any>(mkActions.setMk(emptyMk, false));
      expect(fakeStore.getState().mk).toBe(emptyMk);
      expect(mockSave).toHaveBeenCalledWith(VaultKey.__MK, emptyMk);
      mockSave.mockRestore();
    });
  });

  describe('forgetMk tests:\n', () => {
    test('Must remove mk', () => {
      const mockRemove = jest
        .spyOn(VaultUtils, 'removeFromVault')
        .mockImplementation(() => Promise.resolve());
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        mk: mk.user.two,
      });
      fakeStore.dispatch<any>(mkActions.forgetMk());
      expect(fakeStore.getState().mk).toBe('');
      expect(mockRemove).toHaveBeenCalledWith(VaultKey.__MK);
      mockRemove.mockRestore();
    });
  });
});

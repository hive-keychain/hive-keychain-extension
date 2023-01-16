import * as loadingActions from '@popup/actions/loading.actions';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

describe('loading.actions tests:/n', () => {
  describe('addToLoadingList tests:\n', () => {
    test('Must add new item to loading list', () => {
      const newItemAdded = [{ done: false, name: 'new item' }];
      const fakeStore = getFakeStore(initialEmptyStateStore);
      fakeStore.dispatch<any>(loadingActions.addToLoadingList('new item'));
      expect(fakeStore.getState().loading).toEqual(newItemAdded);
    });
    test('Must mark found item as not done', () => {
      const itemMarkedDone = [{ done: false, name: 'Existing Item on list' }];
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        loading: {
          loadingOperations: [{ done: true, name: 'Existing Item on list' }],
        },
      });
      fakeStore.dispatch<any>(
        loadingActions.addToLoadingList('Existing Item on list'),
      );
      expect(fakeStore.getState().loading).toEqual(itemMarkedDone);
    });
  });

  describe('removeFromLoadingList tests:\n', () => {
    test('Must return empty array', () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        loading: {
          loadingOperations: [{ done: false, name: 'Only Item on list' }],
        },
      });
      fakeStore.dispatch<any>(
        loadingActions.removeFromLoadingList('Only Item on list'),
      );
      expect(fakeStore.getState().loading).toEqual([]);
    });
    test('Must mark one item as done and return actual list', () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        loading: {
          loadingOperations: [
            { done: false, name: 'Pending Item 1 on list' },
            { done: false, name: 'Pending Item 2 on list' },
            { done: false, name: 'Pending Item 3 on list' },
          ],
        },
      });
      fakeStore.dispatch<any>(
        loadingActions.removeFromLoadingList('Pending Item 1 on list'),
      );
      expect(fakeStore.getState().loading).toEqual([
        { done: true, name: 'Pending Item 1 on list' },
        { done: false, name: 'Pending Item 2 on list' },
        { done: false, name: 'Pending Item 3 on list' },
      ]);
    });
    test('If not found must return actual list', () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        loading: {
          loadingOperations: [
            { done: false, name: 'Pending Item 1 on list' },
            { done: false, name: 'Pending Item 2 on list' },
            { done: false, name: 'Pending Item 3 on list' },
          ],
        },
      });
      fakeStore.dispatch<any>(
        loadingActions.removeFromLoadingList('Not found item?'),
      );
      expect(fakeStore.getState().loading).toEqual([
        { done: false, name: 'Pending Item 1 on list' },
        { done: false, name: 'Pending Item 2 on list' },
        { done: false, name: 'Pending Item 3 on list' },
      ]);
    });
  });
});

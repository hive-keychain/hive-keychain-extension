import * as titleContainerActions from '@popup/actions/title-container.actions';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
describe('title-container.actions tests:\n', () => {
  describe('setTitleContainerProperties tests:\n', () => {
    const properties = {
      title: 'page title',
    } as PageTitleProps;
    test('Must set title properties', () => {
      const fakeStore = getFakeStore(initialEmptyStateStore);
      fakeStore.dispatch<any>(
        titleContainerActions.setTitleContainerProperties(properties),
      );
      expect(fakeStore.getState().titleContainer).toEqual(properties);
    });
    test('Must reset title on title properties', () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        titleContainer: properties,
      });
      fakeStore.dispatch<any>(
        titleContainerActions.resetTitleContainerProperties(),
      );
      expect(fakeStore.getState().titleContainer).toEqual({
        title: '',
      });
    });
  });
});

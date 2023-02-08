import * as navigationActions from '@popup/actions/navigation.actions';
import { Navigation } from '@popup/reducers/navigation.reducer';
import { Screen } from '@reference-data/screen.enum';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
describe('navigation.actions tests:\n', () => {
  describe('resetNav tests:\n', () => {
    test('Must reset navigation', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [
            { currentPage: Screen.BUY_COINS_PAGE } as Navigation,
          ] as Navigation[],
        },
      });
      await fakeStore.dispatch<any>(navigationActions.resetNav());
      expect(fakeStore.getState().navigation).toEqual({
        stack: [],
        params: null,
      });
    });
  });

  describe('navigateTo tests:\n', () => {
    test('Must reset stack and set new stack', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [{ currentPage: Screen.HOME_PAGE }],
        },
      });
      await fakeStore.dispatch<any>(
        navigationActions.navigateTo(Screen.CONVERSION_PAGE, true),
      );
      expect(fakeStore.getState().navigation).toEqual({
        params: undefined,
        stack: [{ currentPage: Screen.CONVERSION_PAGE, params: undefined }],
      });
    });
    test('Must return current stack', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [{ currentPage: Screen.HOME_PAGE }],
        },
      });
      await fakeStore.dispatch<any>(
        navigationActions.navigateTo(Screen.HOME_PAGE, false),
      );
      expect(fakeStore.getState().navigation).toEqual({
        stack: [{ currentPage: Screen.HOME_PAGE }],
      });
    });
    test('Must set new stack', async () => {
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        navigationActions.navigateTo(Screen.HOME_PAGE, false),
      );
      expect(fakeStore.getState().navigation).toEqual({
        params: undefined,
        stack: [{ currentPage: Screen.HOME_PAGE, params: undefined }],
      });
    });
  });

  describe('navigateToWithParams tests:\n', () => {
    test('Must reset stack and set new stack', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [{ currentPage: Screen.HOME_PAGE }],
        },
      });
      await fakeStore.dispatch<any>(
        navigationActions.navigateToWithParams(
          Screen.CONVERSION_PAGE,
          ['param 1', 'param 2'],
          true,
        ),
      );
      expect(fakeStore.getState().navigation).toEqual({
        params: ['param 1', 'param 2'],
        stack: [
          {
            currentPage: Screen.CONVERSION_PAGE,
            params: ['param 1', 'param 2'],
          },
        ],
      });
    });
    test('Must return current stack', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [{ currentPage: Screen.HOME_PAGE }],
        },
      });
      await fakeStore.dispatch<any>(
        navigationActions.navigateToWithParams(
          Screen.HOME_PAGE,
          ['param 1', 'param 2', 'param 3'],
          false,
        ),
      );
      expect(fakeStore.getState().navigation).toEqual({
        stack: [{ currentPage: Screen.HOME_PAGE }],
      });
    });
    test('Must set new stack', async () => {
      const params = ['param 1', 'param 2', 'param 3'];
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        navigationActions.navigateToWithParams(Screen.HOME_PAGE, params, false),
      );
      expect(fakeStore.getState().navigation).toEqual({
        params: params,
        stack: [{ currentPage: Screen.HOME_PAGE, params: params }],
      });
    });
  });

  describe('goBack tests:\n', () => {
    test('Must return empty stack', async () => {
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(navigationActions.goBack());
      expect(fakeStore.getState().navigation).toEqual({ stack: [] });
    });
    test('Must remove first element in the stack and keep old params', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [
            {
              currentPage: Screen.CONFIRMATION_PAGE,
              params: ['param_confirmation_1', 'param_confirmation_2'],
            },
            {
              currentPage: Screen.HOME_PAGE,
              params: ['param_home_page1', 'param_home_page2'],
            },
          ],
        },
      });
      await fakeStore.dispatch<any>(navigationActions.goBack());
      expect(fakeStore.getState().navigation).toEqual({
        stack: [
          {
            currentPage: 'HOME_PAGE',
            params: ['param_home_page1', 'param_home_page2'],
            previousParams: ['param_confirmation_1', 'param_confirmation_2'],
          },
        ],
      });
    });
    test('Must remove element in stack', async () => {
      const fakeStore = getFakeStore({
        ...initialEmptyStateStore,
        navigation: {
          stack: [
            {
              currentPage: Screen.CONFIRMATION_PAGE,
              params: ['param_confirmation_1', 'param_confirmation_2'],
            },
          ],
        },
      });
      await fakeStore.dispatch<any>(navigationActions.goBack());
      expect(fakeStore.getState().navigation).toEqual({
        stack: [],
      });
    });
  });
});

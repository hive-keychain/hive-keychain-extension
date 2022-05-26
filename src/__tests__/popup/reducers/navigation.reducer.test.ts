import { ActionType } from '@popup/actions/action-type.enum';
import {
  NavigationReducer,
  NavigationState,
} from '@popup/reducers/navigation.reducer';
import { Screen } from '@reference-data/screen.enum';

describe('navigation.reducer tests:\n', () => {
  const initialEmptyState = { stack: [] } as NavigationState;
  const notEmptyState = {
    stack: [{ currentPage: Screen.HOME_PAGE, params: ['param1', 'param2'] }],
  } as NavigationState;
  const notEmptyState2InStack = {
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
  } as NavigationState;
  const resetedState = { stack: [], params: null };
  test('Calling NavigationReducer with any other action and undefined state, must return the initialized value', () => {
    const otherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    expect(NavigationReducer(undefined, otherAction)).toEqual(
      initialEmptyState,
    );
  });
  test('Calling NavigationReducer with any other action and a previuos state, must return the previous state', () => {
    const otherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, otherAction)).toEqual(
      notEmptyState,
    );
  });
  test('Calling RESET_NAV with a previuos state, must return the reseted state', () => {
    const resetNavAction = {
      type: ActionType.RESET_NAV,
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, resetNavAction)).toEqual(
      resetedState,
    );
  });
  test('Calling NAVIGATE_TO with a previuos state and resetStack[true], must delete oldStack and return the new navigationState', () => {
    const navigateToActionWResetAction = {
      type: ActionType.NAVIGATE_TO,
      payload: {
        resetStack: true,
        nextPage: Screen.BUY_COINS_PAGE,
        params: ['newParam1', 'newParam2'],
      },
    };
    const previousState = notEmptyState;
    expect(
      NavigationReducer(previousState, navigateToActionWResetAction),
    ).toEqual({
      params: ['newParam1', 'newParam2'],
      stack: [
        {
          currentPage: 'BUY_COINS_PAGE',
          params: ['newParam1', 'newParam2'],
        },
      ],
    });
  });
  test('Calling NAVIGATE_TO with a previuos state and resetStack[false], must return the new navigationState at the top the stack', () => {
    const navigateToAction = {
      type: ActionType.NAVIGATE_TO,
      payload: {
        resetStack: false,
        nextPage: Screen.BUY_COINS_PAGE,
        params: ['newParam1', 'newParam2'],
      },
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, navigateToAction)).toEqual({
      params: ['newParam1', 'newParam2'],
      stack: [
        {
          currentPage: 'BUY_COINS_PAGE',
          params: ['newParam1', 'newParam2'],
        },
        notEmptyState.stack[0],
      ],
    });
  });
  test('Calling NAVIGATE_TO with a previuos state, no payload, must return current state', () => {
    const navigateToAction = {
      type: ActionType.NAVIGATE_TO,
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, navigateToAction)).toEqual(
      notEmptyState,
    );
  });
  test('Calling NAVIGATE_TO_WITH_PARAMS with a previuos state and resetStack[true], must delete oldStack and return the new navigationState', () => {
    const navigateToWParamsActionWResetAction = {
      type: ActionType.NAVIGATE_TO_WITH_PARAMS,
      payload: {
        resetStack: true,
        nextPage: Screen.BUY_COINS_PAGE,
        params: ['newParam1', 'newParam2'],
      },
    };
    const previousState = notEmptyState;
    expect(
      NavigationReducer(previousState, navigateToWParamsActionWResetAction),
    ).toEqual({
      params: ['newParam1', 'newParam2'],
      stack: [
        {
          currentPage: 'BUY_COINS_PAGE',
          params: ['newParam1', 'newParam2'],
        },
      ],
    });
  });
  test('Calling NAVIGATE_TO_WITH_PARAMS with a previuos state and resetStack[false], must return the new navigationState at the top the stack', () => {
    const navigateToWParamsAction = {
      type: ActionType.NAVIGATE_TO_WITH_PARAMS,
      payload: {
        resetStack: false,
        nextPage: Screen.BUY_COINS_PAGE,
        params: ['newParam1', 'newParam2'],
      },
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, navigateToWParamsAction)).toEqual({
      params: ['newParam1', 'newParam2'],
      stack: [
        {
          currentPage: 'BUY_COINS_PAGE',
          params: ['newParam1', 'newParam2'],
        },
        notEmptyState.stack[0],
      ],
    });
  });
  test('Calling NAVIGATE_TO_WITH_PARAMS with a previuos state, no payload, must return current state', () => {
    const navigateToWParamsAction = {
      type: ActionType.NAVIGATE_TO_WITH_PARAMS,
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, navigateToWParamsAction)).toEqual(
      notEmptyState,
    );
  });
  test('Calling GO_BACK with a stack of 1, must remove the current stack element and return stack as empty array', () => {
    const goBackAction = {
      type: ActionType.GO_BACK,
    };
    const previousState = notEmptyState;
    expect(NavigationReducer(previousState, goBackAction)).toEqual({
      stack: [],
    });
  });
  test('Calling GO_BACK with a stack greater than 1, must remove the top of stack and return the next one as current and a previousParams array', () => {
    const goBackAction = {
      type: ActionType.GO_BACK,
    };
    const previousState = notEmptyState2InStack;
    expect(NavigationReducer(previousState, goBackAction)).toEqual({
      stack: [
        {
          currentPage: 'HOME_PAGE',
          params: ['param_home_page1', 'param_home_page2'],
          previousParams: ['param_confirmation_1', 'param_confirmation_2'],
        },
      ],
    });
  });
});

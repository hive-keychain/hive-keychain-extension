import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { Screen } from 'src/reference-data/screen.enum';

export interface NavigationState {
  stack: Navigation[];
  params?: any;
}

export interface Navigation {
  currentPage: Screen;
  params?: any;
  previousParams?: any;
}

export interface NavigatePayload {
  nextPage?: Screen;
  goBackTo?: Screen;
  params?: any;
  resetStack?: boolean;
}

export const NavigationReducer = (
  state: NavigationState = { stack: [] },
  { type, payload }: ActionPayload<NavigatePayload>,
): NavigationState => {
  switch (type) {
    case ActionType.RESET_NAV:
      return { stack: [], params: null };
    case ActionType.NAVIGATE_TO:
    case ActionType.NAVIGATE_TO_WITH_PARAMS:
      return navigateTo(state, payload);
    case ActionType.GO_BACK: {
      const newStack = state.stack;
      if (newStack.length > 1) {
        newStack[1].previousParams = newStack[0].params;
      }
      newStack.shift();
      return {
        stack: newStack,
      };
    }
    case ActionType.GO_BACK_TO_THEN_NAVIGATE: {
      const newStack = state.stack;
      const goBacktoPage = payload?.goBackTo ?? newStack[1].currentPage;

      console.log(newStack, goBacktoPage);

      do {
        if (newStack.length > 1) {
          newStack[1].previousParams = newStack[0].params;
        }
        newStack.shift();
        console.log(goBacktoPage, newStack[0].currentPage);
      } while (goBacktoPage !== newStack[0].currentPage);
      const test = navigateTo({ stack: newStack }, payload);
      console.log(test);
      return test;
    }
    default:
      return state;
  }
};

const navigateTo = (state: NavigationState, payload?: NavigatePayload) => {
  console.log(state, payload);
  let oldStack = state.stack;
  if (payload?.resetStack) {
    oldStack = [];
  }
  console.log(
    payload,
    payload?.nextPage,
    state.stack[0] && payload?.nextPage !== state.stack[0].currentPage,
    !state.stack[0],
    payload &&
      payload.nextPage &&
      ((state.stack[0] && payload.nextPage !== state.stack[0].currentPage) ||
        !state.stack[0]),
  );
  if (
    payload &&
    payload.nextPage &&
    ((state.stack[0] && payload.nextPage !== state.stack[0].currentPage) ||
      !state.stack[0])
  ) {
    console.log('add new page');
    return {
      stack: [
        { currentPage: payload.nextPage, params: payload.params },
        ...oldStack,
      ],
      params: payload.params,
    };
  } else {
    console.log('nothing to add');
    return state;
  }
};

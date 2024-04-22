import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
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
    case MultichainActionType.RESET_NAV:
      return { stack: [], params: null };
    case MultichainActionType.NAVIGATE_TO:
    case MultichainActionType.NAVIGATE_TO_WITH_PARAMS:
      return navigateTo(state, payload);
    case MultichainActionType.GO_BACK: {
      const newStack = state.stack;
      if (newStack.length > 1) {
        newStack[1].previousParams = newStack[0].params;
      }
      newStack.shift();
      return {
        stack: newStack,
      };
    }
    case MultichainActionType.GO_BACK_TO_THEN_NAVIGATE: {
      const newStack = state.stack;
      const goBacktoPage = payload?.goBackTo ?? newStack[1].currentPage;

      do {
        if (newStack.length > 1) {
          newStack[1].previousParams = newStack[0].params;
        }
        newStack.shift();
      } while (goBacktoPage !== newStack[0].currentPage);
      return navigateTo({ stack: newStack }, payload);
    }
    default:
      return state;
  }
};

const navigateTo = (state: NavigationState, payload?: NavigatePayload) => {
  let oldStack = state.stack;
  if (payload?.resetStack) {
    oldStack = [];
  }
  if (
    payload &&
    payload.nextPage &&
    ((state.stack[0] && payload.nextPage !== state.stack[0].currentPage) ||
      !state.stack[0])
  ) {
    return {
      stack: [
        { currentPage: payload.nextPage, params: payload.params },
        ...oldStack,
      ],
      params: payload.params,
    };
  } else {
    return state;
  }
};

import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';
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
    case ActionType.GO_BACK:
      const newStack = state.stack;
      if (newStack.length > 1) {
        newStack[1].previousParams = newStack[0].params;
      }
      newStack.shift();
      return {
        stack: newStack,
      };

    default:
      return state;
  }
};

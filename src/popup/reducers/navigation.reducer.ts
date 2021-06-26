import {ActionType} from '@popup/actions/action-type.enum';
import {actionPayload} from '@popup/actions/interfaces';
import {Screen} from 'src/reference-data/screen.enum';

export interface NavigationState {
  currentPage: Screen;
  params?: any;
}

export const NavigationReducer = (
  state: NavigationState = {currentPage: Screen.HOME_PAGE},
  {type, payload}: actionPayload<any>,
): NavigationState => {
  switch (type) {
    case ActionType.NAVIGATE_TO:
      return {...state, currentPage: payload!};
    case ActionType.NAVIGATE_TO_WITH_PARAMS:
      return {
        ...state,
        currentPage: payload.currentPage,
        params: payload.params,
      };
    default:
      return state;
  }
};

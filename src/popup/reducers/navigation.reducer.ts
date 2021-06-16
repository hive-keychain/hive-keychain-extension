import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload } from "@popup/actions/interfaces";
import { Screen } from "src/reference-data/screen.enum";

interface NavigationState {
  currentPage: Screen;
}


export const NavigationReducer = (
    state: NavigationState = {currentPage: Screen.HOME_PAGE},
    { type, payload }: actionPayload<any>
  ): NavigationState => {
    switch (type) {
      case ActionType.NAVIGATE_TO:
        return {...state, currentPage: payload!};
      default:
        return state;
    }
  };
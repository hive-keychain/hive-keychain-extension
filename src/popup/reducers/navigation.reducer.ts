import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload } from "@popup/actions/interfaces";
import { Screen } from "src/reference-data/screen.enum";


export const NavigationReducer = (
    state: Screen = Screen.HOME_PAGE,
    { type, payload }: actionPayload<Screen>
  ): Screen => {
    switch (type) {
      case ActionType.NAVIGATE_TO:
        return payload!;
      default:
        return state;
    }
  };
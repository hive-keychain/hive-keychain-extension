import { ActionType } from "./action-type.enum";
import { actionPayload } from "./interfaces";
import { Screen } from "src/reference-data/screen.enum";

export const navigateTo = (screen: Screen): actionPayload<Screen> => {
    return {
        type: ActionType.NAVIGATE_TO,
        payload: screen
    }
}
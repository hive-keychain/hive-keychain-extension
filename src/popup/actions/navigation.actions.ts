import { NavigatePayload } from '@popup/reducers/navigation.reducer';
import { Screen } from 'src/reference-data/screen.enum';
import { ActionType } from './action-type.enum';
import { actionPayload } from './interfaces';

export const resetNav = (): actionPayload<NavigatePayload> => {
  return { type: ActionType.RESET_NAV };
};

export const navigateTo = (
  screen: Screen,
  resetStack: boolean = false,
): actionPayload<NavigatePayload> => {
  return {
    type: ActionType.NAVIGATE_TO,
    payload: { nextPage: screen, resetStack },
  };
};

export const navigateToWithParams = (
  screen: Screen,
  params: any,
  resetStack: boolean = false,
): actionPayload<NavigatePayload> => {
  return {
    type: ActionType.NAVIGATE_TO_WITH_PARAMS,
    payload: { nextPage: screen, params, resetStack },
  };
};

export const goBack = (): actionPayload<NavigatePayload> => {
  return { type: ActionType.GO_BACK };
};

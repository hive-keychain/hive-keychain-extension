import { NavigatePayload } from '@popup/reducers/navigation.reducer';
import { Screen } from 'src/reference-data/screen.enum';
import { ActionType } from './action-type.enum';
import { ActionPayload } from './interfaces';

export const resetNav = (): ActionPayload<NavigatePayload> => {
  return { type: ActionType.RESET_NAV };
};

export const navigateTo = (
  screen: Screen,
  resetStack: boolean = false,
): ActionPayload<NavigatePayload> => {
  return {
    type: ActionType.NAVIGATE_TO,
    payload: { nextPage: screen, resetStack },
  };
};

export const navigateToWithParams = (
  screen: Screen,
  params: any,
  resetStack: boolean = false,
): ActionPayload<NavigatePayload> => {
  return {
    type: ActionType.NAVIGATE_TO_WITH_PARAMS,
    payload: { nextPage: screen, params, resetStack },
  };
};

export const goBack = (): ActionPayload<NavigatePayload> => {
  return { type: ActionType.GO_BACK };
};

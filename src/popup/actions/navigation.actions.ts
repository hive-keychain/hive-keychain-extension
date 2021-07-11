import { NavigationState } from '@popup/reducers/navigation.reducer';
import { Screen } from 'src/reference-data/screen.enum';
import { ActionType } from './action-type.enum';
import { actionPayload } from './interfaces';

export const navigateTo = (
  screen: Screen,
  secondaryScreen?: Screen,
): actionPayload<NavigationState> => {
  return {
    type: ActionType.NAVIGATE_TO,
    payload: { currentPage: screen, secondaryPage: secondaryScreen },
  };
};

export const navigateToSecondary = (
  secondaryScreen: Screen,
): actionPayload<NavigationState> => {
  return {
    type: ActionType.NAVIGATE_TO_SECONDARY,
    payload: { secondaryPage: secondaryScreen },
  };
};

export const navigateToWithParams = (
  screen: Screen,
  params: any,
  secondaryScreen?: Screen,
): actionPayload<NavigationState> => {
  return {
    type: ActionType.NAVIGATE_TO_WITH_PARAMS,
    payload: { currentPage: screen, secondaryPage: secondaryScreen, params },
  };
};

import {NavigationState} from '@popup/reducers/navigation.reducer';
import {Screen} from 'src/reference-data/screen.enum';
import {ActionType} from './action-type.enum';
import {actionPayload} from './interfaces';

export const navigateTo = (screen: Screen): actionPayload<Screen> => {
  return {
    type: ActionType.NAVIGATE_TO,
    payload: screen,
  };
};

export const navigateToWithParams = (
  screen: Screen,
  params: any,
): actionPayload<NavigationState> => {
  return {
    type: ActionType.NAVIGATE_TO_WITH_PARAMS,
    payload: {currentPage: screen, params},
  };
};

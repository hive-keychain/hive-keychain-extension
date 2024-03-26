import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { Screen } from 'src/reference-data/screen.enum';
import { ActionType } from '../../hive/actions/action-type.enum';
import { AppThunk } from './interfaces';

export type NavigationParams = ConfirmationPageParams | any;

export interface NavigationConfirmationPageParams {
  screen: Screen.CONFIRMATION_PAGE;
  params: ConfirmationPageParams;
  resetStack: boolean;
}

export const resetNav = (): AppThunk => async (dispatch, getState) => {
  dispatch({ type: ActionType.RESET_NAV });
};
export const navigateTo =
  (screen: Screen, resetStack: boolean = false): AppThunk =>
  async (dispatch, getState) => {
    // AnalyticsTracker.trackNav(screen);
    dispatch({
      type: ActionType.NAVIGATE_TO,
      payload: { nextPage: screen, resetStack },
    });
  };

export const navigateToWithParams =
  (
    screen: Screen,
    params: NavigationParams,
    resetStack: boolean = false,
  ): AppThunk =>
  async (dispatch, getState) => {
    // AnalyticsTracker.trackNav(screen);
    dispatch({
      type: ActionType.NAVIGATE_TO_WITH_PARAMS,
      payload: { nextPage: screen, params, resetStack },
    });
  };

export const goBack = (): AppThunk => async (dispatch, getState) => {
  dispatch({ type: ActionType.GO_BACK });
};

export const goBackToThenNavigate =
  (navigateTo: Screen, goBackTo?: Screen): AppThunk =>
  async (dispatch, getState) => {
    dispatch({
      type: ActionType.GO_BACK_TO_THEN_NAVIGATE,
      payload: { goBackTo, nextPage: navigateTo },
    });
  };

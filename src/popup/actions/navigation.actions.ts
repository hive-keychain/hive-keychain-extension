import { resetTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Screen } from 'src/reference-data/screen.enum';
import { ActionType } from './action-type.enum';
import { AppThunk } from './interfaces';

export const resetNav = (): AppThunk => async (dispatch, getState) => {
  dispatch(resetTitleContainerProperties());
  dispatch({ type: ActionType.RESET_NAV });
};
export const navigateTo =
  (screen: Screen, resetStack: boolean = false): AppThunk =>
  async (dispatch, getState) => {
    dispatch(resetTitleContainerProperties());
    dispatch({
      type: ActionType.NAVIGATE_TO,
      payload: { nextPage: screen, resetStack },
    });
  };
export const navigateToWithParams =
  (screen: Screen, params: any, resetStack: boolean = false): AppThunk =>
  async (dispatch, getState) => {
    dispatch(resetTitleContainerProperties());
    dispatch({
      type: ActionType.NAVIGATE_TO_WITH_PARAMS,
      payload: { nextPage: screen, params, resetStack },
    });
  };

export const goBack = (): AppThunk => async (dispatch, getState) => {
  dispatch(resetTitleContainerProperties());
  dispatch({ type: ActionType.GO_BACK });
};

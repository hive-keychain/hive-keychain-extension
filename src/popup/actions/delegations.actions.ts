import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/actions/interfaces';
import { setErrorMessage } from '@popup/actions/message.actions';
import { DelegationsPayload } from 'src/interfaces/delegations.interface';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

export const loadDelegators =
  (username: string): AppThunk =>
  async (dispatch) => {
    try {
      const action: ActionPayload<DelegationsPayload> = {
        type: ActionType.FETCH_DELEGATORS,
        payload: { incoming: await HiveUtils.getDelegators(username) },
      };
      dispatch(action);
    } catch (e) {
      const action: ActionPayload<DelegationsPayload> = {
        type: ActionType.FETCH_DELEGATORS,
        payload: { incoming: null },
      };
      dispatch(action);
      dispatch(
        setErrorMessage('popup_html_error_retrieving_incoming_delegations'),
      );
      Logger.error(e);
    }
  };

export const loadDelegatees =
  (username: string): AppThunk =>
  async (dispatch) => {
    try {
      const action: ActionPayload<DelegationsPayload> = {
        type: ActionType.FETCH_DELEGATEES,
        payload: { outgoing: await HiveUtils.getDelegatees(username) },
      };
      dispatch(action);
    } catch (e) {
      Logger.error(e);
    }
  };

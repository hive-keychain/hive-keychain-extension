import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload, AppThunk } from '@popup/actions/interfaces';
import { DelegationsPayload } from 'src/interfaces/delegations.interface';
import { getDelegatees, getDelegators } from 'src/utils/hive.utils';

export const loadDelegators =
  (username: string): AppThunk =>
  async (dispatch) => {
    try {
      const action: actionPayload<DelegationsPayload> = {
        type: ActionType.FETCH_DELEGATORS,
        payload: { incoming: await getDelegators(username) },
      };
      dispatch(action);
    } catch (e) {
      console.log(e);
    }
  };

export const loadDelegatees =
  (username: string): AppThunk =>
  async (dispatch) => {
    try {
      const action: actionPayload<DelegationsPayload> = {
        type: ActionType.FETCH_DELEGATEES,
        payload: { outgoing: await getDelegatees(username) },
      };
      dispatch(action);
    } catch (e) {
      console.log(e);
    }
  };

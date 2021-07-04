import {ActionType} from '@popup/actions/action-type.enum';
import {actionPayload} from '@popup/actions/interfaces';

export const MkReducer = (
  state = '',
  {type, payload}: actionPayload<string>,
): string => {
  switch (type) {
    case ActionType.SET_MK:
      return payload!;
    default:
      return state;
  }
};

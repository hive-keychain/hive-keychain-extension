import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

export const MkReducer = (
  state = '',
  { type, payload }: ActionPayload<string>,
): string => {
  switch (type) {
    case ActionType.SET_MK:
      console.log('setting mk'); //to remove ojo
      return payload!;
    default:
      return state;
  }
};

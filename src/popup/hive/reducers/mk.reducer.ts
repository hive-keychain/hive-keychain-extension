import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

export const MkReducer = (
  state = '',
  { type, payload }: ActionPayload<string>,
): string => {
  switch (type) {
    case ActionType.SET_MK:
      return payload!;
    default:
      return state;
  }
};

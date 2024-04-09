import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

export const MkReducer = (
  state = '',
  { type, payload }: ActionPayload<string>,
): string => {
  switch (type) {
    case MultichainActionType.SET_MK:
      return payload!;
    default:
      return state;
  }
};

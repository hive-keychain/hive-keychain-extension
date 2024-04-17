import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ModalProperties } from '@popup/multichain/interfaces/modal.interface';

export const ModalReducer = (
  state = null,
  { type, payload }: ActionPayload<ModalProperties>,
): ModalProperties | null => {
  switch (type) {
    case MultichainActionType.OPEN_MODAL: {
      return payload!;
    }

    case MultichainActionType.CLOSE_MODAL: {
      return null;
    }
    default:
      return state;
  }
};

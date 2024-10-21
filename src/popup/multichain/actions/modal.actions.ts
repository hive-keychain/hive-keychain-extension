import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ModalProperties } from '@popup/multichain/interfaces/modal.interface';

export const openModal = ({ children, title }: ModalProperties) => {
  return {
    type: MultichainActionType.OPEN_MODAL,
    payload: {
      title: title,
      children: children,
    },
  };
};

export const closeModal = () => {
  return {
    type: MultichainActionType.CLOSE_MODAL,
  };
};

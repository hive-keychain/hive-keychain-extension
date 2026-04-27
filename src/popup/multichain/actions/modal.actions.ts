import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ModalProperties } from '@popup/multichain/interfaces/modal.interface';

export const openModal = ({
  children,
  title,
  closeOnOverlayClick,
  showCloseButton,
}: ModalProperties) => {
  return {
    type: MultichainActionType.OPEN_MODAL,
    payload: {
      title: title,
      children: children,
      closeOnOverlayClick,
      showCloseButton,
    },
  };
};

export const closeModal = () => {
  return {
    type: MultichainActionType.CLOSE_MODAL,
  };
};

import React from 'react';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

interface ModalProps {
  children: JSX.Element | JSX.Element[];
  title: string;
}

export const ModalComponent = ({ children, title }: ModalProps) => {
  return (
    <PopupContainer className="modal-container">
      <div className="modal-title">{chrome.i18n.getMessage(title)}</div>
      <div className="modal-content">{children}</div>
    </PopupContainer>
  );
};

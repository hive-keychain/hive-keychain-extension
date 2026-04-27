import { closeModal } from '@popup/multichain/actions/modal.actions';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface ModalProps {
  children: JSX.Element | JSX.Element[];
  title?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const Modal = ({
  children,
  title,
  closeOnOverlayClick,
  showCloseButton,
  closeModal,
}: ModalProps & PropsFromRedux) => {
  return (
    <PopupContainer
      className="modal-container"
      onClickOutside={closeOnOverlayClick ? closeModal : undefined}>
      {(title || showCloseButton) && (
        <div className="modal-header">
          {title && (
            <div className="modal-title">{chrome.i18n.getMessage(title)}</div>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-button"
              aria-label={chrome.i18n.getMessage('popup_html_close')}
              onClick={closeModal}>
              <SVGIcon icon={SVGIcons.TOP_BAR_CLOSE_BTN} />
            </button>
          )}
        </div>
      )}
      <div className="modal-content">{children}</div>
    </PopupContainer>
  );
};

const connector = connect(null, {
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const ModalComponent = connector(Modal);

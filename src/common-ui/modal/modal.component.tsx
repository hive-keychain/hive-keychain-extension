import { closeModal } from '@popup/multichain/actions/modal.actions';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

export interface ModalProps {
  children: JSX.Element | JSX.Element[];
  title?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  showOverlay?: boolean;
  useBodyPortal?: boolean;
  containerClassName?: string;
}

export type ModalPresentationProps = ModalProps & {
  onClose: () => void;
};

export const ModalPresentation = ({
  children,
  title,
  closeOnOverlayClick,
  showCloseButton,
  showOverlay,
  useBodyPortal,
  containerClassName,
  onClose,
}: ModalPresentationProps) => {
  return (
    <PopupContainer
      className={`modal-container${containerClassName ? ` ${containerClassName}` : ''}`}
      showOverlay={showOverlay}
      useBodyPortal={useBodyPortal}
      onClickOutside={closeOnOverlayClick ? onClose : undefined}>
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
              onClick={onClose}>
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

const ModalConnected = (props: ModalProps & PropsFromRedux) => {
  const { closeModal: closeModalAction, ...rest } = props;
  return <ModalPresentation {...rest} onClose={closeModalAction} />;
};

export const ModalComponent = connector(ModalConnected);

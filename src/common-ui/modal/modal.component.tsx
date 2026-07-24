import { closeModal } from '@popup/multichain/actions/modal.actions';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
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

let modalId = 0;

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
  const [titleId] = useState(() => `modal-title-${++modalId}`);
  const canCloseWithEscape = !(
    closeOnOverlayClick === false && showCloseButton === false
  );

  return (
    <PopupContainer
      className={`modal-container${containerClassName ? ` ${containerClassName}` : ''}`}
      showOverlay={showOverlay}
      useBodyPortal={useBodyPortal}
      onClickOutside={closeOnOverlayClick ? onClose : undefined}
      onEscape={canCloseWithEscape ? onClose : undefined}
      initialFocusSelector=".modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}>
      {(title || showCloseButton) && (
        <div className="modal-header">
          {title && (
            <div id={titleId} className="modal-title">
              {I18nUtils.getMessage(title)}
            </div>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-button"
              aria-label={I18nUtils.getMessage('popup_html_close')}
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

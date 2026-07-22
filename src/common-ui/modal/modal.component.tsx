import { closeModal } from '@popup/multichain/actions/modal.actions';
import React, { useEffect, useRef, useState } from 'react';
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

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );

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
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [titleId] = useState(() => `modal-title-${++modalId}`);
  const canCloseWithEscape = !(
    closeOnOverlayClick === false && showCloseButton === false
  );

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as
      | HTMLElement
      | null;
    const animationFrame = requestAnimationFrame(() => {
      const content = modalRef.current?.querySelector<HTMLElement>(
        '.modal-content',
      );
      const firstContentElement = content
        ? getFocusableElements(content)[0]
        : undefined;
      const firstModalElement = modalRef.current
        ? getFocusableElements(modalRef.current)[0]
        : undefined;
      (firstContentElement ?? firstModalElement ?? modalRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      previouslyFocusedElement?.focus();
    };
  }, []);

  const handleModalKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && canCloseWithEscape) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !modalRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(modalRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      event.preventDefault();
      modalRef.current.focus();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <PopupContainer
      ref={modalRef}
      className={`modal-container${containerClassName ? ` ${containerClassName}` : ''}`}
      showOverlay={showOverlay}
      useBodyPortal={useBodyPortal}
      onClickOutside={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
      onKeyDown={handleModalKeyDown}>
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

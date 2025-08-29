import { Message } from '@interfaces/message.interface';
import { MessageType } from '@reference-data/message-type.enum';
import React, { useEffect } from 'react';
import sanitizeHTML from 'sanitize-html';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const DEFAULT_TIMEOUT = 3000;

interface MessageContainerProps {
  message: Message;
  onResetMessage: () => void;
}

const MessageContainer = ({
  message,
  onResetMessage,
}: MessageContainerProps) => {
  useEffect(() => {
    if (
      message.type !== MessageType.ERROR &&
      message.type !== MessageType.WARNING
    ) {
      setTimeout(() => close(), DEFAULT_TIMEOUT);
    }
  }, []);

  const close = () => {
    onResetMessage();
  };

  const onConfirm = () => {
    if (message.confirmation && message.confirmation.onConfirm) {
      message.confirmation.onConfirm();
      onResetMessage();
    }
  };
  const onCancel = () => {
    if (message.confirmation && message.confirmation.onCancel) {
      message.confirmation.onCancel();
      onResetMessage();
    }
  };

  const getIcon = (errorType: MessageType) => {
    switch (errorType) {
      case MessageType.SUCCESS:
        return SVGIcons.MESSAGE_SUCCESS;
      case MessageType.ERROR:
        return SVGIcons.MESSAGE_ERROR;
      case MessageType.WARNING:
        return SVGIcons.MESSAGE_WARNING;
      default:
        return SVGIcons.MESSAGE_SUCCESS;
    }
  };

  const getTitle = (messageType: MessageType) => {
    switch (messageType) {
      case MessageType.SUCCESS:
        return 'message_container_title_success';
      case MessageType.ERROR:
        return 'message_container_title_fail';
      case MessageType.WARNING:
        return 'message_container_title_warning';
      default:
        return 'message_container_title_success';
    }
  };

  return (
    <div className="message-container">
      <div className="overlay"></div>
      <div className="message-card">
        <SVGIcon icon={getIcon(message.type)} />
        <div
          className={`title ${
            message.type === MessageType.SUCCESS ? 'success' : ''
          }`}>
          {chrome.i18n.getMessage(getTitle(message.type))}
        </div>
        <div
          className="message"
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(
              message.skipTranslation
                ? message.key
                : chrome.i18n.getMessage(message.key, message.params),
              { allowedTags: ['b', 'br', 'i', 'p', 'span', 'div'] },
            ),
          }}></div>
        {message.confirmation === undefined && (
          <ButtonComponent
            additionalClass={
              message.type === MessageType.SUCCESS ? 'success-button' : ''
            }
            label="message_container_close_button"
            onClick={close}
          />
        )}
        {message.confirmation && (
          <div className="confirmation-container">
            <ButtonComponent
              type={ButtonType.ALTERNATIVE}
              label="popup_html_button_label_cancel"
              onClick={() => onCancel()}
            />
            <ButtonComponent
              label="popup_html_confirm"
              onClick={() => onConfirm()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const MessageContainerComponent = MessageContainer;

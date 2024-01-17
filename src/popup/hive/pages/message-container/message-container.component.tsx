import { MessageType } from '@reference-data/message-type.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { resetMessage } from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';

const DEFAULT_TIMEOUT = 3000;

const MessageContainer = ({ errorMessage, resetMessage }: PropsFromRedux) => {
  useEffect(() => {
    if (errorMessage.type !== MessageType.ERROR) {
      setTimeout(() => close(), DEFAULT_TIMEOUT);
    }
  }, []);

  const close = () => {
    resetMessage();
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

  const getTitle = (errorType: MessageType) => {
    switch (errorType) {
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
        <SVGIcon icon={getIcon(errorMessage.type)} />
        <div className="title">
          {chrome.i18n.getMessage(getTitle(errorMessage.type))}
        </div>
        <div
          className="message"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage(
              errorMessage.key,
              errorMessage.params,
            ),
          }}></div>
        <ButtonComponent
          label="message_container_close_button"
          onClick={close}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    errorMessage: state.errorMessage,
  };
};

const connector = connect(mapStateToProps, { resetMessage });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MessageContainerComponent = connector(MessageContainer);

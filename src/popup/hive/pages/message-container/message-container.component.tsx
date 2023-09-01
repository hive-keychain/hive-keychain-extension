import { MessageType } from '@reference-data/message-type.enum';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import ButtonComponent from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { resetMessage } from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';

const MessageContainer = ({ errorMessage, resetMessage }: PropsFromRedux) => {
  const close = () => {
    resetMessage();
  };

  const getIcon = (errorType: MessageType) => {
    switch (errorType) {
      case MessageType.SUCCESS:
        return NewIcons.MESSAGE_SUCCESS;
      case MessageType.ERROR:
        return NewIcons.MESSAGE_ERROR;
      default:
        return NewIcons.MESSAGE_SUCCESS;
    }
  };

  const getTitle = (errorType: MessageType) => {
    switch (errorType) {
      case MessageType.SUCCESS:
        return 'message_container_title_success';
      case MessageType.ERROR:
        return 'message_container_title_fail';
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

import { resetMessage } from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import { MessageType } from '@reference-data/message-type.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './message-container.component.scss';

const DURATION = 5000;

const MessageContainer = ({ errorMessage, resetMessage }: PropsFromRedux) => {
  const [timeoutId, setTimeoutId] = useState<any>();
  useEffect(() => {
    if (errorMessage.key) {
      console.log(errorMessage);
      switch (errorMessage.type) {
        case MessageType.ERROR:
          console.log('toast opening');
          toast.error(
            chrome.i18n.getMessage(errorMessage.key, errorMessage.params),
          );
          break;
        case MessageType.SUCCESS:
          toast.success(
            chrome.i18n.getMessage(errorMessage.key, errorMessage.params),
          );
          break;
        case MessageType.WARNING:
          toast.warning(
            chrome.i18n.getMessage(errorMessage.key, errorMessage.params),
          );
          break;
        case MessageType.INFO:
          toast.info(
            chrome.i18n.getMessage(errorMessage.key, errorMessage.params),
          );
          break;
      }

      const id = setTimeout(() => {
        close();
      }, DURATION);
      setTimeoutId(id);
    }
  }, [errorMessage]);

  const close = () => {
    resetMessage();
    clearTimeout(timeoutId);
    console.log('toaster closed!');
  };

  return (
    <ToastContainer
      position="bottom-center"
      autoClose={DURATION}
      pauseOnHover
      theme="dark"
      onClick={() => {
        close();
      }}
      closeOnClick={true}
      draggable={false}
      bodyStyle={{ fontSize: '16px', fontFamily: 'Futura', fontWeight: '400' }}
    />
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

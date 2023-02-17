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
      switch (errorMessage.type) {
        case MessageType.ERROR:
          toast.error(
            <div
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage(
                  errorMessage.key,
                  errorMessage.params,
                ),
              }}></div>,
          );
          break;
        case MessageType.SUCCESS:
          toast.success(
            <div
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage(
                  errorMessage.key,
                  errorMessage.params,
                ),
              }}></div>,
          );
          break;
        case MessageType.WARNING:
          toast.warning(
            <div
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage(
                  errorMessage.key,
                  errorMessage.params,
                ),
              }}></div>,
          );
          break;
        case MessageType.INFO:
          toast.info(
            <div
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage(
                  errorMessage.key,
                  errorMessage.params,
                ),
              }}></div>,
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
      style={{
        maxHeight: 'unset',
      }}
      toastStyle={{
        maxHeight: 'unset',
      }}
      bodyStyle={{
        fontSize: '16px',
        fontFamily: 'Futura',
        fontWeight: '400',
        maxHeight: 'unset',
      }}
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

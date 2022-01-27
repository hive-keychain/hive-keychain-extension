import { resetMessage } from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './message-container.component.scss';

const DURATION = 20;

const MessageContainer = ({ errorMessage, resetMessage }: PropsFromRedux) => {
  const [timeoutId, setTimeoutId] = useState<any>();
  const [isFull, setIsFull] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [intervalId, setIntervalId] = useState<any>();
  useEffect(() => {
    if (errorMessage.key) {
      const step = 100 / DURATION;
      const int = setInterval(() => {
        console.log('progress val', progressVal);
        console.log(progressVal + step);
        setProgressVal(progressVal + step);
      }, 1000);
      setIntervalId(int);

      const to = setTimeout(() => {
        console.log('ici');
        clearInterval(intervalId);
        resetMessage();
        setProgressVal(0);
      }, DURATION * 1000);
      setTimeoutId(to);
    }
  }, [errorMessage]);

  const close = () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    resetMessage();
    setProgressVal(0);
  };

  return (
    <div className="message-container" onClick={() => close()}>
      {errorMessage.key.length > 0 && (
        <div className={`container ${errorMessage.type}`}>
          {/* <div className="barHolder">
            <div className={`bar ${isFull ? 'full' : ''}`}></div>
          </div> */}
          <progress value={progressVal} max="100"></progress>

          <div className="message">
            {chrome.i18n.getMessage(errorMessage.key, errorMessage.params)}
          </div>
        </div>
      )}
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

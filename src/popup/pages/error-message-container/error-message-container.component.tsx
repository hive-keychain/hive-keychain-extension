import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React, { useEffect, useState } from "react";
import { resetErrorMessage } from "@popup/actions/error-message.actions";
import "./error-message-container.component.css";

const ErrorMessageContainer = ({errorMessage, resetErrorMessage}: PropsFromRedux) => {
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  useEffect(() => {
    if(errorMessage.key){
      setProgressBarWidth(100)
      setTimeout(() => {
        resetErrorMessage();
        setProgressBarWidth(0)
      }, 5000);
    }
  }, [errorMessage])
    return (
      <div>
        { errorMessage.key.length > 0 &&
        <div className="error-container">
          <div className="barHolder" >
            <div className="bar" style={{"width" : progressBarWidth + '%'}}></div>
          </div>
          <div className="error-message">
              {chrome.i18n.getMessage(errorMessage.key, errorMessage.params)}
          </div>
        </div> 
        }
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
        errorMessage: state.errorMessage,
    };
  };
  
  const connector = connect(mapStateToProps, { resetErrorMessage });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const ErrorMessageContainerComponent = connector(ErrorMessageContainer);
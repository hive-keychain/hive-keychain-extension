import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";

const SignUp = ({}: PropsFromRedux) => {
  
    return (
      <div className="sign-up-page">
          
          Sign Up
  
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const SignUpComponent = connector(SignUp);
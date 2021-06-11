import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";

const SignIn = ({}: PropsFromRedux) => {
  
    return (
      <div className="sign-in-page">
          
          Sign In
  
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const SignInComponent =  connector(SignIn);
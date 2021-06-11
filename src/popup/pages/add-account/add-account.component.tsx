import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";

const AddAccount  = ({}: PropsFromRedux) => {
  
    return (
      <div className="add-account-page">
          
          Add Account
  
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const AddAccountComponent =  connector(AddAccount);
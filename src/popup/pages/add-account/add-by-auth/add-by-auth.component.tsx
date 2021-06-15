import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import './add-by-auth.component.css';

const AddByAuth = ({}: PropsFromRedux) => {
  
    return (
      <div className="add-by-auth-page">
          Add by auth
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const AddByAuthComponent = connector(AddByAuth);
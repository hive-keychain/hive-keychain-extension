import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import './import-keys.component.css';

const ImportKeys = ({}: PropsFromRedux) => {
  
    return (
      <div className="import-keys-page">
          Import keys
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const ImportKeysComponent = connector(ImportKeys);
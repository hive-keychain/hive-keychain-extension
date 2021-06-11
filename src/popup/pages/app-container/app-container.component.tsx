import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import { HomeComponent } from "./home/home.component";

const AppContainer = ({}: PropsFromRedux) => {
  
    return (
      <div className="app-container">
          AppContainer
          <HomeComponent/>
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const AppContainerComponent = connector(AppContainer);
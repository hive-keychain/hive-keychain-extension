import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";

const Home = ({}: PropsFromRedux) => {
  
    return (
      <div className="home-page">
          
          Home
  
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const HomeComponent = connector(Home);
  
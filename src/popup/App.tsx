import { setMsg } from "@popup/actions";
import { RootState } from "@popup/store";
import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./App.css";

const App = ({ setMsg, msg }: PropsFromRedux) => {
  // just for testing action/reducer, you can delete
  useEffect(() => {
    setMsg("hello");
  }, [setMsg]);

  return (
    <div className="App">
      <div>{msg}</div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    msg: state.testMsg,
  };
};

const connector = connect(mapStateToProps, { setMsg });
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);

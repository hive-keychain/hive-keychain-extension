import { setMsg } from "@popup/actions";
import { RootState } from "@popup/store";
import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";

const App = ({ setMsg, msg }: PropsFromRedux) => {
  // just for testing action/reducer, you can delete
  useEffect(() => {
    setMsg("yo");
  }, [setMsg]);

  return (
    <div className="App">
      <h1>{msg}</h1>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  console.log(state);
  return {
    msg: state.testMsg,
  };
};

const connector = connect(mapStateToProps, { setMsg });
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);

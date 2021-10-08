import React, { useEffect } from 'react';
import './dialog.scss';
const App = () => {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (
      { msg, accounts, command, data, tab, domain, request_id, testnet },
      sender,
      sendResp,
    ) {});
  }, []);

  return (
    <div className="dialog">
      <h1> Hello, World from dialog! </h1>
    </div>
  );
};

export default App;

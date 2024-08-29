import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import './evm-dapp-status.component.scss';

const EvmDappStatus = () => {
  const [dapp, setDapp] = useState<chrome.tabs.Tab>();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      setDapp(activeTab);
    });
  }, []);

  return (
    <div className="evm-dapp-status-container">
      <img src={dapp?.favIconUrl} />
      <div className="indicator"></div>
    </div>
  );
};

const connector = connect();
export const EvmDappStatusComponent = connector(EvmDappStatus);

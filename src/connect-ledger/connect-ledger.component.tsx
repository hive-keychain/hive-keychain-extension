import React, { useEffect } from 'react';
import { LedgerUtils } from 'src/utils/ledger.utils';
import './connect-ledger.component.scss';

const ConnectLedger = () => {
  useEffect(() => {
    initializeLedger();
  }, []);

  const initializeLedger = async () => {
    if (!(await LedgerUtils.detect())) {
      console.log('error while init liedger');
      return;
    } else {
      console.log('ledger detected');
    }
  };

  return (
    <div className="connect-ledger">
      <div className="title-panel">
        <img src="/assets/images/iconhive.png" />
        toto
        <div className="title">
          {chrome.i18n.getMessage('html_connect_ledger')}
        </div>
      </div>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('hello'),
        }}></div>
    </div>
  );
};

export default ConnectLedger;

import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import './connect-ledger.component.scss';

const ConnectLedger = () => {
  const initializeLedger = async () => {
    try {
      if (await LedgerUtils.detect()) {
      } else {
        return;
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <div className="connect-ledger">
      <div className="title-panel">
        <img src="/assets/images/iconhive.png" />
        <ButtonComponent
          label="detect"
          skipLabelTranslation
          onClick={initializeLedger}
        />
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

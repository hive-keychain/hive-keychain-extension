import React, { useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import './link-device.component.scss';

const LinkLedgerDevice = () => {
  const [done, setDone] = useState(false);

  const linkDevice = async () => {
    setDone(await LedgerUtils.init(true));
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <div className="link-ledger-device">
      <div className="title-panel">
        <img src="/assets/images/iconhive.png" />
        <div className="title">
          {chrome.i18n.getMessage('ledger_link_device')}
        </div>
      </div>

      <div className="link-device">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('ledger_link_device_caption'),
          }}></div>
        {done ? chrome.i18n.getMessage('ledger_link_device_linked') : ''}
        <div className="fill-space"></div>

        <ButtonComponent
          label={done ? 'popup_html_close' : 'ledger_link_device'}
          onClick={done ? closeTab : linkDevice}
        />
      </div>
      {/* <LoadingComponent hide={!loading} /> */}
    </div>
  );
};

export default LinkLedgerDevice;

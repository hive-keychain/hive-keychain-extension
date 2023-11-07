import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const LinkLedgerDevice = () => {
  const [done, setDone] = useState(false);

  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  const linkDevice = async () => {
    setDone(await LedgerUtils.init(true));
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <div className={`theme ${theme} link-ledger-device`}>
      <div className="title-panel">
        <SVGIcon icon={NewIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">
          {chrome.i18n.getMessage('ledger_link_device')}
        </div>
      </div>

      <div className="link-ledger-device">
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
          height="small"
          type={ButtonType.IMPORTANT}
        />
      </div>
      {/* <LoadingComponent hide={!loading} /> */}
    </div>
  );
};

export default LinkLedgerDevice;
